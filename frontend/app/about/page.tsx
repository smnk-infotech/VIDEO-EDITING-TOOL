import ResearchNav from '../components/Marketing/ResearchNav';
import { PageHeader } from '../components/Marketing/PageHeader';
import ResearchFooter from '../components/Marketing/ResearchFooter';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 pb-20">
            <ResearchNav />
            <PageHeader
                title="The Vision"
                subtitle="We are building the world's first autonomous creative agent."
            />

            <article className="max-w-3xl mx-auto px-6 space-y-8 text-lg text-slate-600 leading-relaxed">
                <p>
                    Prema AI was founded on a simple but radical premise: <strong>creative software has peaked.</strong>
                </p>
                <p>
                    For thirty years, we have been building better hammers. Adobe Premiere, Final Cut, DaVinci Resolve—these are magnificent tools,
                    but they require a master carpenter to wield them. The bottleneck in video creation is no longer rendering speed or effect quality;
                    it is biological bandwidth.
                </p>
                <p>
                    We are not interested in building a better timeline. We are building a better editor.
                </p>
                <p>
                    A.V.E.A represents a shift from <em>Tool-Assisted Creativity</em> to <em>Agent-Driven Creativity</em>.
                    Our mission is to democratize high-end video production by giving every creator a cognitive partner—an AI that works
                    alongside them, learning their taste, anticipating their needs, and handling the drudgery of execution.
                </p>
            </article>

            <ResearchFooter />
        </main>
    );
}
