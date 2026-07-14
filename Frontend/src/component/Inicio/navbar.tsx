import { useState } from 'react';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { label: 'About', href: '#about' },
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
    ];

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 border-border2 bg-bg3 py-5">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <a href="/" className="font-bold text-xl flex items-center gap-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--text)' }}>
                            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                                <span className="text-xs font-bold" style={{ color: 'var(--bg)' }}>KT</span>
                            </div>
                            KyroTrade
                        </a>
                    </div>

                      {/* Navigation + Buttons */}
                    <div className="hidden md:flex items-center gap-10">
                        {/* Navigation */}
                        <div className="flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                            key={link.label}
                            href={link.href}
                            onClick={(e) => handleLinkClick(e, link.href)}
                            className="font-medium transition-colors duration-300 hover:opacity-70"
                            style={{ color: "var(--text2)" }}
                            >
                            {link.label}
                            </a>
                        ))}
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-4">
                        <a
                            href="/login"
                            className="font-medium px-4 py-2 rounded transition-colors duration-300 hover:opacity-70"
                            style={{ color: "var(--text2)" }}
                        >
                            Login
                        </a>

                        <a
                            href="/signup"
                            className="font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{ background: "var(--gradient)" }}
                        >
                            Get Started
                        </a>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded transition-colors duration-300 text-2xl"
                            style={{ color: 'var(--text2)' }}
                        >
                            {isOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden border-t pb-4" style={{ borderColor: 'var(--border2)' }}>
                        <div className="space-y-2 pt-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => handleLinkClick(e, link.href)}
                                    className="block px-4 py-2 rounded transition-colors duration-300 hover:opacity-70"
                                    style={{ color: 'var(--text2)' }}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="border-t pt-3 space-y-2" style={{ borderColor: 'var(--border2)' }}>
                                <a
                                    href="/login"
                                    className="block px-4 py-2 rounded transition-colors duration-300 hover:opacity-70"
                                    style={{ color: 'var(--text2)' }}
                                >
                                    Login
                                </a>
                                <a
                                    href="/signup"
                                    className="block px-4 py-2 rounded font-medium text-center transition-all duration-300 hover:opacity-80"
                                    style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}
                                >
                                    Get Started
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;