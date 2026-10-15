import { useContext, useEffect, useState } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';
import NewTradeDialog from '../../component/journal/NewTradeDialog';
import CloseTradeDialog from '../../component/journal/CloseTradeDialog';
import TradeDetailDialog from '../../component/journal/TradeDetailDialog';
import { getOpenTrades, type Trade } from '../../api/trades';

function formatNumber(value: number | null) {
  return value == null ? '—' : value.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

function duration(openAt: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(openAt).getTime()) / 60000));
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function OpenTrades() {
  const { setHeader } = useContext(HeaderContext);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [closeTarget, setCloseTarget] = useState<Trade | null>(null);
  const [detailTarget, setDetailTarget] = useState<Trade | null>(null);

  useEffect(() => {
    let active = true;
    getOpenTrades()
      .then((data) => { if (active) setTrades(data); })
      .catch(() => { if (active) setError('Could not load open trades.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [reloadVersion]);

  useEffect(() => {
    setHeader({ title: 'Open trades', subtitle: 'Monitor active exposure before it becomes history.', action: <NewTradeDialog onCreated={() => { setIsLoading(true); setReloadVersion((version) => version + 1); }} /> });
  }, [setHeader]);

  const unrealizedPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const refreshTrades = () => { setIsLoading(true); setReloadVersion((version) => version + 1); };

  return <section className="space-y-6">
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] lg:grid-cols-3">{[['Open positions', String(trades.length), 'neutral'], ['Unrealized P&L', `${unrealizedPnl >= 0 ? '+' : '-'}$${Math.abs(unrealizedPnl).toFixed(2)}`, unrealizedPnl >= 0 ? 'positive' : 'negative'], ['Total exposure', '—', 'neutral']].map(([label, value, tone]) => <div key={label} className="bg-[var(--surface)] p-4 sm:p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text3)]">{label}</p><p className={`journal-number mt-3 text-xl font-semibold ${tone === 'positive' ? 'text-[var(--green)]' : tone === 'negative' ? 'text-[var(--red)]' : 'text-[var(--text)]'}`}>{value}</p></div>)}</div>
    {error && <p role="alert" className="text-sm text-[var(--red)]">{error}</p>}
    <div className="journal-panel overflow-x-auto"><table className="journal-table min-w-[860px] w-full border-separate border-spacing-0 text-left text-sm"><caption className="sr-only">Open trading positions</caption><thead className="bg-[var(--bg3)]"><tr><th>Pair</th><th>Side</th><th>Entry</th><th>Size</th><th>P&amp;L</th><th>Duration</th><th>Account</th><th>Actions</th></tr></thead><tbody>{isLoading ? <tr><td colSpan={8} className="px-5 py-10 text-center text-[var(--text3)]">Loading open trades…</td></tr> : trades.length === 0 ? <tr><td colSpan={8} className="px-5 py-10 text-center text-[var(--text3)]">No open trades.</td></tr> : trades.map((trade) => <tr key={trade.id}><td className="font-semibold text-[var(--text)]">{trade.symbol}</td><td><span className={`rounded-md px-2 py-1 text-xs font-semibold ${trade.direction === 'LONG' ? 'bg-[var(--green-dim)] text-[var(--green)]' : 'bg-[var(--red-dim)] text-[var(--red)]'}`}>{trade.direction === 'LONG' ? 'Long' : 'Short'}</span></td><td className="journal-number">{formatNumber(trade.entryPrice)}</td><td className="journal-number">{formatNumber(trade.quantity)}</td><td><span className={`journal-number ${trade.pnl < 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>{trade.pnl >= 0 ? '+' : '-'}${Math.abs(trade.pnl).toFixed(2)}</span></td><td>{duration(trade.openAt)}</td><td>{trade.accountName}</td><td><div className="flex gap-2"><button type="button" onClick={() => setCloseTarget(trade)} className="rounded-md border border-[var(--red)] px-2 py-1 text-xs text-[var(--red)]">Close</button><button type="button" onClick={() => setDetailTarget(trade)} className="rounded-md border border-[var(--border2)] px-2 py-1 text-xs text-[var(--text2)]">Details</button></div></td></tr>)}</tbody></table></div>
    {closeTarget && <CloseTradeDialog trade={closeTarget} onCancel={() => setCloseTarget(null)} onClosed={async () => { setCloseTarget(null); refreshTrades(); }} />}
    {detailTarget && <TradeDetailDialog trade={detailTarget} onCancel={() => setDetailTarget(null)} onUpdated={async () => { setDetailTarget(null); refreshTrades(); }} onDeleted={async () => { setDetailTarget(null); refreshTrades(); }} />}
  </section>;
}

export default OpenTrades;
