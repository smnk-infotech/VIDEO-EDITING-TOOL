import Link from "next/link";

export default function HomePage() {
    return (
        <main className="min-h-screen flex flex-col">
            <header className="border-b border-slate-800">
                <div className="mx-auto max-w-6xl flex items-center justify-between py-4 px-4">
                    <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-500" />
                        <span className="font-semibold tracking-tight text-lg">
                            A.V.E.A
                        </span>
                    </div>
                    <nav className="flex gap-6 text-sm text-slate-300">
                        <Link href="#features">Features</Link>
                        <Link href="#how">How it works</Link>
                        <Link href="/dashboard" className="font-semibold text-pink-400">
                            Launch App →
                        </Link>
                    </nav>
                </div>
            </header>

            <section className="flex-1">
                <div className="mx-auto max-w-6xl px-4 py-16 grid gap-10 md:grid-cols-2 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
                            Automated Hollywood-style{" "}
                            <span className="text-pink-400">reels & shorts</span> from your
                            raw clips.
                        </h1>
                        <p className="text-slate-300 mb-6">
                            Upload videos, clips, and images. A.V.E.A uses Gemini, Veo 3 and
                            AI-powered editing to cut, grade, and stitch everything into viral-ready 9:16 content –
                            automatically.
                        </p>
                        <div className="flex gap-4">
                            <Link
                                href="/dashboard"
                                className="px-5 py-2.5 rounded-lg bg-pink-500 text-sm font-semibold shadow-lg shadow-pink-500/40"
                            >
                                Launch Creator Studio
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[9/16] w-full max-w-xs mx-auto rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl shadow-pink-500/30">
                            <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                                Reel preview placeholder
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
