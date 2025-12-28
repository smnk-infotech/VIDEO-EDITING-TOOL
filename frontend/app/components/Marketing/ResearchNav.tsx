'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ResearchNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Identity */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="h-6 w-6 rounded-full bg-slate-900 group-hover:bg-indigo-600 transition-colors" />
                    <span className="font-semibold text-lg tracking-tight text-slate-900">
                        prema.ai <span className="text-slate-400 font-normal">/ research</span>
                    </span>
                </Link>

                {/* Primary Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <NavLink href="/product" label="Product" active={isActive('/product')} />
                    <NavLink href="/technology" label="Technology" active={isActive('/technology')} />
                    <NavLink href="/research" label="Research" active={isActive('/research')} />
                    <NavLink href="/ethics" label="Ethics" active={isActive('/ethics')} />
                    <NavLink href="/about" label="About" active={isActive('/about')} />
                </div>

                {/* Action */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/setup"
                        className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-black transition-colors shadow-lg shadow-slate-200"
                    >
                        Launch Console
                    </Link>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`text-sm transition-colors ${active ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
        >
            {label}
        </Link>
    );
}
