import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';
import NewTradeDialog from '../../component/journal/NewTradeDialog';
import TradeDetailDialog from '../../component/journal/TradeDetailDialog';
import { getTrades, type Trade } from '../../api/trades';

type StatusOption = 'All' | 'Closed' | 'Open';
const statusOptions: StatusOption[] = ['All', 'Closed', 'Open'];
const pageSize = 6;

function statusLabel(status: Trade['status']) {
  return status === 'OPEN' ? 'Open' : status === 'CLOSE' ? 'Closed' : status === 'BREAKE_EVEN' ? 'Break Even' : 'Stop Profit';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function formatNumber(value: number | null) {
  return value == null ? '—' : value.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

function Journal() {
  const { setHeader } = useContext(HeaderContext);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusOption>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailTarget, setDetailTarget] = useState<Trade | null>(null);

  useEffect(() => {
    let active = true;
    getTrades()
      .then((data) => { if (active) setTrades(data); })
      .catch(() => { if (active) setError('Could not load your trades.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [reloadVersion]);

  const refreshTrades = useCallback(() => { setIsLoading(true); setReloadVersion((version) => version + 1); }, []);

  useEffect(() => {
    setHeader({
      title: 'Trading journal',
      subtitle: 'A searchable record of every decision.',
      action: <NewTradeDialog onCreated={refreshTrades} />,
    });
  }, [refreshTrades, setHeader]);

  const filteredTrades = useMemo(() => {
    const normalized = filterText.trim().toLowerCase();
    return trades.filter((trade) => {
      const searchable = `${trade.symbol} ${trade.direction} ${trade.accountName} ${statusLabel(trade.status)} ${trade.pnl}`.toLowerCase();
      const statusMatches = statusFilter === 'All' || statusLabel(trade.status) === statusFilter;
      return searchable.includes(normalized) && statusMatches;
    });
  }, [filterText, statusFilter, trades]);

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / pageSize));
  const visibleTrades = filteredTrades.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const statusClass = (status: Trade['status']) => status === 'CLOSE'
    ? 'bg-[var(--green-dim)] text-[var(--green)]'
    : status === 'OPEN' ? 'bg-[var(--accent-dim)] text-[var(--accent)]' : 'bg-[var(--purple-dim)] text-[var(--primary2)]';

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 md:flex-row md:items-center md:justify-between">
        <div><p className="text-sm font-medium text-[var(--text)]">Trade history</p><p className="mt-1 text-xs text-[var(--text3)]">Review the decisions behind every result.</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {statusOptions.map((option) => <button key={option} type="button" aria-pressed={statusFilter === option} onClick={() => { setStatusFilter(option); setCurrentPage(1); }} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${statusFilter === option ? 'bg-[var(--accent)] text-[#061016]' : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text2)] hover:border-[var(--text3)]'}`}>{option}</button>)}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="journal-panel p-4"><label htmlFor="trade-search" className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text3)]">Search trades</label><div className="relative"><span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--text3)]" aria-hidden="true">⌕</span><input id="trade-search" type="search" value={filterText} onChange={(event) => { setFilterText(event.target.value); setCurrentPage(1); }} placeholder="Pair, account, side, P&L or status" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg3)] py-3 pl-11 pr-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]" /></div></div>
        <div className="journal-panel min-w-48 p-4 text-sm"><div className="flex items-center justify-between gap-4"><span className="text-[var(--text3)]">Filtered trades</span><span className="journal-number text-lg font-semibold text-[var(--text)]">{filteredTrades.length} / {trades.length}</span></div><p className="mt-2 text-xs text-[var(--text3)]">Page {currentPage} of {totalPages}</p></div>
      </div>

      {error && <p role="alert" className="text-sm text-[var(--red)]">{error}</p>}
      <div className="journal-panel overflow-x-auto"><table className="journal-table min-w-full border-separate border-spacing-0 text-left text-sm"><caption className="sr-only">Trading journal history</caption><thead className="bg-[var(--bg3)]"><tr><th>Date</th><th>Pair</th><th>Account</th><th>Side</th><th>Entry</th><th>Exit</th><th>Size</th><th>P&amp;L</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {isLoading ? <tr><td colSpan={10} className="px-5 py-10 text-center text-[var(--text3)]">Loading trades…</td></tr> : visibleTrades.length === 0 ? <tr><td colSpan={10} className="px-5 py-10 text-center text-[var(--text3)]">No trades match your filters.</td></tr> : visibleTrades.map((trade) => <tr key={trade.id}><td className="whitespace-nowrap text-[var(--text3)]">{formatDate(trade.openAt)}</td><td className="font-medium text-[var(--text)]">{trade.symbol}</td><td className="text-[var(--text2)]">{trade.accountName}</td><td><span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${trade.direction === 'LONG' ? 'bg-[var(--green-dim)] text-[var(--green)]' : 'bg-[var(--red-dim)] text-[var(--red)]'}`}>{trade.direction === 'LONG' ? 'Long' : 'Short'}</span></td><td className="journal-number">{formatNumber(trade.entryPrice)}</td><td className="journal-number">{formatNumber(trade.exitPrice)}</td><td className="journal-number">{formatNumber(trade.quantity)}</td><td className={`journal-number font-medium ${trade.pnl < 0 ? 'text-[var(--red)]' : trade.pnl > 0 ? 'text-[var(--green)]' : 'text-[var(--text2)]'}`}>{trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}</td><td><span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusClass(trade.status)}`}>{statusLabel(trade.status)}</span></td><td><button type="button" onClick={() => setDetailTarget(trade)} className="rounded-md border border-[var(--border2)] px-2 py-1 text-xs text-[var(--text2)]">Details</button></td></tr>)}
      </tbody></table></div>
      {detailTarget && <TradeDetailDialog trade={detailTarget} onCancel={() => setDetailTarget(null)} onUpdated={async () => { setDetailTarget(null); refreshTrades(); }} onDeleted={async () => { setDetailTarget(null); refreshTrades(); }} />}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[var(--text3)]">Showing {visibleTrades.length} trades on this page.</p><div className="flex items-center justify-center gap-1"><button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text2)] disabled:cursor-not-allowed disabled:opacity-40">‹</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <button key={page} type="button" aria-label={`Page ${page}`} aria-current={page === currentPage ? 'page' : undefined} onClick={() => setCurrentPage(page)} className={`min-w-9 rounded-lg px-3 py-2 text-sm font-semibold ${page === currentPage ? 'bg-[var(--accent)] text-[#061016]' : 'text-[var(--text2)] hover:bg-[var(--surface)]'}`}>{page}</button>)}<button type="button" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text2)] disabled:cursor-not-allowed disabled:opacity-40">›</button></div></div>
    </section>
  );
}

export default Journal;
