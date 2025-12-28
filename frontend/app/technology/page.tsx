import ResearchNav from '../components/Marketing/ResearchNav';
import { PageHeader } from '../components/Marketing/PageHeader';
import ResearchFooter from '../components/Marketing/ResearchFooter';
import { Database, Server, Cpu, Lock } from 'lucide-react';

export default function TechnologyPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 pb-20">
            <ResearchNav />
            <PageHeader
                label="System Architecture"
                title="The Agentic Stack"
                subtitle="Designed for reasoning, built for scale. A.V.E.A is a hybrid serverless system thinking in real-time."
            />

            <section className="px-6 py-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Reasoning Engine */}
                <TechBlock
                    icon={<Cpu className="w-6 h-6 text-indigo-600" />}
                    title="Multimodal Reasoning Engine"
                    description="At the core is Google's Gemini 3.0 Pro. This LLM acts as the central reasoning unit, capable of understanding visual nuance, audio frequency, and complex user directives simultaneously."
                    specs={["1M+ Token Context Window", "Multimodal Input (Video/Audio)", "Chain-of-Thought Planning"]}
                />

                {/* Execution Layer */}
                <TechBlock
                    icon={<Server className="w-6 h-6 text-indigo-600" />}
                    title="Serverless Execution Cloud"
                    description="The cognitive plan is executed by ephemeral Cloud Run instances. These isolated environments spin up to perform heavy lifting (FFmpeg rendering) and vanish immediately after, ensuring zero idle waste."
                    specs={["Google Cloud Run (Gen 2)", "Auto-scaling to Zero", "2GiB+ RAM Isolated Containers"]}
                />

                {/* Perception & Memory */}
                <TechBlock
                    icon={<Database className="w-6 h-6 text-indigo-600" />}
                    title="Perception & Memory"
                    description="A.V.E.A maintains a semantic graph of every projected it edits. This long-term memory allows the agent to learn from feedback ('Stop cutting silence so tight') and improve over time."
                    specs={["Firestore Vector Store", "Cloud Storage for 4K Assets", "Semantic Scene Graphing"]}
                />

                {/* Security */}
                <TechBlock
                    icon={<Lock className="w-6 h-6 text-indigo-600" />}
                    title="Enterprise-Grade Security"
                    description="Your footage is processed in a secure VPC. Raw assets are never used for model training. We strictly adhere to the Principle of Least Privilege for all agent actions."
                    specs={["IAM Role-Based Access", "No Client-Side Secrets", "Ephemeral Processing Storage"]}
                />
            </section>

            <ResearchFooter />
        </main>
    );
}

function TechBlock({ icon, title, description, specs }: { icon: any, title: string, description: string, specs: string[] }) {
    return (
        <div className="space-y-6 p-8 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                    {icon}
                </div>
                <h3 className="text-xl font-medium text-slate-900">{title}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
                {description}
            </p>
            <div className="space-y-2 pt-4 border-t border-slate-200">
                {specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-500 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        {spec}
                    </div>
                ))}
            </div>
        </div>
    );
}
