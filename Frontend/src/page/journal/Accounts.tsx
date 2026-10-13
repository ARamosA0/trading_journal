import { useContext, useEffect, useState } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';

type Account = { id: number; logo: string; name: string; type: string; trades: number; winRate: number; balance: string };
const initialAccounts: Account[] = [
  { id: 1, logo: 'SF', name: 'SimpleFx — Main', type: 'Forex & CFDs · Personal', trades: 86, winRate: 72, balance: '$32,480.00' },
  { id: 2, logo: 'BG', name: 'Bitget — Futures', type: 'Crypto derivatives · Personal', trades: 38, winRate: 61, balance: '$15,872.80' },
];

function Accounts() {
  const { setHeader } = useContext(HeaderContext);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ logo: '', name: '', type: '', trades: '', winRate: '', balance: '' });

  useEffect(() => { setHeader({ title: 'Accounts', subtitle: 'Keep balances and performance grouped by venue.', action: <button type="button" onClick={() => setIsModalOpen(true)}>Add account</button> }); }, [setHeader]);
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setAccounts((current) => [{ id: Date.now(), logo: form.logo.toUpperCase() || 'AC', name: form.name || 'New account', type: form.type || 'Personal', trades: Number(form.trades) || 0, winRate: Number(form.winRate) || 0, balance: form.balance || '$0.00' }, ...current]);
    setIsModalOpen(false);
    setForm({ logo: '', name: '', type: '', trades: '', winRate: '', balance: '' });
  };

  return <section className="space-y-6">
    <div className="flex items-end justify-between border-b border-[var(--border)] pb-5"><div><p className="text-sm font-medium text-[var(--text)]">Capital map</p><p className="mt-1 text-xs text-[var(--text3)]">{accounts.length} connected accounts · $48,352.80 tracked</p></div></div>
    <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] lg:grid-cols-2">
      {accounts.map((account) => <article key={account.id} className="bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border2)] bg-[var(--bg3)] text-xs font-bold tracking-wide text-[var(--accent)]">{account.logo}</div><div><h2 className="font-medium text-[var(--text)]">{account.name}</h2><p className="mt-1 text-xs text-[var(--text3)]">{account.type}</p></div></div><span className="journal-number text-lg font-semibold text-[var(--text)]">{account.balance}</span></div>
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text3)]">Trades</p><p className="journal-number mt-1 text-sm text-[var(--text)]">{account.trades}</p></div><div><p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text3)]">Win rate</p><p className="journal-number mt-1 text-sm text-[var(--green)]">{account.winRate}%</p></div></div>
      </article>)}
      <button type="button" onClick={() => setIsModalOpen(true)} className="flex min-h-44 items-center justify-center border-t border-dashed border-[var(--border2)] bg-[var(--surface)] p-6 text-center text-[var(--text2)] transition hover:bg-[var(--bg3)] lg:border-t-0 lg:border-l"><span><span className="block text-2xl font-light text-[var(--accent)]">+</span><span className="mt-2 block text-sm">Add another account</span><span className="mt-1 block text-xs text-[var(--text3)]">Connect a broker or exchange manually</span></span></button>
    </div>

    {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title"><button type="button" aria-label="Close dialog" className="absolute inset-0 cursor-default bg-black/70" onClick={() => setIsModalOpen(false)} /><form onSubmit={handleSubmit} className="relative w-full max-w-lg rounded-xl border border-[var(--border2)] bg-[var(--surface)] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">Workspace</p><h2 id="account-dialog-title" className="mt-2 text-xl font-semibold text-[var(--text)]">Add account</h2></div><button type="button" aria-label="Close dialog" onClick={() => setIsModalOpen(false)} className="text-xl text-[var(--text3)] hover:text-[var(--text)]">×</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs text-[var(--text2)]">Short code<input required value={form.logo} onChange={(event) => update('logo', event.target.value)} placeholder="e.g. BG" className="mt-2" /></label><label className="text-xs text-[var(--text2)]">Account name<input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Broker — account" className="mt-2" /></label><label className="text-xs text-[var(--text2)] sm:col-span-2">Type / description<input value={form.type} onChange={(event) => update('type', event.target.value)} placeholder="Forex · Personal" className="mt-2" /></label><label className="text-xs text-[var(--text2)]">Trades<input type="number" min="0" value={form.trades} onChange={(event) => update('trades', event.target.value)} placeholder="0" className="mt-2" /></label><label className="text-xs text-[var(--text2)]">Win rate %<input type="number" min="0" max="100" value={form.winRate} onChange={(event) => update('winRate', event.target.value)} placeholder="0" className="mt-2" /></label><label className="text-xs text-[var(--text2)] sm:col-span-2">Balance<input value={form.balance} onChange={(event) => update('balance', event.target.value)} placeholder="$0.00" className="mt-2" /></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm text-[var(--text2)] hover:text-[var(--text)]">Cancel</button><button type="submit" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#061016]">Add account</button></div></form></div>}
  </section>;
}

export default Accounts;
