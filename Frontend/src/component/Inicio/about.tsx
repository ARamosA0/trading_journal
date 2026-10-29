
import { Link } from "react-router-dom";

function About() {
    return (
        <section id="about" aria-labelledby="landing-title" className="relative isolate scroll-mt-24 overflow-hidden border-b border-white/5">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{ backgroundImage: "radial-gradient(ellipse at 76% 40%, rgba(139, 92, 246, .16), transparent 42%), radial-gradient(ellipse at 12% 0%, rgba(6, 182, 212, .08), transparent 32%)" }}
            />
            <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:px-8 lg:py-28">
                <div className="max-w-2xl">
                    <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary2)]">
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                        A clearer view of your trading
                    </p>
                    <h1 id="landing-title" className="text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.045em] text-text sm:text-6xl lg:text-7xl">
                        Trade with a plan.
                        <br />
                        Learn from every <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(110deg, #a78bfa, #67e8f9)" }}>trade.</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-text2 sm:text-lg sm:leading-8">
                        A trading journal for building consistency. Record your decisions, review your performance, and make your process easier to improve.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            to="/signup"
                            className="inline-flex min-h-12 items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-bg shadow-xl shadow-primary/20 transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                            style={{ backgroundImage: "linear-gradient(110deg, var(--primary), var(--accent))" }}
                        >
                            Start your journal
                            <span aria-hidden="true" className="ml-2 text-base">→</span>
                        </Link>
                        <a
                            href="#features"
                            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-text transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                        >
                            Explore features
                        </a>
                    </div>
                    <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[var(--text3)]">
                        <span>Forex</span>
                        <span aria-hidden="true" className="size-1 rounded-full bg-border2" />
                        <span>Crypto</span>
                        <span aria-hidden="true" className="size-1 rounded-full bg-border2" />
                        <span>Stocks</span>
                    </div>
                </div>

                <figure className="relative mx-auto w-full max-w-2xl">
                    <div aria-hidden="true" className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/10 blur-3xl" />
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg2)] p-3 shadow-2xl shadow-black/40 sm:rounded-3xl sm:p-5">
                        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-2 pb-4 sm:px-3">
                            <div className="flex items-center gap-3">
                                <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-xl text-xs font-black text-bg" style={{ backgroundImage: "linear-gradient(135deg, var(--primary), var(--accent))" }}>TV</span>
                                <div>
                                    <p className="text-sm font-semibold text-text">Trade journal</p>
                                <p className="mt-0.5 text-xs text-[var(--text3)]">Performance overview</p>
                                </div>
                            </div>
                            <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">Sample data</span>
                        </div>

                        <div className="grid gap-3 py-4 sm:gap-4 sm:py-5 md:grid-cols-[1.45fr_0.9fr]">
                            <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-[var(--text3)]">Portfolio balance</p>
                                        <p className="mt-1.5 font-mono text-2xl font-semibold tracking-tight text-text tabular-nums sm:text-3xl">$48,352.80</p>
                                    </div>
                                    <span className="rounded-md bg-[var(--green-dim)] px-2 py-1 text-xs font-semibold text-[var(--green)]">+12.4%</span>
                                </div>
                                <p className="mt-1 text-xs text-[var(--text3)]">Illustrative monthly performance</p>
                                <div className="mt-5 rounded-lg bg-[var(--bg)]/70 px-2 pt-3">
                                    <svg role="img" aria-label="Illustrative balance chart trending upward" viewBox="0 0 420 140" className="h-32 w-full" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="landing-chart-fill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
                                                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0 112H420M0 70H420M0 28H420" stroke="rgba(148,163,184,.1)" strokeDasharray="4 6" />
                                        <path d="M0 112 C35 104 45 91 78 96 S123 80 153 85 S200 54 228 68 S271 47 302 52 S354 25 382 34 L420 16 V140 H0Z" fill="url(#landing-chart-fill)" />
                                        <path d="M0 112 C35 104 45 91 78 96 S123 80 153 85 S200 54 228 68 S271 47 302 52 S354 25 382 34 L420 16" fill="none" stroke="var(--primary2)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                                        <circle cx="420" cy="16" r="4" fill="var(--accent)" />
                                    </svg>
                                    <div aria-hidden="true" className="flex justify-between px-1 pb-2 text-[9px] font-medium uppercase tracking-wider text-[var(--text3)]">
                                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Today</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                                    <p className="text-xs font-medium text-[var(--text3)]">Win rate</p>
                                    <div className="mt-2 flex items-end justify-between gap-2">
                                        <p className="font-mono text-3xl font-semibold tracking-tight text-text tabular-nums">68%</p>
                                        <span aria-hidden="true" className="mb-1 flex size-9 items-center justify-center rounded-full border-[3px] border-[var(--green)] text-[10px] font-semibold text-[var(--green)]">68</span>
                                    </div>
                                    <p className="mt-1 text-xs text-[var(--text3)]">42 wins <span aria-hidden="true">·</span> 20 losses</p>
                                </div>
                                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-medium text-[var(--text3)]">Recent trades</p>
                                        <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                                    </div>
                                    <ul className="mt-3 space-y-3 text-xs">
                                        <li className="flex items-center justify-between gap-2"><span className="font-medium text-text">EUR/USD</span><span className="font-mono text-[var(--green)] tabular-nums">+$240</span></li>
                                        <li className="flex items-center justify-between gap-2"><span className="font-medium text-text">BTC/USDT</span><span className="font-mono text-[var(--red)] tabular-nums">−$85</span></li>
                                        <li className="flex items-center justify-between gap-2"><span className="font-medium text-text">GBP/JPY</span><span className="font-mono text-[var(--green)] tabular-nums">+$180</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <figcaption className="mt-3 text-center text-xs text-[var(--text3)]">Illustrative dashboard preview — sample figures, not live account data.</figcaption>
                </figure>
            </div>
        </section>
    );
}

export default About;
