import { useContext, useEffect, useState } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';
import LineChart from '../../component/charts/lineChart';
import TradingCalendar from '../../component/charts/calendar';

const periods = ['Day', 'Week', 'Month', 'Year'];

const metrics = [
  { label: 'Net P&L', value: '+$4,832.50', note: '+12.4% vs last month', tone: 'positive' },
  { label: 'Win rate', value: '68.2%', note: '+3.1% vs last month', tone: 'positive' },
  { label: 'Total trades', value: '124', note: '18 this week', tone: 'neutral' },
  { label: 'Average R:R', value: '2.4:1', note: '-0.2 vs last month', tone: 'negative' },
];

function Dashboard() {
  const { setHeader } = useContext(HeaderContext);
  const [activePeriod, setActivePeriod] = useState('Month');

  useEffect(() => {
    setHeader({
      title: 'Dashboard',
      subtitle: 'A clear read on your trading performance.',
      action: <button type="button">New trade</button>,
      action2: <button type="button">Export</button>,
    });
  }, [setHeader]);

  return (
    <section className="space-y-6">
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

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-[var(--surface)] p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text3)]">{metric.label}</p>
            <p className="journal-number mt-3 text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl">{metric.value}</p>
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
            <span className="journal-number text-sm text-[var(--green)]">+$4,832.50</span>
          </div>
          <LineChart dataX={['Jan', 'Feb', 'Mar', 'Apr', 'May']} dataY={[20, 15, 35, 28, 42]} title="" />
        </section>

        <section className="journal-panel p-4 sm:p-6" aria-labelledby="breakdown-title">
          <div className="mb-5">
            <h2 id="breakdown-title" className="text-base font-semibold text-[var(--text)]">Session breakdown</h2>
            <p className="mt-1 text-xs text-[var(--text3)]">Where this month was made</p>
          </div>
          <div className="space-y-5">
            {[
              ['London', '42%', 'bg-[var(--accent)]'],
              ['New York', '35%', 'bg-[var(--primary)]'],
              ['Asia', '23%', 'bg-[var(--gold)]'],
            ].map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-xs"><span className="text-[var(--text2)]">{label}</span><span className="journal-number text-[var(--text)]">{value}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg3)]"><div className={`h-full rounded-full ${color}`} style={{ width: value }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-[var(--border)] pt-4 text-xs text-[var(--text3)]">Best session: London · +$2,031</div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
        <section className="journal-panel p-4 sm:p-6" aria-labelledby="calendar-title">
          <div className="mb-4"><h2 id="calendar-title" className="text-base font-semibold text-[var(--text)]">Trading calendar</h2><p className="mt-1 text-xs text-[var(--text3)]">Daily realized P&L</p></div>
          <TradingCalendar />
        </section>
        <section className="journal-panel p-4 sm:p-6" aria-labelledby="pairs-title">
          <div className="mb-4"><h2 id="pairs-title" className="text-base font-semibold text-[var(--text)]">Performance by pair</h2><p className="mt-1 text-xs text-[var(--text3)]">Top instruments this period</p></div>
          <div className="divide-y divide-[var(--border)]">
            {[['EUR/USD', '+$1,842', '72%'], ['BTC/USDT', '+$1,226', '64%'], ['XAU/USD', '+$930', '67%'], ['GBP/JPY', '-$75', '50%']].map(([pair, pnl, win]) => (
              <div key={pair} className="flex items-center justify-between py-3 first:pt-0 last:pb-0"><span className="text-sm font-medium text-[var(--text)]">{pair}</span><span className="ml-auto mr-4 text-xs text-[var(--text3)]">{win} win</span><span className={`journal-number text-sm ${pnl.startsWith('-') ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>{pnl}</span></div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Dashboard;
