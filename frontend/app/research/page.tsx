import ResearchNav from '../components/Marketing/ResearchNav';
import { PageHeader } from '../components/Marketing/PageHeader';
import ResearchFooter from '../components/Marketing/ResearchFooter';

export default function ResearchPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 pb-20">
            <ResearchNav />
            <PageHeader
                label="Research 001"
                title="Towards Autonomous Creativity"
                subtitle="Can an AI truly create? Or does it merely imitate? Our research explores the boundaries of agentic imagination."
            />

            <article className="max-w-3xl mx-auto px-6 space-y-12 text-lg text-slate-600 leading-relaxed">
                <p>
                    <span className="text-3xl float-left mr-4 mt-[-6px] font-serif text-slate-900">T</span>
                    he role of the human artist is shifting from "executor" to "curator". In the last decade, tools made execution easier.
                    In this decade, agents will make execution invisible.
                </p>
                <p>
                    At Prema Research, we define <strong>Human-Aligned Creativity</strong> as the principle that generative agents must act as
                    amplifiers of human intent, not replacements for human taste. An agent should surprise you, but never defy you.
                </p>

                <hr className="border-slate-100 my-12" />

                <h3 className="text-2xl font-medium text-slate-900 mb-6">The "Blank Page" Problem</h3>
                <p>
                    Most creativity is stifled not by a lack of skill, but by a lack of starting momentum. A.V.E.A is designed to solve the
                    "Blank Page" problem for video. By autonomously generating a valid, high-quality "Draft 0", the agent shifts the human
                    role to the much higher-leverage activity of critique and refinement.
                </p>

                <h3 className="text-2xl font-medium text-slate-900 mb-6">Agentic Hallucination as a Feature</h3>
                <p>
                    In factual domains, hallucination is a bug. In creative domains, it is a feature. We are researching methods to controlled
                    agentic "drift", allowing A.V.E.A to propose edits that are technically unnecessary but aesthetically surprising—mimicking
                    the happy accidents of a human editor.
                </p>
            </article>

            <ResearchFooter />
        </main>
    );
}
