import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
    return (
        <main className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-indigo-100">
            {/* Navbar */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-transparent">
                <div className="mx-auto max-w-7xl flex items-center justify-between py-4 px-6 md:px-10">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-lime-400 to-green-500 flex items-center justify-center">
                            <Sparkles className="text-white w-4 h-4" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-800">
                            prema.ai
                        </span>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-6 pt-32 pb-20 gap-16">

                {/* Left Content */}
                <div className="flex-1 max-w-xl space-y-8">
                    <button className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                        ← Back to library
                    </button>

                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-lime-400 to-green-500 mb-6 shadow-lg shadow-lime-200"></div>

                        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900">
                            Edit with <span className="italic font-serif text-slate-700">A.V.E.A</span>,<br />
                            Your AI Editing Agent
                        </h1>

                        <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                            B-rolls, subtitles, animations, hook—A.V.E.A handles it all.
                            To fine-tune, simply drop a message.
                        </p>
                    </div>

                    <div className="pt-4">
                        <Link
                            href="/setup"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                        >
                            Upload your talking video
                        </Link>

                        <div className="mt-6 text-sm text-slate-400">
                            <p>Works best with videos under 100MB and 3 mins.</p>
                            <p className="mt-1 underline cursor-pointer hover:text-slate-600">Just exploring? Try our sample video</p>
                        </div>
                    </div>
                </div>

                {/* Right Visual (Phone + Chat Bubble Mockup) */}
                <div className="flex-1 flex justify-center relative w-full max-w-md md:max-w-xl">
                    {/* Mock Phone */}
                    <div className="relative z-10 w-72 md:w-80 aspect-[9/19] bg-slate-900 rounded-[3rem] border-8 border-slate-900 overflow-hidden shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                        {/* Mock Video Content */}
                        <div className="absolute inset-0 bg-slate-800">
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                                alt="Demo Video"
                                className="w-full h-full object-cover opacity-80"
                            />
                            {/* Mock Subtitles */}
                            <div className="absolute bottom-20 left-4 right-4 text-center">
                                <span className="bg-yellow-400 text-black font-black text-xl px-2 py-1 rotate-2 inline-block shadow-lg">
                                    LIKE ELON MUSK
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Checkmark Floating UI */}
                    <div className="absolute top-20 -right-4 md:right-8 bg-white p-4 rounded-2xl shadow-xl z-20 animate-bounce delay-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Subtitles Generated</p>
                                <p className="text-[10px] text-slate-400">Accuracy 99%</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Bubble Mockup */}
                    <div className="absolute bottom-20 -left-8 md:-left-12 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-slate-100 max-w-[260px] z-30 transform translate-y-4 hover:-translate-y-1 transition-transform">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-lime-400 to-green-500"></div>
                            <span className="text-xs font-bold text-slate-700">Chat with A.V.E.A</span>
                        </div>
                        <div className="bg-slate-50 text-slate-600 text-xs p-3 rounded-xl rounded-tl-none mb-2 border border-slate-100">
                            Hey! I removed the silence at 0:12. Want me to add some B-roll?
                        </div>
                        <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg border border-indigo-100">Add B-rolls</span>
                            <span className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">Edit Hook</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
