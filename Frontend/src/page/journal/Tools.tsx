import { useContext, useEffect } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';

type Alert = { instrument: string; type: 'Above' | 'Below'; price: string; current: string; status: 'Active' | 'Paused' | 'Triggered' };
const alerts: Alert[] = [
  { instrument: 'BTC/USDT', type: 'Above', price: '70,000.00', current: '68,162.20', status: 'Active' },
  { instrument: 'EUR/USD', type: 'Below', price: '1.08200', current: '1.08815', status: 'Active' },
  { instrument: 'XAU/USD', type: 'Above', price: '2,400.00', current: '2,358.80', status: 'Active' },
];

function Tools() {
  const { setHeader } = useContext(HeaderContext);
  useEffect(() => { setHeader({ title: 'Tools', subtitle: 'Small utilities for better decisions, not more noise.' }); }, [setHeader]);
  const tools = [
    { code: '01', title: 'Price alerts', description: 'Watch key levels and get notified when price crosses them.' },
    { code: '02', title: 'Position calculator', description: 'Size a trade from balance, risk percentage and stop distance.' },
    { code: '03', title: 'Strategy backtester', description: 'Validate an edge against historical data before going live.' },
  ];
  return <section className="space-y-8">
    <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-3">{tools.map((tool) => <button key={tool.code} type="button" className="group bg-[var(--surface)] p-5 text-left transition hover:bg-[var(--bg3)]"><span className="journal-number text-xs text-[var(--accent)]">{tool.code}</span><h2 className="mt-8 text-base font-semibold text-[var(--text)]">{tool.title}<span className="ml-2 text-[var(--text3)] transition group-hover:text-[var(--accent)]">→</span></h2><p className="mt-2 text-sm leading-6 text-[var(--text3)]">{tool.description}</p></button>)}</div>
    <div><div className="mb-4 flex items-end justify-between"><div><h2 className="text-base font-semibold text-[var(--text)]">Active alerts</h2><p className="mt-1 text-xs text-[var(--text3)]">Levels currently being monitored.</p></div><span className="rounded-md bg-[var(--accent-dim)] px-2 py-1 text-xs text-[var(--accent)]">{alerts.length} active</span></div><div className="journal-panel overflow-x-auto"><table className="journal-table min-w-[620px] w-full border-separate border-spacing-0 text-left text-sm"><caption className="sr-only">Active price alerts</caption><thead className="bg-[var(--bg3)]"><tr><th>Instrument</th><th>Condition</th><th>Target</th><th>Current</th><th>Status</th></tr></thead><tbody>{alerts.map((alert) => <tr key={alert.instrument}><td className="font-semibold text-[var(--text)]">{alert.instrument}</td><td><span className={`rounded-md px-2 py-1 text-xs font-semibold ${alert.type === 'Above' ? 'bg-[var(--green-dim)] text-[var(--green)]' : 'bg-[var(--red-dim)] text-[var(--red)]'}`}>{alert.type}</span></td><td className="journal-number">{alert.price}</td><td className="journal-number">{alert.current}</td><td><span className="rounded-md bg-[var(--accent-dim)] px-2 py-1 text-xs font-semibold text-[var(--accent)]">{alert.status}</span></td></tr>)}</tbody></table></div></div>
  </section>;
}

export default Tools;
