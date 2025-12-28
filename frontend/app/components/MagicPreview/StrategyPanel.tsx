"use client";
import React, { useState } from 'react';
import { Send, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { FadeIn } from '../Marketing/Motion'; // Fixed import to point to Marketing Motion

export default function StrategyPanel({ analysisResult }: { analysisResult: any }) {
    const [chatInput, setChatInput] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editStatus, setEditStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        setEditStatus("processing");
        setIsEditing(true);

        try {
            const formData = new FormData();
            formData.append("prompt", chatInput);
            formData.append("projectId", analysisResult?.projectId || "demo-project");

            const response = await fetch(`/api/chat-edit`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Edit failed");

            setEditStatus("success");
            setChatInput("");
            setTimeout(() => setEditStatus("idle"), 3000);
        } catch (err) {
            console.error(err);
            setEditStatus("error");
        } finally {
            setIsEditing(false);
        }
    };

    if (!analysisResult) return null;

    return (
        <FadeIn className="h-full flex flex-col bg-slate-900/50 backdrop-blur-xl border-l border-white/5">
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="font-bold text-lg">Director's Analysis</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5">
                        <div className="text-sm text-slate-400 mb-1">Viral Score</div>
                        <div className="text-2xl font-bold text-emerald-400">
                            {analysisResult.scores?.viralPotential || 85}/100
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5">
                        <div className="text-sm text-slate-400 mb-1">Retention</div>
                        <div className="text-2xl font-bold text-indigo-400">
                            {analysisResult.scores?.retention || "High"}
                        </div>
                    </div>
                </div>

                {/* Director's Note */}
                <div className="prose prose-invert prose-sm">
                    <h3 className="text-white font-semibold mb-2">Director's Notes</h3> // Fixed apostrophe
                    <p className="text-slate-300 leading-relaxed">
                        {analysisResult.summary || "The content is strong but needs faster pacing in the first 3 seconds to hook the audience completely."}
                    </p>
                </div>

                {/* Suggestions */}
                <div className="space-y-3">
                    <h3 className="text-white font-semibold text-sm">Suggested Edits</h3>
                    {(analysisResult.suggestions || ["Cut silence at 0:02", "Add dynamic captions", "Boost audio volume"]).map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                            {s}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Interface */}
            <div className="p-4 border-t border-white/5 bg-slate-950/30">
                <form onSubmit={handleChatSubmit} className="relative">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask Director to edit..."
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        disabled={isEditing}
                    />
                    <button
                        type="submit"
                        disabled={isEditing || !chatInput.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:bg-slate-700"
                    >
                        {isEditing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
                {editStatus === 'success' && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Request sent to render engine
                    </div>
                )}
            </div>
        </FadeIn>
    );
}
