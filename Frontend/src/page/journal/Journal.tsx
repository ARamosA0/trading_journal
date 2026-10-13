import { useContext, useEffect, useMemo, useState } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';

type Trade = {
  id: number;
  date: string;
  pair: string;
  side: 'Long' | 'Short';
  entry: string;
  exit: string;
  lotSize: string;
  pnl: string;
  status: 'Closed' | 'Open' | 'Break Even';
};

const localTrades: Trade[] = [
  { id: 1, date: 'Jun 19, 2026', pair: 'EUR/USD', side: 'Long', entry: '1.08540', exit: '1.08920', lotSize: '1.5', pnl: '+$240.00', status: 'Closed' },
  { id: 2, date: 'Jun 19, 2026', pair: 'BTC/USDT', side: 'Short', entry: '67,420.50', exit: '—', lotSize: '0.25', pnl: '+$185.30', status: 'Open' },
  { id: 3, date: 'Jun 18, 2026', pair: 'GBP/JPY', side: 'Short', entry: '192.450', exit: '192.680', lotSize: '2.0', pnl: '-$75.00', status: 'Closed' },
  { id: 4, date: 'Jun 18, 2026', pair: 'XAU/USD', side: 'Long', entry: '2,340.20', exit: '2,358.80', lotSize: '0.5', pnl: '+$930.00', status: 'Closed' },
  { id: 5, date: 'Jun 17, 2026', pair: 'ETH/USDT', side: 'Long', entry: '3,520.00', exit: '3,520.00', lotSize: '2.0', pnl: '$0.00', status: 'Break Even' },
  { id: 6, date: 'Jun 17, 2026', pair: 'EUR/USD', side: 'Short', entry: '1.08920', exit: '1.09240', lotSize: '1.0', pnl: '-$120.00', status: 'Closed' },
  { id: 7, date: 'Jun 16, 2026', pair: 'BTC/USDT', side: 'Long', entry: '65,800.00', exit: '67,150.00', lotSize: '0.15', pnl: '+$202.50', status: 'Closed' },
  { id: 8, date: 'Jun 16, 2026', pair: 'GBP/JPY', side: 'Long', entry: '191.200', exit: '192.100', lotSize: '1.5', pnl: '+$180.00', status: 'Closed' },
  { id: 9, date: 'Jun 15, 2026', pair: 'USD/JPY', side: 'Short', entry: '157.840', exit: '157.650', lotSize: '1.2', pnl: '+$110.00', status: 'Closed' },
  { id: 10, date: 'Jun 15, 2026', pair: 'AUD/USD', side: 'Long', entry: '0.6685', exit: '0.6712', lotSize: '3.0', pnl: '+$95.20', status: 'Closed' },
  { id: 11, date: 'Jun 14, 2026', pair: 'NZD/USD', side: 'Short', entry: '0.6243', exit: '0.6215', lotSize: '1.8', pnl: '+$140.60', status: 'Closed' },
  { id: 12, date: 'Jun 14, 2026', pair: 'ETH/USDT', side: 'Short', entry: '3,480.00', exit: '3,512.00', lotSize: '1.0', pnl: '-$120.00', status: 'Closed' },
];

const pageSize = 6;
const statusOptions = ['All', 'Closed', 'Open', 'Break Even'] as const;
type StatusOption = (typeof statusOptions)[number];

