'use client';
import ResearchNav from '../components/Marketing/ResearchNav';
import { PageHeader } from '../components/Marketing/PageHeader';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 pb-20">
            <ResearchNav />
            <PageHeader
                label="Inquiries"
                title="Contact the Lab"
                subtitle="For enterprise partnerships, press inquiries, or research collaboration."
            />

            <section className="max-w-2xl mx-auto px-6">
                <div className="grid gap-8">
                    <div className="p-8 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors">
                        <h3 className="text-lg font-medium text-slate-900 mb-1">General Inquiry</h3>
                        <a href="mailto:hello@prema.ai" className="text-xl text-indigo-600 hover:underline">hello@prema.ai</a>
                    </div>

                    <div className="p-8 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors">
                        <h3 className="text-lg font-medium text-slate-900 mb-1">Enterprise & API Access</h3>
                        <a href="mailto:partners@prema.ai" className="text-xl text-indigo-600 hover:underline">partners@prema.ai</a>
                    </div>

                    <div className="p-8 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors">
                        <h3 className="text-lg font-medium text-slate-900 mb-1">Press</h3>
                        <a href="mailto:press@prema.ai" className="text-xl text-indigo-600 hover:underline">press@prema.ai</a>
                    </div>
                </div>

                <div className="mt-12 text-sm text-slate-500 font-mono">
                    <p>Visiting Prema Research:</p>
                    <p className="mt-2">
                        415 Mission Street<br />
                        San Francisco, CA 94105
                    </p>
                </div>
            </section>
        </main>
    );
}
