import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { Trade } from "../../api/trades";

function dateKey(value: string) {
    const date = new Date(value);
    return localDateKey(date);
}

function localDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function TradingCalendar({ trades }: { trades: Trade[] }) {
    const tradingDays = trades.reduce<Record<string, { pnl: number; count: number }>>((days, trade) => {
        const key = dateKey(trade.closeAt ?? trade.openAt);
        const day = days[key] ?? { pnl: 0, count: 0 };
        days[key] = { pnl: day.pnl + (trade.pnl || 0), count: day.count + 1 };
        return days;
    }, {});

    return (
        <>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                dayCellClassNames={(arg) => {
                    const date = localDateKey(arg.date);
                    const day = tradingDays[date];

                    if (!day) return [];

                    return day.pnl >= 0 ? ["profit-day"] : ["loss-day"];
                }}
                dayCellContent={(arg) => {
                    const date = localDateKey(arg.date);
                    const day = tradingDays[date];

                    return (
                    <div className="flex flex-col h-full p-1">
                        <span className="text-xs font-medium">{arg.dayNumberText}</span>

                        {day && (
                        <span
                            title={`${day.count} trade${day.count === 1 ? "" : "s"}`}
                            className={`mt-2 font-mono text-sm font-bold ${
                            day.pnl >= 0 ? "text-green-400" : "text-red-400"
                            }`}
                        >
                            {day.pnl >= 0 ? "+" : ""}${day.pnl}
                        </span>
                        )}
                    </div>
                    );
                }}
            />

            <style>{`
                .profit-day { background: rgba(16,185,129,.1) !important; }

                .loss-day { background: rgba(244,63,94,.1) !important; }

                .fc { --fc-border-color: var(--border); --fc-page-bg-color: transparent; --fc-neutral-bg-color: var(--bg3); --fc-today-bg-color: rgba(34,211,238,.06); color: var(--text2); font-family: var(--font); }
                .fc-toolbar-title { color: var(--text); font-size: 1rem !important; }
                .fc-button { background: var(--surface) !important; border: 1px solid var(--border2) !important; color: var(--text2) !important; box-shadow: none !important; text-transform: capitalize; }
                .fc-button:hover { background: var(--bg3) !important; color: var(--text) !important; }
                .fc-daygrid-day-number { color: var(--text3); font-size: .75rem; }
                .fc-col-header-cell-cushion { color: var(--text3); font-size: .65rem; text-transform: uppercase; letter-spacing: .1em; }
                .fc-daygrid-day-frame { min-height: 4.5rem; }
                .fc-scrollgrid { border-radius: 8px; overflow: hidden; }
            `}</style>
        </>
    );
}
