import { useState, useEffect, useContext } from 'react';
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
  const [trades, setTrades] = useState<Trade[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setHeader({
      title: 'Trading Journal',
      subtitle: 'Complete history of all your trades',
      action: <button className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/20">New Trade</button>,
    });
  }, [setHeader]);

  useEffect(() => {
    async function loadTrades() {
      setIsLoading(true);
      const normalizedFilter = filterText.trim().toLowerCase();
      const filtered = localTrades.filter((trade) => {
        const matchesText =
          trade.date.toLowerCase().includes(normalizedFilter) ||
          trade.pair.toLowerCase().includes(normalizedFilter) ||
          trade.side.toLowerCase().includes(normalizedFilter) ||
          trade.entry.toLowerCase().includes(normalizedFilter) ||
          trade.exit.toLowerCase().includes(normalizedFilter) ||
          trade.lotSize.toLowerCase().includes(normalizedFilter) ||
          trade.pnl.toLowerCase().includes(normalizedFilter) ||
          trade.status.toLowerCase().includes(normalizedFilter);

        const matchesStatus = statusFilter === 'All' || trade.status === statusFilter;
        return matchesText && matchesStatus;
      });

      const total = filtered.length;
      const startIndex = (currentPage - 1) * pageSize;
      const pageItems = filtered.slice(startIndex, startIndex + pageSize);

      setTrades(pageItems);
      setTotalCount(total);
      setIsLoading(false);
    }

    loadTrades();
  }, [currentPage, filterText, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleFilterTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
    setCurrentPage(1);
  };

  const statusBadge = (status: Trade['status']) => {
    if (status === 'Closed') return 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/15';
    if (status === 'Open') return 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/15';
    if (status === 'Break Even') return 'bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/15';
    return '';
  };

  const sideBadge = (side: Trade['side']) => {
    return side === 'Long'
      ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/15'
      : 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/15';
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setStatusFilter(option);
                  setCurrentPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statusFilter === option
                    ? 'bg-slate-100 text-slate-950 shadow-lg shadow-slate-900/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg2)] p-4 shadow-inner shadow-black/10">
            <label htmlFor="trade-search" className="mb-2 block text-sm font-medium text-slate-400">Buscar por texto</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">🔍</span>
              <input
                id="trade-search"
                type="text"
                value={filterText}
                onChange={handleFilterTextChange}
                placeholder="Filtra por par, fecha, side, pnl o status"
                className="w-full rounded-3xl border border-[var(--border)] bg-[var(--bg3)] py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15"
              />
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg2)] p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Total de trades</span>
              <span className="text-lg font-semibold text-slate-100">{totalCount} / {localTrades.length}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Mostrando página {currentPage} de {totalPages}</div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[24px] border border-[var(--border)] bg-[var(--bg2)]">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-[var(--bg3)] text-slate-400">
              <tr>
                <th className="px-5 py-4">DATE</th>
                <th className="px-5 py-4">PAIR</th>
                <th className="px-5 py-4">SIDE</th>
                <th className="px-5 py-4">ENTRY</th>
                <th className="px-5 py-4">EXIT</th>
                <th className="px-5 py-4">LOT/SIZE</th>
                <th className="px-5 py-4">P&L</th>
                <th className="px-5 py-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                    Cargando operaciones...
                  </td>
                </tr>
              ) : trades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                    No se encontraron operaciones.
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className="border-t border-[var(--border)] last:border-b last:border-[var(--border)] hover:bg-[var(--bg3)]">
                    <td className="px-5 py-4 text-slate-300">{trade.date}</td>
                    <td className="px-5 py-4 text-slate-100">{trade.pair}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${sideBadge(trade.side)}`}>{trade.side}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{trade.entry}</td>
                    <td className="px-5 py-4 text-slate-300">{trade.exit}</td>
                    <td className="px-5 py-4 text-slate-300">{trade.lotSize}</td>
                    <td className={`px-5 py-4 font-medium ${trade.pnl.startsWith('+') ? 'text-emerald-300' : trade.pnl.startsWith('-') ? 'text-rose-300' : 'text-slate-300'}`}>{trade.pnl}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(trade.status)}`}>{trade.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-400">Mostrando {trades.length} operaciones en esta página.</div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              className="rounded-full border border-[var(--border)] bg-[var(--bg3)] px-4 py-2 text-sm text-slate-300 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`min-w-[2.25rem] rounded-full px-3 py-2 text-sm font-semibold transition ${
                  page === currentPage
                    ? 'bg-slate-100 text-slate-950 shadow-lg shadow-slate-900/20'
                    : 'bg-[var(--bg2)] text-slate-300 hover:bg-[var(--bg3)]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              className="rounded-full border border-[var(--border)] bg-[var(--bg3)] px-4 py-2 text-sm text-slate-300 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ›
            </button>
          </div>
        </div>
    </div>
  );
}

export default Journal;
