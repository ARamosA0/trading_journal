import { useState } from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    // const [isSelected, setIsSelected] = useState(false);
    const [itemsMain, setItemsMain] = useState([
        {
            name: "Dashboard",
            isSelected: false,
            href: "/dashboard",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        },
        {
            name: "Trading Journal",
            isSelected: false,
            href: "/journal",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
        },
        {
            name: "Open Orders",
            isSelected: false,
            href: "/opentrades",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        },
    ])

    const [itemsManage, setItemsManage] = useState([
        {
            name: "Account",
            isSelected: false,
            href: "/accounts",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
        },
        {
            name: "Tools",
            isSelected: false,
            href: "/tools",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
        }
    ])

    const [itemsAccount, setItemsAccount] = useState([
        {
            name: "Profile",
            isSelected: false,
            href: "/profile",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        },
        {
            name: "LogOut",
            isSelected: false,
            href: "/logout",
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        },
    ])

    // const setItem = (item: any) => {
    //     if (!item.isSelected) {
    //         setItemsManage()
    //     }
    // }

    return (
        <aside className={`h-screen bg-[var(--bg2)] border-r border-[var(--border2)] shadow-sm transition-all duration-200 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
            <div className="flex items-center justify-between p-3 border-b border-[var(--border2)]">
                <h3 className={`text-lg font-semibold ${collapsed ? 'hidden' : 'block'}`}>KyroTrade</h3>
                <button
                    aria-label="Toggle sidebar"
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded hover:bg-[var(--bg3)]"
                >
                    <svg
                        className={`w-5 h-5 transform transition-transform ${collapsed ? '' : 'rotate-180'} text-[var(--text3)]`}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M8 5L16 12L8 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-auto p-3">
                <div className="mb-6">
                    <p className={`text-xs font-semibold text-gray-500 mb-2 ${collapsed ? 'hidden' : 'block'}`}>MAIN</p>
                    <nav className="space-y-1">
                        {itemsMain.map((item, key) => (
                            <Link 
                            to={item.href} key={key} 
                                onClick={() => {
                                    setItemsMain(prev =>
                                        prev.map(i => ({
                                            ...i,
                                            isSelected: i.href === item.href
                                        }))
                                    );
                                }}
                                className={`flex items-center space-x-3 text-sm hover:bg-[var(--bg3)] rounded p-2 ${item.isSelected ? 'text-[var(--purple)]': ''} ${item.isSelected ? 'bg-[var(--primary-dim)]': ''}`}>
                                <span className="inline-block w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    {item.icon}
                                </span>
                                <span className={`${collapsed ? 'hidden' : ''} text-[var(--text2)]`}>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div>
                    <p className={`text-xs font-semibold text-gray-500 mb-2 ${collapsed ? 'hidden' : 'block'}`}>MANAGE</p>
                    <nav className="space-y-1">
                        {itemsManage.map((item, key) => (
                            <Link to={item.href} key={key}
                                onClick={() => {
                                    setItemsMain(prev =>
                                        prev.map(i => ({
                                            ...i,
                                            isSelected: i.href === item.href
                                        }))
                                    );
                                }}
                                className={`flex items-center space-x-3 text-sm hover:bg-[var(--bg3)] rounded p-2 ${item.isSelected ? 'text-[var(--purple)]': ''} ${item.isSelected ? 'bg-[var(--primary-dim)]': ''}`}>
                                <span className="inline-block w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    {item.icon}
                                </span>
                                <span className={`${collapsed ? 'hidden' : ''} text-[var(--text2)]`}>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="p-3 border-t border-[var(border2)]">
                <div className="space-y-1">
                        {itemsAccount.map((item, key) => (
                            <Link to={item.href}
                                onClick={() => {
                                    setItemsMain(prev =>
                                        prev.map(i => ({
                                            ...i,
                                            isSelected: i.href === item.href
                                        }))
                                    );
                                }}
                                key={key} 
                                className={`flex items-center space-x-3 text-sm hover:bg-[var(--bg3)] rounded p-2 ${item.isSelected ? 'text-[var(--purple)]': ''} ${item.isSelected ? 'bg-[var(--primary-dim)]': ''}`}>
                                <span className="inline-block w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    {item.icon}
                                </span>
                                <span className={`${collapsed ? 'hidden' : ''} text-[var(--text2)]`}>{item.name}</span>
                            </Link>
                        ))}
                    {/* <button className="w-full text-left flex items-center space-x-3 text-sm hover:bg-gray-100 rounded p-2">
                        <span className="inline-block w-6 text-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        </span>
                        <span className={`${collapsed ? 'hidden' : ''} text-[var(--text2)]`}>Log Out</span>
                    </button> */}
                </div>
            </div>
        </aside>
    );
}