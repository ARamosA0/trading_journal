import { useContext, useEffect } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';

type OpenTrade = { id: number; pair: string; side: 'Long' | 'Short'; entry: string; current: string; size: string; pnl: string; pnlPercent: string; duration: string; account: string };
const trades: OpenTrade[] = [
  { id: 1, pair: 'BTC/USDT', side: 'Long', entry: '67,420.50', current: '68,162.20', size: '0.25 BTC', pnl: '+$185.30', pnlPercent: '+1.10%', duration: '4h 12m', account: 'Bitget' },
  { id: 2, pair: 'EUR/USD', side: 'Long', entry: '1.08720', current: '1.08815', size: '1.0 Lot', pnl: '+$95.50', pnlPercent: '+0.09%', duration: '1h 30m', account: 'SimpleFx' },
  { id: 3, pair: 'GBP/JPY', side: 'Short', entry: '192.850', current: '192.190', size: '1.5 Lot', pnl: '+$132.00', pnlPercent: '+0.34%', duration: '55m', account: 'SimpleFx' },
];

function OpenTrades() {
  const { setHeader } = useContext(HeaderContext);
  useEffect(() => { setHeader({ title: 'Open trades', subtitle: 'Monitor active exposure before it becomes history.', action: <button type="button">New trade</button> }); }, [setHeader]);
  const unrealizedPnl = trades.reduce((sum, trade) => sum + Number(trade.pnl.replace(/[^0-9.-]/g, '')) * (trade.pnl.includes('-') ? -1 : 1), 0);

  return <section className="space-y-6">
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] lg:grid-cols-3">
      {[['Open positions', String(trades.length), 'neutral'], ['Unrealized P&L', `+$${unrealizedPnl.toFixed(2)}`, 'positive'], ['Total exposure', '$12,450', 'neutral']].map(([label, value, tone]) => <div key={label} className="bg-[var(--surface)] p-4 sm:p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text3)]">{label}</p><p className={`journal-number mt-3 text-xl font-semibold ${tone === 'positive' ? 'text-[var(--green)]' : 'text-[var(--text)]'}`}>{value}</p></div>)}
    </div>
    <div className="journal-panel overflow-x-auto"><table className="journal-table min-w-[760px] w-full border-separate border-spacing-0 text-left text-sm"><caption className="sr-only">Open trading positions</caption><thead className="bg-[var(--bg3)]"><tr><th>Pair</th><th>Side</th><th>Entry</th><th>Current</th><th>Size</th><th>P&amp;L</th><th>Duration</th><th>Account</th><th>Actions</th></tr></thead><tbody>{trades.map((trade) => <tr key={trade.id}><td className="font-semibold text-[var(--text)]">{trade.pair}</td><td><span className={`rounded-md px-2 py-1 text-xs font-semibold ${trade.side === 'Long' ? 'bg-[var(--green-dim)] text-[var(--green)]' : 'bg-[var(--red-dim)] text-[var(--red)]'}`}>{trade.side}</span></td><td className="journal-number">{trade.entry}</td><td className="journal-number">{trade.current}</td><td className="journal-number">{trade.size}</td><td><span className="journal-number text-[var(--green)]">{trade.pnl}</span><span className="ml-2 text-xs text-[var(--text3)]">{trade.pnlPercent}</span></td><td>{trade.duration}</td><td>{trade.account}</td><td><div className="flex gap-2"><button type="button" className="rounded-md border border-[var(--border2)] px-2 py-1 text-xs text-[var(--text2)] hover:text-[var(--text)]">Close</button><button type="button" className="rounded-md border border-[var(--border2)] px-2 py-1 text-xs text-[var(--text2)] hover:text-[var(--text)]">Details</button></div></td></tr>)}</tbody></table></div>
  </section>;
}

export default OpenTrades;
