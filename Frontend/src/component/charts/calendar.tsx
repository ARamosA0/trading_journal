import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function TradingCalendar() {
    const tradingDays = {
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
                            className={`mt-2 text-sm font-bold ${
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
                .profit-day {
                    background: rgba(34,197,94,.2) !important;
                    text: center !important;
                }

                .loss-day {
                    background: rgba(239,68,68,.2) !important;
                    text: center !important;
                }

                .fc-toolbar-title {
                    color: white;
                }
            `}</style>
        </>
    );
}

function renderDays(eventInfo) {
    return (
        <>
            <b>{eventInfo.timeText}</b>
            <i>{eventInfo.event.title}</i>
        </>
    )
}