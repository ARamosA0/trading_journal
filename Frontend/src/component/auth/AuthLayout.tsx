import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
    title: string;
    description: string;
    children: ReactNode;
};

const processSteps = [
    { number: "01", label: "Record each decision" },
    { number: "02", label: "Review your patterns" },
    { number: "03", label: "Refine your process" },
];

function AuthLayout({ title, description, children }: AuthLayoutProps) {
    return (
        <main className="relative flex min-h-screen items-center overflow-x-clip bg-[var(--bg)] px-4 py-20 sm:px-6 lg:px-8 lg:py-12">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "radial-gradient(ellipse at 18% 45%, rgba(139, 92, 246, .12), transparent 38%), radial-gradient(ellipse at 88% 8%, rgba(6, 182, 212, .07), transparent 30%)",
                }}
            />

            <Link
                to="/"
                className="absolute left-4 top-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-[var(--bg2)] px-3.5 text-sm font-medium text-text2 transition-colors hover:border-white/20 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:left-6 sm:top-6 lg:left-8"
            >
                <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10h9" />
                </svg>
                Back to home
            </Link>

            <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(400px,460px)] lg:gap-16">
                <aside className="hidden max-w-lg flex-col justify-between self-stretch py-10 lg:flex">
                    <Link to="/" className="inline-flex w-fit items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" translate="no">
                        <img src="/favicon.svg" alt="" width="40" height="40" />
                        <span className="text-xl font-semibold tracking-tight text-text">TradeVault</span>
                    </Link>

                    <div className="my-12">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Your trading journal</p>
                        <h2 className="mt-5 text-balance text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-text">
                            Make every trade a lesson.
                        </h2>
                        <p className="mt-5 max-w-md text-pretty text-base leading-7 text-text2">
                            Keep your decisions, performance, and next steps in one thoughtful workspace.
                        </p>

                        <ol className="mt-9 space-y-4">
                            {processSteps.map((step) => (
                                <li key={step.number} className="flex items-center gap-4 text-sm text-text2">
                                    <span className="font-mono text-xs font-semibold tracking-widest text-accent">{step.number}</span>
                                    <span>{step.label}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <p className="text-xs text-[var(--text3)]">A journal for more intentional trading.</p>
                </aside>

                <section aria-labelledby="auth-title" className="mx-auto w-full max-w-[460px]">
                    <Link to="/" className="mb-6 flex w-fit items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:hidden" translate="no">
                        <img src="/favicon.svg" alt="" width="36" height="36" />
                        <span className="text-lg font-semibold tracking-tight text-text">TradeVault</span>
                    </Link>

                    <div className="rounded-2xl border border-white/10 bg-[var(--bg2)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:rounded-3xl sm:p-9">
                        <div className="mb-7">
                            <h1 id="auth-title" className="text-3xl font-semibold tracking-tight text-text">{title}</h1>
                            <p className="mt-2 text-sm leading-6 text-text2">{description}</p>
                        </div>
                        {children}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default AuthLayout;
