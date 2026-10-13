import { Outlet } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import { useState } from 'react'
import type { ReactNode } from 'react';
import { HeaderContext } from "../hook/HeaderContext"
import JournalHeader from "./JournalHeader";

export default function MainLayout() {
    const [header, setHeader] = useState<{
        title: string;
        subtitle: string;
        action?: ReactNode;
        action2?: ReactNode;
    }>({
        title: '',
        subtitle: '',
    });
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    return (
        <HeaderContext.Provider value={{ header, setHeader }}>
            <div className="min-h-screen bg-[var(--bg)] md:flex">
                <Sidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

                <main className="min-w-0 flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-4 sm:px-6 lg:px-10">
                        <button
                            type="button"
                            aria-label="Open navigation"
                            aria-expanded={mobileNavOpen}
                            onClick={() => setMobileNavOpen(true)}
                            className="mb-4 inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text2)] transition hover:border-[var(--accent)] hover:text-[var(--text)] md:hidden"
                        >
                            <span aria-hidden="true">☰</span>
                            Menu
                        </button>
                        <JournalHeader {...header} />
                        <Outlet />
                    </div>
                </main>
            </div>
        </HeaderContext.Provider>
    );
}
