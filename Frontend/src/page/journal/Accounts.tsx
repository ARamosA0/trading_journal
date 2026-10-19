import { useContext, useEffect, useState } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';
import { createAccount, deleteAccount, getAccounts, selectAccount, updateAccount, getSelectedAccountId, type Account } from '../../api/accounts';

type AccountForm = {
  name: string;
  broker: string;
  balance: string;
  currency: string;
  state: Account['state'];
};

const emptyForm: AccountForm = { name: '', broker: '', balance: '', currency: 'USD', state: 'ACTIVE' };

function initials(value: string) {
  return value.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AC';
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
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

  return (
    <section className="space-y-6">
      {error && <p className="rounded-lg border border-[var(--red)] bg-[var(--red-dim)] px-4 py-3 text-sm text-[var(--red)]" role="alert">{error}</p>}
      <div className="flex items-end justify-between border-b border-[var(--border)] pb-5"><div><p className="text-sm font-medium text-[var(--text)]">Capital map</p><p className="mt-1 text-xs text-[var(--text3)]">{accounts.length} connected accounts · balances tracked by currency</p></div></div>
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
