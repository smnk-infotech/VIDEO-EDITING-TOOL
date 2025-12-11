"use client";

import { Check } from "lucide-react";

interface PresetsGridProps {
    selectedStyle: string;
    onStyleSelect: (style: string) => void;
}

const STYLES = [
    { id: "Aesthetic", label: "Aesthetic", color: "bg-pink-100", emoji: "✨" },
    { id: "Storytelling", label: "Storytelling", color: "bg-blue-100", emoji: "📖" },
    { id: "Power", label: "Power", color: "bg-amber-100", emoji: "⚡" },
    { id: "News", label: "News", color: "bg-green-100", emoji: "📰" },
    { id: "Subtle", label: "Subtle", color: "bg-slate-100", emoji: "☁️" },
    { id: "Clean", label: "Clean", color: "bg-indigo-100", emoji: "🧹" },
];

export default function PresetsGrid({ selectedStyle, onStyleSelect }: PresetsGridProps) {
    return (
        <div className="p-6 h-full overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Video Presets</h2>
            <p className="text-sm text-slate-500 mb-6">Choose a style for your video</p>

            <div className="grid grid-cols-2 gap-4">
                {STYLES.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => onStyleSelect(style.id)}
                        className={`relative group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left hover:shadow-md ${selectedStyle === style.id
                                ? "border-indigo-600 bg-indigo-50/50"
                                : "border-transparent bg-slate-50 hover:bg-white hover:border-slate-200"
                            }`}
                    >
                        {/* Mock Preview Image / Placeholder */}
                        <div className={`w-full aspect-[9/16] rounded-lg ${style.color} flex items-center justify-center text-4xl shadow-inner`}>
                            {style.emoji}
                        </div>

                        <span className={`font-semibold text-sm ${selectedStyle === style.id ? "text-indigo-700" : "text-slate-700"
                            }`}>
                            {style.label}
                        </span>

                        {/* Checkmark badge */}
                        {selectedStyle === style.id && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                <Check size={14} strokeWidth={3} />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
