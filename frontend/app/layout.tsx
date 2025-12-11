import "./globals.css";
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: "A.V.E.A – Automated Video Editing Agent",
    description: "AI-powered Hollywood-style reels and shorts generator.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className="bg-slate-950 text-slate-50 min-h-screen"
                suppressHydrationWarning
            >
                {children}
            </body>
        </html>
    );
}
