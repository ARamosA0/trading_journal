import graphic from "../../assets/icons/hero.png";
import analytics from "../../assets/icons/analitics.png";
import calendar from "../../assets/icons/calendario.png";
import alerts from "../../assets/icons/campana.png";
import backtesting from "../../assets/icons/micro.png";
import money from "../../assets/icons/money.png";

const features = [
    {
        title: "Trade journal",
        description: "Log each trade with its setup, notes, screenshots, and the context behind your decisions.",
        icon: graphic,
    },
    {
        title: "Performance analytics",
        description: "Review your win rate, P&L, drawdown, and progress across the time periods that matter.",
        icon: analytics,
    },
    {
        title: "Crypto payments",
        description: "Support the product with BTC, ETH, USDT, and other supported cryptocurrencies.",
        icon: money,
    },
    {
        title: "Smart alerts",
        description: "Set custom price alerts and stay aware of opportunities and risk thresholds.",
        icon: alerts,
    },
    {
        title: "Position calculator",
        description: "Size positions around your risk rules across forex, crypto, and stock markets.",
        icon: calendar,
    },
    {
        title: "Backtesting",
        description: "Explore how your strategy performs against historical data before putting it to work.",
        icon: backtesting,
    },
];

const steps = [
    { number: "01", title: "Record", description: "Capture the setup, execution, and reasoning behind each trade." },
    { number: "02", title: "Review", description: "Look for patterns in your results with a clear performance history." },
    { number: "03", title: "Refine", description: "Use what you learn to make your next process more intentional." },
];

function Features() {
    return (
        <div>
            <section id="features" aria-labelledby="features-title" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-2xl text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Built around your process</p>
                        <h2 id="features-title" className="mt-4 text-balance text-3xl font-semibold tracking-tight text-text sm:text-5xl">
                            Everything you need to <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(110deg, #a78bfa, #67e8f9)" }}>trade with clarity.</span>
                        </h2>
                        <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-text2 sm:text-lg">
                            Practical tools to help you document decisions, understand your results, and build better habits over time.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
                        {features.map((feature) => (
                            <article key={feature.title} className="group rounded-2xl border border-white/[0.08] bg-[var(--bg2)] p-6 transition-colors hover:border-primary/40 sm:p-7">
                                <div className="mb-6 flex size-12 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] transition-colors group-hover:bg-primary/10">
                                    <img src={feature.icon} alt="" width={32} height={32} loading="lazy" className="size-8 object-contain" />
                                </div>
                                <h3 className="text-lg font-semibold tracking-tight text-text">{feature.title}</h3>
                                <p className="mt-2.5 text-sm leading-6 text-text2">{feature.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section aria-labelledby="process-title" className="border-y border-white/[0.06] bg-white/[0.015] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div className="max-w-xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">A process you can repeat</p>
                            <h2 id="process-title" className="mt-4 text-balance text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                                Turn every trade into a lesson.
                            </h2>
                        </div>
                        <p className="max-w-xl text-pretty text-base leading-7 text-text2 lg:justify-self-end">
                            Progress starts with an honest record. Bring your trade history and performance review together in one place.
                        </p>
                    </div>

                    <ol className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3">
                        {steps.map((step, index) => (
                            <li key={step.number} className="relative rounded-2xl border border-white/[0.08] bg-[var(--bg)] p-6 sm:p-7">
                                {index < steps.length - 1 && <span aria-hidden="true" className="absolute right-0 top-10 hidden h-px w-4 translate-x-full bg-border2 md:block" />}
                                <span className="font-mono text-xs font-semibold tracking-[0.16em] text-accent">{step.number}</span>
                                <h3 className="mt-5 text-xl font-semibold text-text">{step.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-text2">{step.description}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </div>
    );
}

export default Features;
