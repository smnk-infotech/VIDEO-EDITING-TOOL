"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MarketingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold tracking-tighter">
                        prema<span className="text-indigo-500">.ai</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/technology" className={`hover:text-white transition-colors ${pathname === '/technology' ? 'text-white' : 'text-slate-400'}`}>
                            Technology
                        </Link>
                        <Link href="/contact" className={`hover:text-white transition-colors ${pathname === '/contact' ? 'text-white' : 'text-slate-400'}`}>
                            Contact
                        </Link>
                    </nav>

                    <nav className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            Login
                        </Link>
                        <Link href="/setup" className="px-5 py-2.5 bg-white text-slate-950 rounded-full text-sm font-bold hover:bg-slate-200 transition-colors">
                            Launch App
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="relative z-0">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 border-t border-white/5 py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                        <div>
                            <Link href="/" className="text-2xl font-bold tracking-tighter mb-4 block">
                                prema<span className="text-indigo-500">.ai</span>
                            </Link>
                            <p className="text-slate-400 max-w-xs">
                                The world's first Cognitive Director AI for high-performance video editing.
                            </p>
                            <div className="mt-8 text-xs text-slate-600">
                                © 2025 Prema AI Inc.
                            </div>
                        </div>

                        <div className="flex gap-16">
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-white">Product</h4>
                                <Link href="/setup" className="text-slate-400 hover:text-white transition-colors">Director Mode</Link>
                                <Link href="/technology" className="text-slate-400 hover:text-white transition-colors">Engine V2</Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-white">Company</h4>
                                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link>
                                <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
