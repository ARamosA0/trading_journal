import { useState, useEffect, useContext } from 'react';
import { HeaderContext } from "../../hook/HeaderContext";

type Alert = {
    instrument: string;
    type: 'Above' | 'Below';
    price: string;
    current: string;
    status: 'Active' | 'Paused' | 'Triggered';
};

function TypeBadge({ t }: { t: Alert['type'] }) {
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t === 'Above' ? 'bg-green-700 text-green-200' : 'bg-rose-700 text-rose-200'}`}>
            {t}
        </span>
    );
}

function StatusBadge({ s }: { s: Alert['status'] }) {
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${s === 'Active' ? 'bg-sky-800 text-sky-200' : s === 'Paused' ? 'bg-amber-800 text-amber-200' : 'bg-violet-800 text-violet-200'}`}>
            {s}
        </span>
    );
}

export default function Tools() {
    const { setHeader } = useContext(HeaderContext);

    useEffect(() => {
        setHeader({
            title: 'Tools',
            subtitle: 'Utilities',
        });
    }, []);

    const [alerts] = useState<Alert[]>([
        { instrument: 'BTC/USDT', type: 'Above', price: '70,000.00', current: '68,162.20', status: 'Active' },
        { instrument: 'EUR/USD', type: 'Below', price: '1.08200', current: '1.08815', status: 'Active' },
        { instrument: 'XAU/USD', type: 'Above', price: '2,400.00', current: '2,358.80', status: 'Active' },
    ]);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 rounded-lg shadow-sm" style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-purple-800 flex items-center justify-center mb-4">
                            <span className="text-2xl">🔔</span>
                        </div>
                        <h3 className="font-semibold mb-2">Price Alerts</h3>
                        <p className="text-sm text-slate-300 mb-4">Set custom price alerts for any instrument. Get notified via push or email when levels are hit.</p>
                        <button className="px-4 py-2 rounded-full border text-sm" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>Open Alerts</button>
                    </div>
                </div>

                <div className="p-6 rounded-lg shadow-sm" style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-emerald-800 flex items-center justify-center mb-4">
                            <span className="text-2xl">📐</span>
                        </div>
                        <h3 className="font-semibold mb-2">Position Calculator</h3>
                        <p className="text-sm text-slate-300 mb-4">Calculate your optimal position size based on account balance, risk %, and stop loss distance.</p>
                        <button className="px-4 py-2 rounded-full border text-sm" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>Open Calculator</button>
                    </div>
                </div>

                <div className="p-6 rounded-lg shadow-sm" style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-indigo-800 flex items-center justify-center mb-4">
                            <span className="text-2xl">🧪</span>
                        </div>
                        <h3 className="font-semibold mb-2">Strategy Backtester</h3>
                        <p className="text-sm text-slate-300 mb-4">Create strategies and test them against historical data. Validate your edge before going live.</p>
                        <button className="px-4 py-2 rounded-full border text-sm" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>Open Backtester</button>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-lg font-semibold mb-3">Active Alerts</h4>
                <div className="overflow-hidden rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--bg2)' }}>
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-left text-xs text-slate-400">
                                <th className="px-6 py-4">INSTRUMENT</th>
                                <th className="px-6 py-4">TYPE</th>
                                <th className="px-6 py-4">PRICE</th>
                                <th className="px-6 py-4">CURRENT</th>
                                <th className="px-6 py-4">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((a) => (
                                <tr key={a.instrument} className="border-t" style={{ borderColor: 'var(--border)' }}>
                                    <td className="px-6 py-4 font-medium">{a.instrument}</td>
                                    <td className="px-6 py-4"><TypeBadge t={a.type} /></td>
                                    <td className="px-6 py-4 text-slate-300">{a.price}</td>
                                    <td className="px-6 py-4 text-slate-300">{a.current}</td>
                                    <td className="px-6 py-4"><StatusBadge s={a.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}