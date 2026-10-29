import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="border-t border-white/[0.08] bg-[var(--bg2)]">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                <Link to="/" className="inline-flex w-fit items-center gap-2.5 rounded-md text-sm font-semibold tracking-tight text-text transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" translate="no">
                    <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg text-[10px] font-black text-bg" style={{ backgroundImage: "linear-gradient(135deg, var(--primary), var(--accent))" }}>TV</span>
                    TradeVault
                </Link>
                <p className="text-sm text-[var(--text3)]">A journal for more intentional trading.</p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <a href="#about" className="rounded-sm text-text2 transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Overview</a>
                    <a href="#features" className="rounded-sm text-text2 transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Features</a>
                    <a href="#pricing" className="rounded-sm text-text2 transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Support</a>
                    <span className="text-[var(--text3)]">© 2026 TradeVault</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
