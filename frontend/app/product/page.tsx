'use client';
import ResearchNav from '../components/Marketing/ResearchNav';
import { PageHeader } from '../components/Marketing/PageHeader';

export default function ProductPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 pb-20">
            <ResearchNav />
            <PageHeader
                label="Product Vision"
                title="The Director Brain"
                subtitle="How A.V.E.A perceives, plans, and executes video edits without human intervention."
            />

            <section className="px-6 py-12 max-w-4xl mx-auto space-y-20">

                {/* 1. Loop */}
                <div className="space-y-6">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2 mb-8">
                        01 — The Cognitive Loop
                    </span>
                    <h2 className="text-3xl font-medium text-slate-900">From Pixels to Plans</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        When you upload a video, A.V.E.A does not simply "transcode" it. It begins a multi-stage cognitive process.
                        First, the <strong className="text-indigo-600">Perception Layer</strong> watches the footage, identifying speakers,
                        emotional beats, and visual defects. It "hears" the audio, transcribing speech and mapping silence.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        This raw data is converted into a structured <strong>Scene Graph</strong>—a mathematical representation of your video's content.
                    </p>
                </div>

                {/* 2. Planning */}
                <div className="space-y-6">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2 mb-8">
                        02 — Strategic Reasoning
                    </span>
                    <h2 className="text-3xl font-medium text-slate-900">Intent-Driven Editing</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Unlike software that waits for mouse clicks, the Director Brain takes your high-level intent (e.g. "Create a fast-paced viral short")
                        and formulates a strategy.
                    </p>
                    <ul className="space-y-4 pt-4">
                        <li className="flex gap-4">
                            <span className="text-indigo-600 font-mono">A.</span>
                            <span className="text-slate-600">It selects the strongest "Hook" from your footage.</span>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-indigo-600 font-mono">B.</span>
                            <span className="text-slate-600">It removes dead air and mistakes (speech disfluencies).</span>
                        </li>
                        <li className="flex gap-4">
                            <span className="text-indigo-600 font-mono">C.</span>
                            <span className="text-slate-600">It plans B-roll insertions to maintain visual retention.</span>
                        </li>
                    </ul>
                </div>

                {/* 3. Execution */}
                <div className="space-y-6">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2 mb-8">
                        03 — Deterministic Execution
                    </span>
                    <h2 className="text-3xl font-medium text-slate-900">The "Hands" of the Agent</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Once the plan is finalized, A.V.E.A hands off specific instructions to its Execution Agent.
                        This sub-system uses FFmpeg and computer vision libraries to perform the cuts with frame-perfect accuracy.
                    </p>
                </div>

            </section>
        </main>
    );
}
