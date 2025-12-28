'use client';
import ResearchNav from '../components/Marketing/ResearchNav';
import { PageHeader } from '../components/Marketing/PageHeader';
import { ShieldCheck, Eye, Lock } from 'lucide-react';

export default function EthicsPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 pb-20">
            <ResearchNav />
            <PageHeader
                label="Responsibility"
                title="AI Safety & Ethics"
                subtitle="Autonomous creativity requires rigorous guardrails. We build transparency into every layer of our model."
            />

            <section className="max-w-4xl mx-auto px-6 grid grid-cols-1 gap-12 pt-12">
                <div className="flex gap-6 items-start">
                    <ShieldCheck className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                    <div className="space-y-4">
                        <h3 className="text-2xl font-medium text-slate-900">1. Provenance & Watermarking</h3>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            We believe in the right to know what is real. All content fully generated or heavily modified by A.V.E.A embeds
                            C2PA-compliant metadata, ensuring that AI-generated media is always identifiable as such.
                        </p>
                    </div>
                </div>

                <div className="flex gap-6 items-start">
                    <Eye className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                    <div className="space-y-4">
                        <h3 className="text-2xl font-medium text-slate-900">2. Human-in-the-Loop Control</h3>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            A.V.E.A is an agent, not a black box. Users can inspect the "Director Brain's" reasoning chain at any time to understand
                            why a specific edit decision was made. You always retain final cut privilege.
                        </p>
                    </div>
                </div>

                <div className="flex gap-6 items-start">
                    <Lock className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                    <div className="space-y-4">
                        <h3 className="text-2xl font-medium text-slate-900">3. Data Privacy First</h3>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Your footage is yours. We do not use user uploads to train our foundation models without explicit opt-in.
                            Private workspace data is encrypted at rest and in transit.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
