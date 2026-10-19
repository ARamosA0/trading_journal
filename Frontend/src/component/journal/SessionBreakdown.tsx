import type { Trade } from '../../api/trades';

const sessions = [
  { name: 'London', color: 'bg-[var(--accent)]' },
  { name: 'New York', color: 'bg-[var(--primary)]' },
  { name: 'Asia', color: 'bg-[var(--gold)]' },
];

function sessionForTrade(trade: Trade) {
  const hour = new Date(trade.openAt).getUTCHours();
  if (hour >= 7 && hour < 13) return 'London';
  if (hour >= 13 && hour < 21) return 'New York';
  return 'Asia';
}

function money(value: number) {
  return `${value >= 0 ? '+' : '-'}$${Math.abs(value).toFixed(2)}`;
}

export default function SessionBreakdown({ trades }: { trades: Trade[] }) {
  const totals = sessions.map((session) => {
    const sessionTrades = trades.filter((trade) => sessionForTrade(trade) === session.name);
    return {
      ...session,
      count: sessionTrades.length,
      pnl: sessionTrades.reduce((total, trade) => total + (trade.pnl || 0), 0),
    };
  });
  const bestSession = [...totals].sort((a, b) => b.pnl - a.pnl)[0];
  const totalTrades = trades.length;

  return (
    <div className="space-y-5">
      {totals.map((session) => {
        const percentage = totalTrades ? (session.count / totalTrades) * 100 : 0;
        return (
          <div key={session.name}>
            <div className="mb-2 flex justify-between gap-3 text-xs">
              <span className="text-[var(--text2)]">{session.name}</span>
              <span className="journal-number text-[var(--text)]">{percentage.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg3)]">
              <div className={`h-full rounded-full ${session.color}`} style={{ width: `${percentage}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-xs text-[var(--text3)]">
              <span>{session.count} trades</span>
              <span className={session.pnl < 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}>{money(session.pnl)}</span>
            </div>
          </div>
        );
      })}
      <div className="border-t border-[var(--border)] pt-4 text-xs text-[var(--text3)]">
        {bestSession && totalTrades > 0 ? `Best session: ${bestSession.name} · ${money(bestSession.pnl)}` : 'No session data yet'}
      </div>
    </div>
  );
}
