import type { Trade } from '../../api/trades';

function money(value: number) {
  return `${value >= 0 ? '+' : '-'}$${Math.abs(value).toFixed(2)}`;
}

export default function PerformanceByPair({ trades }: { trades: Trade[] }) {
  const pairs = Object.values(trades.reduce<Record<string, { symbol: string; pnl: number; wins: number; closed: number }>>((result, trade) => {
    const pair = result[trade.symbol] ?? { symbol: trade.symbol, pnl: 0, wins: 0, closed: 0 };
    result[trade.symbol] = {
      symbol: trade.symbol,
      pnl: pair.pnl + (trade.pnl || 0),
      wins: pair.wins + (trade.status !== 'OPEN' && trade.pnl > 0 ? 1 : 0),
      closed: pair.closed + (trade.status !== 'OPEN' ? 1 : 0),
    };
    return result;
  }, {})).sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="divide-y divide-[var(--border)]">
      {pairs.length === 0 ? (
        <p className="py-3 text-sm text-[var(--text3)]">No pair data yet.</p>
      ) : pairs.map((pair) => (
        <div key={pair.symbol} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <span className="text-sm font-medium text-[var(--text)]">{pair.symbol}</span>
          <span className="ml-auto text-xs text-[var(--text3)]">{pair.closed ? `${((pair.wins / pair.closed) * 100).toFixed(0)}% win` : 'No closed trades'}</span>
          <span className={`journal-number text-sm ${pair.pnl < 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>{money(pair.pnl)}</span>
        </div>
      ))}
    </div>
  );
}
