'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, Cpu, Network, Zap } from 'lucide-react';
import ResearchNav from './components/Marketing/ResearchNav';
import { motion } from 'framer-motion';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 pb-20">
            <ResearchNav />

            {/* Hero Section */}
            <section className="pt-48 pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-xs font-mono text-indigo-600 mb-6 block tracking-widest uppercase">
                            Introducing A.V.E.A — System 1.0
                        </span>
                        <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-slate-900 mb-8 max-w-5xl leading-[0.95]">
                            The first autonomous <br />
                            <span className="text-indigo-600">director agent.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 max-w-2xl leading-relaxed mb-12">
                            A.V.E.A is not a tool. It is a reasoning engine that perceives your footage,
                            plans a narrative strategy, and autonomously executes the edit.
                        </p>

                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <Link
                                href="/setup"
                                className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full text-lg font-medium hover:bg-black transition-all"
                            >
                                Launch Console
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full text-lg font-medium hover:bg-slate-50 transition-all"
                            >
                                Read the Research
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Capability Grid */}
            <section className="px-6 py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <FeatureBlock
                            icon={<Cpu className="w-6 h-6 text-indigo-600" />}
                            title="Cognitive Planning"
                            description="Unlike timeline editors, A.V.E.A watches your footage and forms a creative strategy before making a single cut."
                        />
                        <FeatureBlock
                            icon={<Network className="w-6 h-6 text-indigo-600" />}
                            title="Scene Graph Understanding"
                            description="The perception layer deconstructs video into a semantic graph of scenes, speakers, and emotional context."
                        />
                        <FeatureBlock
                            icon={<Zap className="w-6 h-6 text-indigo-600" />}
                            title="Deterministic Execution"
                            description="Once the plan is finalized, the execution agent performs millisecond-perfect cuts, grading, and sound design."
                        />
                    </div>
                </div>
            </section>

            {/* The Metaphor */}
            <section className="px-6 py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-4xl font-semibold tracking-tight text-slate-900">
                            Don't buy software.<br />Hire a Director.
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Traditional editing software requires you to move every pixel manually.
                            It is a "dumb" tool that waits for input.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            A.V.E.A is an agent. You give it a brief ("Make this viral", "Cut for clarity"),
                            and it responds with a completed work, ready for your review.
                        </p>
                        <Link href="/product" className="inline-block text-indigo-600 font-medium hover:underline mt-4">
                            See how the Director Brain works →
                        </Link>
                    </div>
                    <div className="flex-1 relative aspect-square md:aspect-video bg-slate-200 rounded-lg overflow-hidden">
                        {/* Placeholder for "Director Console" visualization */}
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                            [System Visualization: Director Loop]
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

function FeatureBlock({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-medium text-slate-900">{title}</h3>
            <p className="text-slate-500 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
