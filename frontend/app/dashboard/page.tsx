"use client";

import { useState } from "react";

type StyleOption = "Hollywood" | "Emotional" | "Motivational" | "Romantic" | "Corporate";

export default function DashboardPage() {
    const [files, setFiles] = useState<FileList | null>(null);
    const [style, setStyle] = useState<StyleOption>("Hollywood");
    const [duration, setDuration] = useState(30);
    const [aspectRatio, setAspectRatio] = useState("9:16");
    const [useVoiceover, setUseVoiceover] = useState(false);
    const [useMusic, setUseMusic] = useState(false);
    const [loading, setLoading] = useState(false);

    // Video State
    const [jobId, setJobId] = useState<string | null>(null);
    const [outputUrl, setOutputUrl] = useState<string | null>(null);

    // Co-Editor State
    const [storyboard, setStoryboard] = useState<any>(null);
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiles(e.target.files);
    };

    // 1. Initial Generation
    const handleGenerate = async () => {
        if (!files || files.length === 0) return;
        setLoading(true);
        setOutputUrl(null);
        setJobId(null);
        setChatHistory([]); // Clear chat on new run

        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));
        formData.append("style", style);
        formData.append("duration_seconds", duration.toString());
        formData.append("aspect_ratio", aspectRatio);
        formData.append("use_voiceover", useVoiceover.toString());
        formData.append("use_music", useMusic.toString());

        try {
            // A. Analyze & Get Storyboard
            const analyzeRes = await fetch("http://localhost:8000/api/analyze", {
                method: "POST",
                body: formData,
            });
            const sb = await analyzeRes.json();
            setStoryboard(sb);

            // B. Render Video
            await renderVideo(sb);

            // Add initial AI message with detailed breakdown
            const sceneSummary = sb.scenes.map((s: any, i: number) =>
                `\n${i + 1}. [${s.role.toUpperCase()}] ${s.start}s-${s.end}s: "${s.caption}"`
            ).join("");

            setChatHistory([{
                role: "ai",
                text: `I've created a ${style} style reel with ${sb.scenes.length} scenes:${sceneSummary}\n\nHow does it look?`
            }]);

        } catch (err) {
            console.error(err);
            alert("Failed to generate reel. Check console.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to render video from a storyboard
    const renderVideo = async (sb: any) => {
        const renderRes = await fetch("http://localhost:8000/api/render", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sb),
        });
        const job = await renderRes.json();
        setJobId(job.job_id);
        setOutputUrl(job.output_url ?? null);
    };

    // 2. Chat & Edit Logic
    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !storyboard) return;

        const userMsg = chatInput;
        setChatInput("");
        setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
        setIsEditing(true);

        try {
            const res = await fetch("http://localhost:8000/api/chat/edit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storyboard: storyboard,
                    message: userMsg
                }),
            });

            const result = await res.json();

            // Update State
            setStoryboard(result.storyboard);
            setChatHistory((prev) => [...prev, { role: "ai", text: result.explanation }]);

            // Auto-render the new version
            await renderVideo(result.storyboard);

        } catch (err) {
            console.error(err);
            setChatHistory((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't process that edit." }]);
        } finally {
            setIsEditing(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-50 font-sans">
            <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-4rem)]">

                {/* LEFT: Controls & Video */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-y-auto pr-2">
                    <header>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">
                            A.V.E.A Creator Studio
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">AI Video Editing Agent</p>
                    </header>

                    {/* Upload Section */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Source Media</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="video/*,image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Style</label>
                                <select
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value as StyleOption)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                    suppressHydrationWarning
                                >
                                    <option>Hollywood</option>
                                    <option>Emotional</option>
                                    <option>Motivational</option>
                                    <option>Romantic</option>
                                    <option>Corporate</option>
                                </select>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Format</label>
                                <select
                                    value={aspectRatio}
                                    onChange={(e) => {
                                        const newRatio = e.target.value;
                                        setAspectRatio(newRatio);
                                        // Auto-switch to "Auto" (0s) for YouTube, default 30s for Reels
                                        if (newRatio === "16:9") {
                                            setDuration(0);
                                        } else if (duration === 0) {
                                            setDuration(30);
                                        }
                                    }}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                    suppressHydrationWarning
                                >
                                    <option value="9:16">📱 Vertical (Reel/TikTok)</option>
                                    <option value="16:9">📺 Horizontal (YouTube)</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Duration</label>
                                <div className="flex gap-2">
                                    {[15, 30, 60, 0].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setDuration(s)}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${duration === s
                                                ? "bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/20"
                                                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                                }`}
                                            suppressHydrationWarning
                                        >
                                            {s === 0 ? "Auto" : `${s}s`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-3 grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={useMusic}
                                        onChange={(e) => setUseMusic(e.target.checked)}
                                        className="rounded border-slate-600 text-pink-500 focus:ring-pink-500 bg-slate-900"
                                    />
                                    <span>🎵 Add Music</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={useVoiceover}
                                        onChange={(e) => setUseVoiceover(e.target.checked)}
                                        className="rounded border-slate-600 text-pink-500 focus:ring-pink-500 bg-slate-900"
                                    />
                                    <span>🗣️ AI Voiceover</span>
                                </label>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !files || files.length === 0}
                                className="w-full py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-sm font-bold shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? "Analyzing..." : "Generate Reel"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex-1 min-h-[400px] border border-slate-800 rounded-xl bg-black overflow-hidden relative flex items-center justify-center">
                        {outputUrl ? (
                            <video
                                key={outputUrl} // Force reload on url change
                                src={`http://localhost:8000${outputUrl}`}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="text-center text-slate-600">
                                <div className="mb-2 text-4xl opacity-50">🎬</div>
                                <p className="text-sm">Video Preview Area</p>
                            </div>
                        )}

                        {(loading || isEditing) && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mx-auto mb-4"></div>
                                    <p className="text-pink-400 font-mono text-sm animate-pulse">
                                        {isEditing ? "AI is editing..." : "Processing media..."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {outputUrl && (
                        <a
                            href={`http://localhost:8000${outputUrl}`}
                            download={`avea_reel_${jobId}.mp4`}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-center shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Download Reel (.mp4)
                        </a>
                    )}
                </div>
            </div>

            {/* RIGHT: AI Co-Editor Chat */}
            <div className="lg:col-span-1 flex flex-col h-full border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/80">
                    <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        AI Co-Editor
                    </h2>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.length === 0 ? (
                        <div className="text-center mt-10 opacity-40">
                            <p className="text-sm">Generate a video to start editing.</p>
                        </div>
                    ) : (
                        chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === "user"
                                    ? "bg-indigo-600 text-white rounded-br-none"
                                    : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <form onSubmit={handleChatSubmit} className="relative">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Try: 'Remove the last scene' or 'Make it shorter'"
                            disabled={!storyboard || isEditing}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                            suppressHydrationWarning
                        />
                        <button
                            type="submit"
                            disabled={!chatInput.trim() || isEditing}
                            className="absolute right-2 top-2 p-1.5 text-pink-500 hover:text-pink-400 disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
