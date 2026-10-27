import { useContext, useEffect, useState } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';
import { useRef } from 'react';
import { readSheet } from 'read-excel-file/browser';
import { createAccount, deleteAccount, getAccounts, selectAccount, updateAccount, getSelectedAccountId, type Account } from '../../api/accounts';
import { importTrades, type ImportedTrade } from '../../api/trades';

type AccountForm = {
  name: string;
  broker: string;
  balance: string;
  currency: string;
  state: Account['state']
};

const emptyForm: AccountForm = { name: '', broker: '', balance: '', currency: 'USD', state: 'ACTIVE' };

function initials(value: string) {
  return value.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AC';
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
}

type SimpleFxRow = Record<string, unknown>;

function rowValue(row: SimpleFxRow, name: string) {
  const key = Object.keys(row).find((candidate) => candidate.trim().toLowerCase() === name.toLowerCase());
  return key == null ? '' : row[key];
}

function parseNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = String(value ?? '').trim().replaceAll(',', '');
  if (!normalized || normalized === '-') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 19);
  const text = String(value ?? '').trim();
  if (!text || text === '-') return null;
  const match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}T${match[4]}:${match[5]}:${match[6]}`;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 19);
}

function parseSimpleFx(rows: SimpleFxRow[]): { trades: ImportedTrade[]; rejected: string[] } {
  const trades: ImportedTrade[] = [];
  const rejected: string[] = [];
  rows.forEach((row, index) => {
    const symbol = String(rowValue(row, 'Symbol')).trim();
    const side = String(rowValue(row, 'Side')).trim();
    const size = parseNumber(rowValue(row, 'Size'));
    const closeAt = parseDate(rowValue(row, 'Close Time'));
    const openAt = parseDate(rowValue(row, 'Open Time')) ?? closeAt;
    const openPrice = parseNumber(rowValue(row, 'Open Price'));
    const closePrice = parseNumber(rowValue(row, 'Close price'));
    const takeProfit = parseNumber(rowValue(row, 'Take Profit'));
    const stopLoss = parseNumber(rowValue(row, 'Stop Loss'));
    const profitUsd = parseNumber(rowValue(row, 'Profit (USD)')) ?? 0;
    const errors: string[] = [];
    if (!symbol) errors.push('Symbol');
    if (!side) errors.push('Side');
    if (size == null || size <= 0) errors.push('Size');
    if (!openAt) errors.push('Open Time');
    if (openPrice == null || openPrice <= 0) errors.push('Open Price');
    if (errors.length > 0) {
      rejected.push(`Row ${index + 2}: missing or invalid ${errors.join(', ')}`);
      return;
    }
    trades.push({ symbol, side, size: size as number, openAt: openAt as string, closeAt, openPrice: openPrice as number, closePrice, takeProfit, stopLoss, profitUsd });
  });
  return { trades, rejected };
}

function csvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '"' && text[index + 1] === '"' && quoted) {
      value += '"';
      index++;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index++;
      row.push(value);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }
  row.push(value);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  return rows;
}

function rowsToObjects(rows: unknown[][]): SimpleFxRow[] {
  const headers = rows[0]?.map((header) => String(header ?? '').trim()) ?? [];
  return rows.slice(1).map((values) => headers.reduce<SimpleFxRow>((result, header, index) => {
    result[header] = values[index] ?? '';
    return result;
  }, {}));
}

async function readImportRows(file: File) {
  if (file.name.toLowerCase().endsWith('.csv')) {
    return rowsToObjects(csvRows(await file.text()));
  }
  return rowsToObjects(await readSheet(file));
}

function Accounts() {
  const { setHeader } = useContext(HeaderContext);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(() => getSelectedAccountId());

  useEffect(() => {
    let active = true;
    getAccounts()
      .then((data) => {
        if (!active) return;
        setAccounts(data);
        if (!getSelectedAccountId() && data[0]) {
          selectAccount(data[0].id);
          setSelectedAccountId(data[0].id);
        }
      })
      .catch(() => { if (active) setError('Could not load accounts.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setHeader({ title: 'Accounts', subtitle: 'Keep balances and performance grouped by venue.', action: <button type="button" onClick={() => openCreate()}>Add account</button> });
  }, [setHeader]);

  const update = (field: keyof AccountForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setIsModalOpen(true);
  }

  function handleSelect(account: Account) {
    selectAccount(account.id);
    setSelectedAccountId(account.id);
  }

  function openEdit(account: Account) {
    setEditingId(account.id);
    setForm({ name: account.name, broker: account.broker, balance: account.balance.toString(), currency: account.currency, state: account.state });
    setError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const input = { name: form.name, broker: form.broker, balance: Number(form.balance) || 0, currency: form.currency, state: form.state };
      const account = editingId ? await updateAccount(editingId, input) : await createAccount(input);
      setAccounts((current) => editingId ? current.map((item) => item.id === account.id ? account : item) : [account, ...current]);
      closeModal();
    } catch {
      setError('Could not save the account. Check the values and try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(account: Account) {
    if (!window.confirm(`Archive ${account.name}?`)) return;
    try {
      await deleteAccount(account.id);
      setAccounts((current) => current.filter((item) => item.id !== account.id));
    } catch {
      setError('Could not archive the account.');
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    const selectedAccount = accounts.find((account) => account.id === selectedAccountId);
    if (!file || !selectedAccount) {
      setError('Select an account before importing trades.');
      return;
    }
    setError('');
    setImportMessage('Reading file…');
    try {
      const rows = await readImportRows(file);
      const parsed = parseSimpleFx(rows);
      if (parsed.trades.length === 0) {
        setError(`No valid trades found. ${parsed.rejected.slice(0, 3).join(' · ')}`);
        setImportMessage('');
        return;
      }
      const result = await importTrades(selectedAccount.id, parsed.trades);
      setImportMessage(`Imported ${result.imported} trades${result.rejected + parsed.rejected.length > 0 ? ` · rejected ${result.rejected + parsed.rejected.length}` : ''}.`);
      if (result.rejected > 0 || parsed.rejected.length > 0) setError([...parsed.rejected, ...result.errors].slice(0, 3).join(' · '));
      const refreshed = await getAccounts();
      setAccounts(refreshed);
    } catch {
      setError('Could not import the file. Use the SimpleFX CSV or XLSX format. Legacy XLS files are not supported.');
      setImportMessage('');
    }
  }

  return (
    <section className="space-y-6">
      {error && <p className="rounded-lg border border-[var(--red)] bg-[var(--red-dim)] px-4 py-3 text-sm text-[var(--red)]" role="alert">{error}</p>}
      <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-[var(--text)]">Capital map</p><p className="mt-1 text-xs text-[var(--text3)]">{accounts.length} connected accounts · balances tracked by currency</p></div><div className="flex flex-wrap gap-2"><input ref={fileInput} type="file" accept=".csv,.xlsx" onChange={(event) => void handleImport(event)} className="hidden" /><button type="button" disabled={!selectedAccountId || isLoading} onClick={() => fileInput.current?.click()} className="rounded-lg border border-[var(--border2)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50">Import SimpleFX</button></div></div>
      {importMessage && <p className="text-sm text-[var(--green)]" role="status">{importMessage}</p>}
      <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] lg:grid-cols-2">
        {isLoading ? <div className="bg-[var(--surface)] p-6 text-sm text-[var(--text3)]">Loading accounts…</div> : accounts.map((account) => <article key={account.id} className="bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border2)] bg-[var(--bg3)] text-xs font-bold tracking-wide text-[var(--accent)]">{initials(account.broker)}</div><div><h2 className="font-medium text-[var(--text)]">{account.name}</h2><p className="mt-1 text-xs text-[var(--text3)]">{account.broker} · {account.currency} · {account.state.toLowerCase()}</p></div></div><span className="journal-number text-lg font-semibold text-[var(--text)]">{money(account.netBalance, account.currency)}</span></div>
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text3)]">Trades</p><p className="journal-number mt-1 text-sm text-[var(--text)]">{account.trades}</p></div><div><p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text3)]">Win rate</p><p className="journal-number mt-1 text-sm text-[var(--green)]">{account.winRate.toFixed(1)}%</p></div></div>
          <div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => handleSelect(account)} className={`rounded-md border px-3 py-2 text-xs font-semibold ${selectedAccountId === account.id ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]' : 'border-[var(--border2)] text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}>{selectedAccountId === account.id ? 'Selected dashboard account' : 'Use on dashboard'}</button><button type="button" onClick={() => openEdit(account)} className="rounded-md border border-[var(--border2)] px-3 py-2 text-xs text-[var(--text2)] hover:border-[var(--text3)] hover:text-[var(--text)]">Edit</button><button type="button" onClick={() => void handleDelete(account)} className="rounded-md border border-[var(--red)] px-3 py-2 text-xs text-[var(--red)] hover:bg-[var(--red-dim)]">Archive</button></div>
        </article>)}
        <button type="button" onClick={openCreate} className="flex min-h-44 items-center justify-center border-t border-dashed border-[var(--border2)] bg-[var(--surface)] p-6 text-center text-[var(--text2)] transition hover:bg-[var(--bg3)] lg:border-t-0 lg:border-l"><span><span className="block text-2xl font-light text-[var(--accent)]">+</span><span className="mt-2 block text-sm">Add another account</span><span className="mt-1 block text-xs text-[var(--text3)]">Connect a broker or exchange manually</span></span></button>
      </div>

      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title"><button type="button" aria-label="Close dialog" className="absolute inset-0 cursor-default bg-black/70" onClick={closeModal} /><form onSubmit={handleSubmit} className="relative z-10 w-full max-w-lg rounded-xl border border-[var(--border2)] bg-[var(--surface)] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">Workspace</p><h2 id="account-dialog-title" className="mt-2 text-xl font-semibold text-[var(--text)]">{editingId ? 'Edit account' : 'Add account'}</h2></div><button type="button" aria-label="Close dialog" onClick={closeModal} className="text-xl text-[var(--text3)] hover:text-[var(--text)]">×</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs text-[var(--text2)]">Account name<input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Broker — account" className="mt-2" /></label><label className="text-xs text-[var(--text2)]">Broker<input required value={form.broker} onChange={(event) => update('broker', event.target.value)} placeholder="SimpleFX" className="mt-2" /></label><label className="text-xs text-[var(--text2)]">Balance<input required type="number" min="0" step="0.01" value={form.balance} onChange={(event) => update('balance', event.target.value)} placeholder="0.00" className="journal-number mt-2" /></label><label className="text-xs text-[var(--text2)]">Currency<input required maxLength={3} value={form.currency} onChange={(event) => update('currency', event.target.value.toUpperCase())} placeholder="USD" className="mt-2 uppercase" /></label><label className="text-xs text-[var(--text2)] sm:col-span-2">Status<select value={form.state} onChange={(event) => update('state', event.target.value)} className="mt-2"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="ARCHIVED">Archived</option></select></label></div><div className="mt-7 flex justify-end gap-3 border-t border-[var(--border)] pt-5"><button type="button" onClick={closeModal} className="rounded-lg border border-[var(--border2)] bg-[var(--bg3)] px-4 py-2.5 text-sm text-[var(--text2)]">Cancel</button><button type="submit" disabled={isSaving} className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#061016] disabled:opacity-60">{isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Add account'}</button></div></form></div>}
    </section>
  );
}

export default Accounts;
