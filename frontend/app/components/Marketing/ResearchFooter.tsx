'use client';
import Link from 'next/link';
import { Sparkles, Globe } from 'lucide-react';

export default function ResearchFooter() {
    return (
        <footer className="bg-white border-t border-slate-200 text-slate-600 font-sans mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Identity */}
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold tracking-tight text-slate-700 flex items-center gap-1">
                            <span className="text-blue-600">Prema</span>
                            <span className="text-slate-500 font-normal">Research</span>
                        </span>
                        <span className="text-slate-300 mx-2">|</span>
                        <span className="text-xs text-slate-400">© 2025 Prema AI</span>
                    </div>

                    {/* Compact Nav */}
                    <nav className="flex flex-wrap items-center gap-6 text-sm font-medium">
                        <Link href="/product" className="hover:text-slate-900 transition-colors">Product</Link>
                        <Link href="/technology" className="hover:text-slate-900 transition-colors">Technology</Link>
                        <Link href="/research" className="hover:text-slate-900 transition-colors">Research</Link>
                        <Link href="/about" className="hover:text-slate-900 transition-colors">About</Link>
                        <Link href="/careers" className="hover:text-slate-900 transition-colors">Careers</Link>
                    </nav>

                    {/* Legal / Social */}
                    <div className="flex items-center gap-6 text-xs text-slate-500">
                        <Link href="/contact" className="hover:text-slate-800">Contact</Link>
                        <Link href="/privacy" className="hover:text-slate-800">Privacy</Link>
                        <Link href="/terms" className="hover:text-slate-800">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="text-slate-500 hover:text-slate-900 transition-colors">
            {children}
        </Link>
    );
}
