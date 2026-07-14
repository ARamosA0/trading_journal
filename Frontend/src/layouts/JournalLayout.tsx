import { Outlet } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import { useState } from 'react'
import { HeaderContext } from "../hook/HeaderContext"
import JournalHeader from "./JournalHeader";

export default function MainLayout() {
    const [header, setHeader] = useState({
        title: '',
        subtitle: '',
        action: null,
        action2: null,
    });
    return (
        <HeaderContext.Provider value={{ header, setHeader }}>
            <div className="flex h-screen">
                <aside className="sticky top-0 h-screen overflow-y-auto">
                    <Sidebar />
                </aside>

                <main className="flex-1 overflow-y-auto p-4">
                    <div className="container mx-auto">
                        <JournalHeader {...header} />
                        <Outlet />
                    </div>
                </main>
            </div>
        </HeaderContext.Provider>
    );
}