'use client';
import ResearchNav from '../components/Marketing/ResearchNav';
import { PageHeader } from '../components/Marketing/PageHeader';

export default function CareersPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 pb-20">
            <ResearchNav />
            <PageHeader
                label="Join the Lab"
                title="Careers at Prema"
                subtitle="We are looking for researchers, engineers, and artists who want to build the future of autonomous media."
            />

            <section className="max-w-3xl mx-auto px-6 pt-12">
                <div className="space-y-12">
                    <JobRole
                        title="Senior Research Scientist (Multimodal AI)"
                        location="San Francisco / Remote"
                        description="Lead our efforts in bridging the gap between LLM reasoning and video temporal understanding."
                    />
                    <JobRole
                        title="Founding Backend Engineer"
                        location="San Francisco"
                        description="Architect high-throughput serverless rendering pipelines using Cloud Run and GPU clusters."
                    />
                    <JobRole
                        title="Creative Technologist"
                        location="Remote"
                        description="Explore the boundaries of A.V.E.A's capabilities and help define the 'Human-Aligned Creativity' benchmark."
                    />
                </div>

                <div className="mt-20 p-8 bg-slate-50 rounded-2xl text-center">
                    <h3 className="text-xl font-medium text-slate-900 mb-4">Don't see your role?</h3>
                    <p className="text-slate-600 mb-6">
                        We are always looking for exceptional talent. If you believe you can contribute to the mission,
                        email us directly.
                    </p>
                    <a href="mailto:careers@prema.ai" className="text-indigo-600 font-bold hover:underline">
                        careers@prema.ai
                    </a>
                </div>
            </section>
        </main>
    );
}

function JobRole({ title, location, description }: { title: string, location: string, description: string }) {
    return (
        <div className="group cursor-pointer">
            <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-2xl font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
                <span className="text-sm font-mono text-slate-500 uppercase">{location}</span>
            </div>
            <p className="text-slate-600 text-lg">{description}</p>
        </div>
    );
}
