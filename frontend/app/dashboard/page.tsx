
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Download, Film, Sparkles } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';

export default function Dashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isNew = searchParams.get('new') === 'true';

    const [storyboard, setStoryboard] = useState<any>(null);
    const [status, setStatus] = useState('Idle');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        const dataStr = localStorage.getItem('avea_onboarding_data');
        if (dataStr) {
            const data = JSON.parse(dataStr);
            setStoryboard(data);
            setJobId(data.job_id); // Use the analysis ID as job ID initially

            // If it's a fresh analysis, we should trigger a first render (optional)
            // But let's verify if we have a render URL already? No.
            // Let's NOT auto-render on load to save time, user can chat to edit.
            // OR let's auto-render the initial cut.
            if (isNew) {
                triggerRender(data);
            }
        }
    }, [isNew]);

    const triggerRender = async (sb: any) => {
        setStatus('Rendering...');
        try {
            const res = await fetch('http://localhost:8080/api/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sb)
            });
            const data = await res.json();
            setJobId(data.job_id);
            pollStatus(data.job_id);
        } catch (e) {
            console.error(e);
            setStatus('Render Error');
        }
    };

    const pollStatus = async (id: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/status/${id}`);
                const data = await res.json();

                if (data.status === 'completed' && data.result?.url) {
                    setVideoUrl(data.result.url);
                    setStatus('Ready');
                    clearInterval(interval);
                } else if (data.status === 'failed') {
                    setStatus('Failed');
                    clearInterval(interval);
                } else {
                    setStatus('Processing...');
                }
            } catch (e) {
                clearInterval(interval);
            }
        }, 2000);
    };

    const handleUpdateStoryboard = async (newSb: any) => {
        console.log("New Storyboard:", newSb);
        setStoryboard(newSb);
        // Auto-render on edit
        triggerRender(newSb);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <Sparkles className="text-indigo-600" /> AVEA Studio
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">

                {/* Left: Video Preview */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">
                    <div className="flex-1 bg-black flex items-center justify-center relative aspect-video">
                        {videoUrl ? (
                            <video src={videoUrl} controls className="w-full h-full" autoPlay />
                        ) : (
                            <div className="text-white/50 flex flex-col items-center">
                                {status === 'Rendering...' || status === 'Processing...' ? (
                                    <Loader2 className="animate-spin mb-2" size={32} />
                                ) : (
                                    <Film size={48} />
                                )}
                                <p>{status === 'Idle' ? 'Waiting for edits...' : 'Rendering...'}</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                        <span className="font-mono text-xs text-slate-400">JOB: {jobId?.slice(0, 8)}</span>
                        {videoUrl && (
                            <a href={videoUrl} download className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
                                <Download size={16} /> Download
                            </a>
                        )}
                    </div>
                </div>

                {/* Right: Agent Chat */}
                <div className="h-[600px]">
                    <ChatInterface
                        storyboard={storyboard}
                        onUpdateStoryboard={handleUpdateStoryboard}
                    />
                </div>
            </div>

            {/* Storyboard Debug View (Optional, good for verification) */}
            <div className="mt-12 w-full max-w-6xl">
                <details className="bg-slate-200 p-4 rounded-lg">
                    <summary className="cursor-pointer font-bold text-slate-600">Debug Intent Plan</summary>
                    <pre className="text-xs mt-2 overflow-auto max-h-60">
                        {JSON.stringify(storyboard, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
}
