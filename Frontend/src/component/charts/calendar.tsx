import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function TradingCalendar() {
    const tradingDays: Record<string, { pnl: number }> = {
        "2026-07-08": {
            pnl: 245,
        },
        "2026-07-10": {
            pnl: -80,
        },
    };
    return (
        <>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                dayCellClassNames={(arg) => {
                    const date = arg.date.toISOString().split("T")[0];
                    const day = tradingDays[date];

                    if (!day) return [];

                    return day.pnl >= 0 ? ["profit-day"] : ["loss-day"];
                }}
                dayCellContent={(arg) => {
                    const date = arg.date.toISOString().split("T")[0];
                    const day = tradingDays[date];

                    return (
                    <div className="flex flex-col h-full p-1">
                        <span className="text-xs font-medium">{arg.dayNumberText}</span>

                        {day && (
                        <span
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
