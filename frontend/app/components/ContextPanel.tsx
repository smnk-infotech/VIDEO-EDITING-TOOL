"use client";

import PresetsGrid from "./PresetsGrid";

interface ContextPanelProps {
    activeTab: string;
    selectedStyle: string;
    onStyleSelect: (style: string) => void;
    files: File[];
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    aspectRatio: string;
    setAspectRatio: (r: string) => void;
    duration: number;
    setDuration: (d: number) => void;
}

export default function ContextPanel({
    activeTab,
    selectedStyle,
    onStyleSelect,
    files,
    onUpload,
    aspectRatio,
    setAspectRatio,
    duration,
    setDuration
}: ContextPanelProps) {

    return (
        <div className="w-[360px] h-screen bg-white border-r border-slate-200 flex flex-col shrink-0">

            {activeTab === "presets" && (
                <PresetsGrid selectedStyle={selectedStyle} onStyleSelect={onStyleSelect} />
            )}

            {activeTab === "settings" && (
                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Settings</h2>

                    {/* Format Selector from old UI */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Format</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => { setAspectRatio("9:16"); if (duration === 0) setDuration(30); }}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${aspectRatio === "9:16" ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                            >
                                📱 Vertical
                            </button>
                            <button
                                onClick={() => { setAspectRatio("16:9"); setDuration(0); }}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${aspectRatio === "16:9" ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                            >
                                📺 Horizontal
                            </button>
                        </div>
                    </div>

                    {/* Duration Selector */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Target Duration</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[15, 30, 60, 0].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`py-2 rounded-lg border text-xs font-bold transition-all ${duration === d ? "bg-indigo-100 text-indigo-700 border-indigo-300" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                                >
                                    {d === 0 ? "AUTO" : `${d}s`}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                            {duration === 0 ? "AI will decide optimal length based on footage." : `Video will be maximum ${duration} seconds.`}
                        </p>
                    </div>

                    {/* File Manager (Mini) */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Uploaded Files ({files.length})</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {files.slice(0, 6).map((file, i) => (
                                <div key={i} className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-xs text-slate-400 overflow-hidden relative">
                                    {file.type.startsWith("image") ? "IMG" : "VID"}
                                </div>
                            ))}
                            {files.length > 6 && (
                                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-xs text-slate-400 font-medium">
                                    +{files.length - 6}
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            multiple
                            onChange={onUpload}
                            className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                    cursor-pointer"
                        />
                    </div>

                </div>
            )}

            {/* Placeholder for other tabs */}
            {["b-rolls", "emojis", "subtitles"].includes(activeTab) && (
                <div className="p-10 text-center text-slate-400">
                    <p>Coming Soon in Phase 2</p>
                </div>
            )}

        </div>
    );
}