function Journal() {
  const { setHeader } = useContext(HeaderContext);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusOption>('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setHeader({ title: 'Trading journal', subtitle: 'A searchable record of every decision.', action: <button type="button">New trade</button> });
  }, [setHeader]);

  const filteredTrades = useMemo(() => {
    const normalized = filterText.trim().toLowerCase();
    return localTrades.filter((trade) => {
      const searchable = Object.values(trade).join(' ').toLowerCase();
      return searchable.includes(normalized) && (statusFilter === 'All' || trade.status === statusFilter);
    });
  }, [filterText, statusFilter]);

  const totalCount = filteredTrades.length;
  const trades = filteredTrades.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const statusClass = (status: Trade['status']) => status === 'Closed'
    ? 'bg-[var(--green-dim)] text-[var(--green)]'
    : status === 'Open' ? 'bg-[var(--accent-dim)] text-[var(--accent)]' : 'bg-[var(--purple-dim)] text-[var(--primary2)]';

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 md:flex-row md:items-center md:justify-between">
        <div><p className="text-sm font-medium text-[var(--text)]">Trade history</p><p className="mt-1 text-xs text-[var(--text3)]">Review the decisions behind every result.</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {statusOptions.map((option) => <button key={option} type="button" aria-pressed={statusFilter === option} onClick={() => { setStatusFilter(option); setCurrentPage(1); }} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${statusFilter === option ? 'bg-[var(--accent)] text-[#061016]' : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text2)] hover:border-[var(--text3)]'}`}>{option}</button>)}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="journal-panel p-4">
          <label htmlFor="trade-search" className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text3)]">Search trades</label>
          <div className="relative"><span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--text3)]" aria-hidden="true">⌕</span><input id="trade-search" type="search" value={filterText} onChange={(event) => { setFilterText(event.target.value); setCurrentPage(1); }} placeholder="Pair, date, side, P&L or status" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg3)] py-3 pl-11 pr-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]" /></div>
        </div>
        <div className="journal-panel min-w-48 p-4 text-sm"><div className="flex items-center justify-between gap-4"><span className="text-[var(--text3)]">Filtered trades</span><span className="journal-number text-lg font-semibold text-[var(--text)]">{totalCount} / {localTrades.length}</span></div><p className="mt-2 text-xs text-[var(--text3)]">Page {currentPage} of {totalPages}</p></div>
      </div>

      <div className="journal-panel overflow-x-auto">
        <table className="journal-table min-w-full border-separate border-spacing-0 text-left text-sm"><caption className="sr-only">Trading journal history</caption>
          <thead className="bg-[var(--bg3)]"><tr><th>Date</th><th>Pair</th><th>Side</th><th>Entry</th><th>Exit</th><th>Size</th><th>P&amp;L</th><th>Status</th></tr></thead>
          <tbody>
            {trades.length === 0 ? <tr><td colSpan={8} className="px-5 py-10 text-center text-[var(--text3)]">No trades match your filters.</td></tr> : trades.map((trade) => <tr key={trade.id}>
              <td className="whitespace-nowrap text-[var(--text3)]">{trade.date}</td><td className="font-medium text-[var(--text)]">{trade.pair}</td>
              <td><span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${trade.side === 'Long' ? 'bg-[var(--green-dim)] text-[var(--green)]' : 'bg-[var(--red-dim)] text-[var(--red)]'}`}>{trade.side}</span></td>
              <td className="journal-number">{trade.entry}</td><td className="journal-number">{trade.exit}</td><td className="journal-number">{trade.lotSize}</td>
              <td className={`journal-number font-medium ${trade.pnl.startsWith('-') ? 'text-[var(--red)]' : trade.pnl.startsWith('+') ? 'text-[var(--green)]' : 'text-[var(--text2)]'}`}>{trade.pnl}</td>
              <td><span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusClass(trade.status)}`}>{trade.status}</span></td>
            </tr>)}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[var(--text3)]">Showing {trades.length} trades on this page.</p><div className="flex items-center justify-center gap-1">
        <button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text2)] disabled:cursor-not-allowed disabled:opacity-40">‹</button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <button key={page} type="button" aria-label={`Page ${page}`} aria-current={page === currentPage ? 'page' : undefined} onClick={() => setCurrentPage(page)} className={`min-w-9 rounded-lg px-3 py-2 text-sm font-semibold ${page === currentPage ? 'bg-[var(--accent)] text-[#061016]' : 'text-[var(--text2)] hover:bg-[var(--surface)]'}`}>{page}</button>)}
        <button type="button" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text2)] disabled:cursor-not-allowed disabled:opacity-40">›</button>
      </div></div>
    </section>
  );
}

export default Journal;
