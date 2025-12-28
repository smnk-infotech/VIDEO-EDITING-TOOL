import "./globals.css";
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: "prema.ai – Cognitive Director Video Agent",
    description: "The world's first autonomous Director AI for viral video editing.",
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
