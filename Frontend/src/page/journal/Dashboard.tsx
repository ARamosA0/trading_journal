import {useState, useEffect, useContext} from 'react';
import { HeaderContext } from "../../hook/HeaderContext"
import BarChart from '../../component/charts/barChart';
import LineChart from '../../component/charts/lineChart'
import TradingCalendar from '../../component/charts/calendar';

function Dashboard() {
    const { setHeader } = useContext(HeaderContext)

    const [resumeItems, setResumeItems] = useState([
        {
            title: "Total P&L",
            amount: "+$4,832.50",
            subtitle: "▲ 12.4% vs last month",
            status: "positive"
        },
        {
            title: "Win Rate",
            amount: "68.2%",
            subtitle: "▲ 3.1% vs last month",
            status: "positive"
        },
        {
            title: "Total Trades",
            amount: "124",
            subtitle: "This month",
            status: "neutral"
        },
        {
            title: "Avg. R:R",
            amount: "2.4:1",
            subtitle: "▼ 0.2 vs last month",
            status: "negative"
        },

    ])

    const periods = ["Day", "Week", "Month", "Year"];

    const dataY = [20, 15, 35, 28, 42]
    const dataX = ["Ene", "Feb", "Mar", "Abr", "May"]

    useEffect(() => {
        setHeader({
            title: "Dashboard",
            subtitle: "Overview of your trading performance",
            action: <button>New Trade</button>,
            action2: <button>Export</button>
        })
    }, [])
    return (
        <>
            <section className="">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-5">
                    {resumeItems.map((item, index) => (
                        <div
                            key={index}
                            className="
                                rounded-2xl
                                border border-[var(--border2)]
                                bg-[var(--bg2)]
                                p-5
                                transition-all
                                duration-200
                                hover:border-[var(--primary)]
                                hover:-translate-y-1
                                hover:shadow-lg
                            "
                        >
                            <p className="text-sm font-medium text-[var(--text-secondary)]">
                                {item.title}
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
                                {item.amount}
                            </h2>

                            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                {item.subtitle}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between my-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label className="text-sm font-medium text-[var(--text2)]">
                            Period
                        </label>

                        <div className="flex rounded-xl bg-[var(--bg2)] p-1">
                            {periods.map((period) => (
                                <button
                                    key={period}
                                    className="rounded-lg px-4 py-2 text-sm text-[var(--text2)] transition-colors hover:bg-[var(--bg3)]"
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label className="text-sm font-medium text-[var(--text2)]">
                            Account
                        </label>

                        <select className="rounded-xl border border-[var(--border2)] bg-[var(--bg2)] px-4 py-2 text-[var(--text1)] outline-none focus:border-[var(--primary)]">
                            <option>All Accounts</option>
                            <option>Binance</option>
                            <option>Bybit</option>
                            <option>Demo</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Gráfico principal */}
                    <div className="lg:col-span-2 rounded-2xl border border-[var(--border2)] bg-[var(--bg2)] p-6">
                        <h2 className="mb-4 text-xl font-semibold text-[var(--text1)]">
                            Equity Curve
                        </h2>

                        <LineChart dataX={dataX} dataY={dataY} />
                    </div>

                    {/* P&L */}
                    <div className="rounded-2xl border border-[var(--border2)] bg-[var(--bg2)] p-6">
                        <h2 className="mb-4 text-xl font-semibold text-[var(--text1)]">
                            P&L
                        </h2>

                        <LineChart dataX={dataX} dataY={dataY} />
                    </div>

                    {/* Calendario */}
                    <div className="lg:col-span-2 rounded-2xl border border-[var(--border2)] bg-[var(--bg2)] p-6">
                        <h2 className="mb-4 text-xl font-semibold text-[var(--text1)]">
                            Trading Calendar
                        </h2>

                        <TradingCalendar />
                    </div>

                    {/* Performance */}
                    <div className="rounded-2xl border border-[var(--border2)] bg-[var(--bg2)] p-6">
                        <h2 className="mb-4 text-xl font-semibold text-[var(--text1)]">
                            Performance by Pair
                        </h2>

                        <LineChart dataX={dataX} dataY={dataY} />
                    </div>

                </div>
            </section>
        </>
    )
}

export default Dashboard;