import { useContext, useEffect, useMemo, useState } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';
import LineChart from '../../component/charts/lineChart';
import TradingCalendar from '../../component/charts/calendar';
import NewTradeDialog from '../../component/journal/NewTradeDialog';
import SessionBreakdown from '../../component/journal/SessionBreakdown';
import PerformanceByPair from '../../component/journal/PerformanceByPair';
import { getAccounts, getSelectedAccountId, selectAccount, ACCOUNT_SELECTION_EVENT, type Account } from '../../api/accounts';
import { getTrades, type Trade } from '../../api/trades';

const periods = ['Day', 'Week', 'Month', 'Year'];

function isInPeriod(value: string, period: string) {
  const date = new Date(value);
  const now = new Date();

  if (period === 'Day') {
    return date.toDateString() === now.toDateString();
  }

  if (period === 'Week') {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return date >= weekStart;
  }

  if (period === 'Year') {
    return date.getFullYear() === now.getFullYear();
  }

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function money(value: number) {
  return `${value >= 0 ? '+' : '-'}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function riskReward(trade: Trade) {
  if (trade.status === 'OPEN' || trade.stopLoss == null || trade.exitPrice == null) return null;

  const risk = Math.abs(trade.entryPrice - trade.stopLoss);
  return risk === 0 ? null : Math.abs(trade.exitPrice - trade.entryPrice) / risk;
}

function Dashboard() {
  const { setHeader } = useContext(HeaderContext);
  const [activePeriod, setActivePeriod] = useState('Month');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(() => getSelectedAccountId());
  const [reloadVersion, setReloadVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setHeader({
      title: 'Dashboard',
      subtitle: 'A clear read on your trading performance.',
       action: <NewTradeDialog onCreated={() => setReloadVersion((version) => version + 1)} />,
    });
  }, [setHeader]);

  useEffect(() => {
    let active = true;
    Promise.all([getAccounts(), getTrades()])
      .then(([accountData, tradeData]) => {
        if (!active) return;
        setAccounts(accountData);
        setTrades(tradeData);
        const storedId = getSelectedAccountId();
        const accountId = accountData.some((account) => account.id === storedId) ? storedId : accountData[0]?.id ?? null;
        setSelectedAccountId(accountId);
        if (accountId && accountId !== storedId) selectAccount(accountId);
      })
      .catch(() => { if (active) setError('Could not load dashboard data.'); })
      .finally(() => { if (active) setIsLoading(false); });

    const handleAccountSelection = () => setSelectedAccountId(getSelectedAccountId());
    window.addEventListener(ACCOUNT_SELECTION_EVENT, handleAccountSelection);
    return () => {
      active = false;
      window.removeEventListener(ACCOUNT_SELECTION_EVENT, handleAccountSelection);
    };
  }, [reloadVersion]);

  const periodTrades = useMemo(
    () => trades.filter((trade) => trade.accountId === selectedAccountId && isInPeriod(trade.openAt, activePeriod)),
    [activePeriod, selectedAccountId, trades],
  );

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);

  const metrics = useMemo(() => {
    const closedTrades = periodTrades.filter((trade) => trade.status !== 'OPEN');
    const netPnl = periodTrades.reduce((total, trade) => total + (trade.pnl || 0), 0);
    const wins = closedTrades.filter((trade) => trade.pnl > 0).length;
    const ratios = closedTrades.map(riskReward).filter((value): value is number => value != null);
    const averageRiskReward = ratios.length > 0 ? ratios.reduce((total, value) => total + value, 0) / ratios.length : null;

    return [
      { label: 'Net P&L', value: money(netPnl), note: `${activePeriod} performance`, tone: netPnl >= 0 ? 'positive' : 'negative' },
      { label: 'Win rate', value: closedTrades.length ? `${((wins / closedTrades.length) * 100).toFixed(1)}%` : '—', note: `${wins} winning trades`, tone: wins > 0 ? 'positive' : 'neutral' },
      { label: 'Total trades', value: periodTrades.length.toString(), note: `${closedTrades.length} closed`, tone: 'neutral' },
      { label: 'Average R:R', value: averageRiskReward == null ? '—' : `${averageRiskReward.toFixed(2)}:1`, note: `${ratios.length} trades with risk data`, tone: averageRiskReward != null && averageRiskReward >= 1 ? 'positive' : 'neutral' },
      { label: 'Account balance', value: selectedAccount ? money(selectedAccount.netBalance) : '—', note: selectedAccount?.name ?? 'Select an account', tone: 'neutral' },
    ];
  }, [activePeriod, periodTrades, selectedAccount]);

  const equity = useMemo(() => {
    const orderedTrades = [...periodTrades].sort((a, b) => {
      return new Date(a.closeAt ?? a.openAt).getTime() - new Date(b.closeAt ?? b.openAt).getTime();
    });
    const values = orderedTrades.map((_, index) => orderedTrades
      .slice(0, index + 1)
      .reduce((total, trade) => total + (trade.pnl || 0), 0));
    return {
      labels: orderedTrades.map((trade) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(trade.closeAt ?? trade.openAt))),
      values,
    };
  }, [periodTrades]);

  return (
    <section className="space-y-6">
      {error && <p className="rounded-lg border border-[var(--red)] bg-[var(--red-dim)] px-4 py-3 text-sm text-[var(--red)]">{error}</p>}
      <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text)]">Performance overview</p>
          <p className="mt-1 text-xs text-[var(--text3)]">Last updated today at 09:42 UTC</p>
        </div>
        <div className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 sm:w-auto" role="group" aria-label="Performance period">
          {periods.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setActivePeriod(period)}
              aria-pressed={activePeriod === period}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition sm:flex-none ${activePeriod === period ? 'bg-[var(--accent)] text-[#061016]' : 'text-[var(--text3)] hover:text-[var(--text)]'}`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] xl:grid-cols-5">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-[var(--surface)] p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text3)]">{metric.label}</p>
            <p className="journal-number mt-3 text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl">{isLoading ? '...' : metric.value}</p>
            <p className={`mt-2 text-xs ${metric.tone === 'positive' ? 'text-[var(--green)]' : metric.tone === 'negative' ? 'text-[var(--red)]' : 'text-[var(--text3)]'}`}>{metric.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,.8fr)]">
        <section className="journal-panel p-4 sm:p-6" aria-labelledby="equity-title">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id="equity-title" className="text-base font-semibold text-[var(--text)]">Equity curve</h2>
              <p className="mt-1 text-xs text-[var(--text3)]">Cumulative account performance</p>
            </div>
             <span className={`journal-number text-sm ${metrics[0].value.startsWith('-') ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>{isLoading ? '...' : metrics[0].value}</span>
          </div>
           <LineChart dataX={equity.labels} dataY={equity.values} title="" />
        </section>

        <section className="journal-panel p-4 sm:p-6" aria-labelledby="breakdown-title">
          <div className="mb-5">
            <h2 id="breakdown-title" className="text-base font-semibold text-[var(--text)]">Session breakdown</h2>
            <p className="mt-1 text-xs text-[var(--text3)]">Where this month was made</p>
          </div>
           <SessionBreakdown trades={periodTrades} />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
        <section className="journal-panel p-4 sm:p-6" aria-labelledby="calendar-title">
          <div className="mb-4"><h2 id="calendar-title" className="text-base font-semibold text-[var(--text)]">Trading calendar</h2><p className="mt-1 text-xs text-[var(--text3)]">Daily realized P&L</p></div>
          <TradingCalendar trades={trades} />
        </section>
        <section className="journal-panel p-4 sm:p-6" aria-labelledby="pairs-title">
          <div className="mb-4"><h2 id="pairs-title" className="text-base font-semibold text-[var(--text)]">Performance by pair</h2><p className="mt-1 text-xs text-[var(--text3)]">Top instruments this period</p></div>
           <PerformanceByPair trades={periodTrades} />
        </section>
      </div>
    </section>
  );
}

export default Dashboard;
