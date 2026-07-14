import { useEffect, useContext } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';

type OpenTrade = {
  id: number;
  pair: string;
  side: 'Long' | 'Short';
  entry: string;
  current: string;
  size: string;
  pnl: string;
  pnlPercent: string;
  duration: string;
  account: string;
  accent: 'green' | 'red';
};

const trades: OpenTrade[] = [
  {
    id: 1,
    pair: 'BTC/USDT',
    side: 'Long',
    entry: '67,420.50',
    current: '68,162.20',
    size: '0.25 BTC',
    pnl: '+$185.30',
    pnlPercent: '+1.10%',
    duration: '4h 12m',
    account: 'Bitget',
    accent: 'green',
  },
  {
    id: 2,
    pair: 'EUR/USD',
    side: 'Long',
    entry: '1.08720',
    current: '1.08815',
    size: '1.0 Lot',
    pnl: '+$95.50',
    pnlPercent: '+0.09%',
    duration: '1h 30m',
    account: 'SimpleFx',
    accent: 'green',
  },
  {
    id: 3,
    pair: 'GBP/JPY',
    side: 'Short',
    entry: '192.850',
    current: '192.190',
    size: '1.5 Lot',
    pnl: '+$132.00',
    pnlPercent: '+0.34%',
    duration: '55m',
    account: 'SimpleFx',
    accent: 'red',
  },
];

function OpenTrades() {
  const { setHeader } = useContext(HeaderContext);

  useEffect(() => {
    setHeader({
      title: 'Open Trades',
      subtitle: 'Active positions and their performance',
      action: <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">New Trade</button>,
    });
  }, [setHeader]);

  const openPositions = trades.length;
  const unrealizedPnl = trades.reduce((acc, trade) => {
    const amount = Number(trade.pnl.replace(/[^0-9.-]/g, '')) * (trade.pnl.includes('-') ? -1 : 1);
    return acc + amount;
  }, 0);
  const totalExposure = '$12,450';

  const getPnlClass = (pnl: string) =>
    pnl.startsWith('+') ? 'text-emerald-300' : pnl.startsWith('-') ? 'text-rose-300' : 'text-slate-100';

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-[var(--border2)] bg-[var(--bg3)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Open Positions</p>
          <p className="mt-4 text-3xl font-semibold text-slate-100">{openPositions}</p>
        </div>
        <div className="rounded-[24px] border border-[var(--border2)] bg-[var(--bg3)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Unrealized P&amp;L</p>
          <p className={`mt-4 text-3xl font-semibold ${unrealizedPnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {unrealizedPnl >= 0 ? '+' : '-'}${Math.abs(unrealizedPnl).toFixed(2)}
          </p>
        </div>
        <div className="rounded-[24px] border border-[var(--border2)] bg-[var(--bg3)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Exposure</p>
          <p className="mt-4 text-3xl font-semibold text-slate-100">{totalExposure}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {trades.map((trade) => (
          <div key={trade.id} className="group overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--bg2)] shadow-[var(--shadow)] transition hover:-translate-y-1 hover:border-slate-500/30">
            <div className={`border-b px-6 py-5 ${trade.accent === 'green' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{trade.pair}</p>
                  <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${trade.side === 'Long' ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/15' : 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/15'}`}>
                    {trade.side}
                  </span>
                </div>
                <p className={`text-lg font-semibold ${getPnlClass(trade.pnl)}`}>{trade.pnl}</p>
              </div>
            </div>

            <div className="space-y-3 px-6 py-6 text-sm text-slate-300">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Entry</span>
                <span className="font-medium text-slate-100">{trade.entry}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Current</span>
                <span className="font-medium text-slate-100">{trade.current}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Size</span>
                <span className="font-medium text-slate-100">{trade.size}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">P&amp;L %</span>
                <span className={`font-medium ${trade.pnlPercent.startsWith('+') ? 'text-emerald-300' : trade.pnlPercent.startsWith('-') ? 'text-rose-300' : 'text-slate-100'}`}>{trade.pnlPercent}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium text-slate-100">{trade.duration}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Account</span>
                <span className="font-medium text-slate-100">{trade.account}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-5 bg-[var(--bg3)]">
              <button className="w-full rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-100 transition hover:border-slate-400 hover:bg-white/5 sm:w-auto">Close</button>
              <button className="w-full rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-sm text-amber-300 transition hover:bg-amber-500/10 sm:w-auto">BE</button>
              <button className="w-full rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-100 transition hover:border-slate-400 hover:bg-white/5 sm:w-auto">Detail ›</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OpenTrades;
