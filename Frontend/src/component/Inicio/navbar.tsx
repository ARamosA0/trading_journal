import { useState } from "react";
import { Link } from "react-router-dom";

const navLinks = [
    { label: "Overview", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "Support", href: "#pricing" },
];

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-bg/90 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link
                        to="/"
                        onClick={closeMenu}
                        className="inline-flex items-center gap-3 rounded-md font-semibold tracking-tight text-text transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                        translate="no"
                    >
                        <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-xl text-sm font-black text-bg shadow-lg shadow-primary/20" style={{ backgroundImage: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
                            TV
                        </span>
                        <span className="text-lg">TradeVault</span>
                    </Link>

                    <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="rounded-sm text-sm font-medium text-text2 transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        <Link
                            to="/login"
                            className="rounded-lg px-4 py-2.5 text-sm font-medium text-text2 transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/signup"
                            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-bg shadow-lg shadow-primary/15 transition-[filter,transform] hover:brightness-110 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                            style={{ backgroundImage: "linear-gradient(135deg, var(--primary), var(--accent))" }}
                        >
                            Get started
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <button
                            type="button"
                            onClick={() => setIsOpen((open) => !open)}
                            className="flex size-10 items-center justify-center rounded-lg border border-white/10 text-text2 transition-colors hover:border-white/20 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                            aria-expanded={isOpen}
                            aria-controls="mobile-navigation"
                        >
                            {isOpen ? (
                                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="m6 6 12 12M18 6 6 18" />
                                </svg>
                            ) : (
                                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M4 7h16M4 12h16M4 17h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <nav
                    id="mobile-navigation"
                    aria-label="Mobile navigation"
                    className={`${isOpen ? "block" : "hidden"} border-t border-white/10 pb-4 md:hidden`}
                >
                    <div className="space-y-1 pt-3">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={closeMenu}
                                className="block rounded-lg px-3 py-3 text-sm font-medium text-text2 transition-colors hover:bg-white/5 hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                            <Link
                                to="/login"
                                onClick={closeMenu}
                                className="rounded-lg border border-white/10 px-4 py-3 text-center text-sm font-medium text-text transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-primary"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/signup"
                                onClick={closeMenu}
                                className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-bg transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-primary"
                                style={{ backgroundImage: "linear-gradient(135deg, var(--primary), var(--accent))" }}
                            >
                                Get started
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
