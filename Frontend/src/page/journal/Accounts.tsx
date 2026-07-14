import { useState, useEffect, useContext } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';

type Account = {
    id: number;
    logo: string;
    name: string;
    type: string;
    trades: number;
    winRate: number;
    balance: string;
};

const initialAccounts: Account[] = [
    {
        id: 1,
        logo: 'SFx',
        name: 'SimpleFx — Main',
        type: 'Forex & CFDs · Personal',
        trades: 86,
        winRate: 72,
        balance: '$32,480.00',
    },
    {
        id: 2,
        logo: 'Bg',
        name: 'Bitget — Futures',
        type: 'Crypto Derivatives · Personal',
        trades: 38,
        winRate: 61,
        balance: '$15,872.80',
    },
];

function Accounts() {
    const { setHeader } = useContext(HeaderContext);
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ logo: '', name: '', type: '', trades: '', winRate: '', balance: '' });

    useEffect(() => {
        setHeader({
            title: 'Accounts',
            subtitle: 'Manage your broker and exchange accounts',
            action: (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
                >
                    Add Account
                </button>
            ),
        });
    }, [setHeader]);

    const openAddModal = () => {
        setForm({ logo: '', name: '', type: '', trades: '', winRate: '', balance: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const next: Account = {
            id: Date.now(),
            logo: form.logo || 'AC',
            name: form.name || 'New Account',
            type: form.type || 'Personal',
            trades: Number(form.trades) || 0,
            winRate: Number(form.winRate) || 0,
            balance: form.balance || '$0.00',
        };
        setAccounts((s) => [next, ...s]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-4 lg:grid-cols-2">
                {accounts.map((acc) => (
                    <div
                        key={acc.id}
                        className="flex items-center gap-6 overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--bg2)] p-6 shadow-[var(--shadow)]"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-lg font-semibold text-slate-100">
                            {acc.logo}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold text-slate-100">{acc.name}</div>
                                    <div className="mt-1 text-xs text-slate-400">{acc.type}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-semibold text-emerald-300">{acc.balance}</div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-6 text-sm text-slate-400">
                                <div>
                                    <div className="text-xs">Trades</div>
                                    <div className="mt-1 text-sm text-slate-100">{acc.trades}</div>
                                </div>
                                <div>
                                    <div className="text-xs">Win Rate</div>
                                    <div className="mt-1 text-sm text-slate-100">{acc.winRate}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add new account card */}
                <button
                    onClick={openAddModal}
                    className="flex h-36 w-full items-center justify-center rounded-[16px] border-2 border-dashed border-[var(--border)] bg-[var(--bg2)] p-6 text-slate-400 transition hover:border-slate-500/30"
                >
                    <div className="text-center">
                        <div className="mb-2 text-2xl">+</div>
                        <div className="text-sm">Add New Account</div>
                        <div className="mt-1 text-xs text-slate-500">SimpleFx, Bitget, and more</div>
                    </div>
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-xl rounded-lg bg-[var(--bg3)] p-6 shadow-[var(--shadow)]">
                        <h3 className="text-lg font-semibold text-slate-100">Add New Account</h3>
                        <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    value={form.logo}
                                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                                    placeholder="Logo (short)"
                                    className="rounded border border-[var(--border)] bg-[var(--bg2)] px-3 py-2 text-sm text-slate-100"
                                />
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Account name"
                                    className="rounded border border-[var(--border)] bg-[var(--bg2)] px-3 py-2 text-sm text-slate-100"
                                />
                            </div>

                            <input
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                placeholder="Type / description"
                                className="rounded border border-[var(--border)] bg-[var(--bg2)] px-3 py-2 text-sm text-slate-100"
                            />

                            <div className="grid grid-cols-3 gap-3">
                                <input
                                    value={form.trades}
                                    onChange={(e) => setForm({ ...form, trades: e.target.value })}
                                    placeholder="Trades"
                                    className="rounded border border-[var(--border)] bg-[var(--bg2)] px-3 py-2 text-sm text-slate-100"
                                />
                                <input
                                    value={form.winRate}
                                    onChange={(e) => setForm({ ...form, winRate: e.target.value })}
                                    placeholder="Win Rate %"
                                    className="rounded border border-[var(--border)] bg-[var(--bg2)] px-3 py-2 text-sm text-slate-100"
                                />
                                <input
                                    value={form.balance}
                                    onChange={(e) => setForm({ ...form, balance: e.target.value })}
                                    placeholder="Balance"
                                    className="rounded border border-[var(--border)] bg-[var(--bg2)] px-3 py-2 text-sm text-slate-100"
                                />
                            </div>

                            <div className="mt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded px-4 py-2 text-sm text-slate-300">
                                    Cancel
                                </button>
                                <button type="submit" className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">
                                    Add Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Accounts;