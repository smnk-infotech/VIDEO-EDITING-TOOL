'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Upload, Loader2, PlayCircle, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SetupPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Form State
    const [step, setStep] = useState<'form' | 'processing'>('form');
    const [videoName, setVideoName] = useState('');
    const [language, setLanguage] = useState('Auto');
    const [file, setFile] = useState<File | null>(null);

    // Processing State
    const [progress, setProgress] = useState({ upload: 0, subtitles: 0, visuals: 0 });

    // Mouse Parallax for blobs -> Subtle movement
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const x = (clientX - window.innerWidth / 2) / 20;
            const y = (clientY - window.innerHeight / 2) / 20;
            if (containerRef.current) {
                containerRef.current.style.setProperty('--move-x', `${x}px`);
                containerRef.current.style.setProperty('--move-y', `${y}px`);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            if (!videoName) {
                setVideoName(e.target.files[0].name.split('.')[0]);
            }
        }
    };

    const startProcessing = async () => {
        if (!file) return;
        setStep('processing');
        for (let i = 0; i <= 100; i += 10) {
            setProgress(prev => ({ ...prev, upload: i }));
            await new Promise(r => setTimeout(r, 200));
        }

        try {
            setProgress(prev => ({ ...prev, subtitles: 20 }));

            const formData = new FormData();
            formData.append('files', file);
            formData.append('style', 'Motivational');
            formData.append('duration_seconds', '60');
            formData.append('aspect_ratio', '9:16');
            formData.append('language', language);
            // Default audio settings for onboarding
            formData.append('use_music', 'false');
            formData.append('use_voiceover', 'false');

            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            setProgress(prev => ({ ...prev, subtitles: 80 }));

            if (!res.ok) throw new Error('Analysis failed');

            const data = await res.json();

            setProgress(prev => ({ ...prev, subtitles: 100, visuals: 50 }));

            setProgress(prev => ({ ...prev, subtitles: 100, visuals: 100 }));

            // OFF-LOAD WAIT TO DASHBOARD
            // We don\'t wait for render here anymore. We go straight to dashboard.
            if (data.job_id) {
                localStorage.setItem('avea_onboarding_data', JSON.stringify(data));
                localStorage.setItem('avea_onboarding_job_id', data.job_id);
                // Clear any old URL to force dashboard to poll
                localStorage.removeItem('avea_onboarding_url');

                router.push('/dashboard?new=true');
            } else {
                // Fallback
                localStorage.setItem('avea_onboarding_data', JSON.stringify(data));
                router.push('/dashboard?new=true');
            }
        } catch (e) {
            console.error(e);
            alert('Something went wrong. Please try again.');
            setStep('form');
        }
    };

    return (
        <div ref={containerRef} className='min-h-screen flex items-center justify-center relative overflow-hidden bg-white selection:bg-indigo-100 selection:text-indigo-900'>

            {/* --- PREMIUM LIGHT BACKGROUND --- */}
            <div className='absolute inset-0 w-full h-full'>
                {/* Dot Pattern */}
                <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-70'></div>

                {/* Moving Pastel Gradients - Subtle */}
                <div
                    className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-100/80 to-purple-100/80 rounded-full blur-[80px] transition-transform duration-100 ease-out will-change-transform'
                    style={{ transform: 'translate(var(--move-x), var(--move-y))' }}
                ></div>
                <div
                    className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-pink-100/80 to-rose-100/80 rounded-full blur-[80px] transition-transform duration-100 ease-out will-change-transform'
                    style={{ transform: 'translate(calc(var(--move-x) * -1), calc(var(--move-y) * -1))' }}
                ></div>
            </div>

            {/* --- MAIN CARD --- */}
            <div className='relative z-10 w-full max-w-xl bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_25px_70px_-15px_rgba(99,102,241,0.1)]'>

                {/* Header Strip */}
                <div className='h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'></div>

                <div className='p-8 md:p-12'>

                    {/* Brand Header */}
                    <div className='flex items-center justify-center mb-10 gap-2 opacity-90 hover:opacity-100 transition-opacity'>
                        <div className='h-8 w-8 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center shadow-md'>
                            <Sparkles className='w-4 h-4 text-white' />
                        </div>
                        <span className='font-bold text-xl tracking-tight text-slate-900'>prema.ai</span>
                    </div>

                    {step === 'form' ? (
                        <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>

                            <div className='text-center'>
                                <h2 className='text-3xl font-extrabold text-slate-900 tracking-tight mb-3'>
                                    Let&apos;s build your story.
                                </h2>
                                <p className='text-slate-500 font-medium'>Upload footage, select a style, and go.</p>
                            </div>

                            <div className='space-y-5'>
                                {/* Input: Name */}
                                <div className='group space-y-2'>
                                    <label className='text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-indigo-600 transition-colors'>Project Name</label>
                                    <div className='relative'>
                                        <input
                                            suppressHydrationWarning
                                            type='text'
                                            value={videoName}
                                            onChange={e => setVideoName(e.target.value)}
                                            placeholder='e.g. Summer Vlog'
                                            className='w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 placeholder:text-slate-400 group-hover:border-slate-300'
                                        />
                                        <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors'>
                                            <Zap size={18} />
                                        </div>
                                    </div>
                                </div>

                                {/* Input: Language */}
                                <div className='group space-y-2'>
                                    <label className='text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-indigo-600 transition-colors'>Language</label>
                                    <div className='relative'>
                                        <select
                                            suppressHydrationWarning
                                            value={language}
                                            onChange={e => setLanguage(e.target.value)}
                                            className='w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 appearance-none cursor-pointer group-hover:border-slate-300'
                                        >
                                            <option value='Auto'>Auto Detect (Recommended)</option>
                                            <option value='English'>English</option>
                                            <option value='Spanish'>Spanish</option>
                                            <option value='French'>French</option>
                                        </select>
                                        <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400'>
                                            ↓
                                        </div>
                                    </div>
                                </div>

                                {/* Input: File */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group ${file ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}
                                >
                                    <input
                                        type='file'
                                        hidden
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept='video/*'
                                    />
                                    <div className='flex flex-col items-center gap-3'>
                                        <div className={`p-4 rounded-full transition-all duration-300 ${file ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                                            <Upload className='w-6 h-6' />
                                        </div>
                                        {file ? (
                                            <div>
                                                <p className='text-indigo-700 font-bold text-lg'>{file.name}</p>
                                                <p className='text-indigo-500/70 text-sm'>Ready to upload</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className='text-slate-700 font-bold text-lg group-hover:text-indigo-700 transition-colors'>Click to upload video</p>
                                                <p className='text-slate-400 text-sm'>MP4, MOV (Max 100MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={startProcessing}
                                disabled={!file || !videoName}
                                className='w-full py-4 bg-slate-900 text-white font-bold text-lg rounded-xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:transform-none transition-all flex items-center justify-center gap-2 group'
                            >
                                Start Magic <PlayCircle size={20} className='group-hover:fill-current' />
                            </button>

                            <div className='text-center'>
                                <Link href='/' className='text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors'>
                                    Full Editor Mode
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className='space-y-10 animate-in fade-in zoom-in-95 duration-500 py-6'>
                            <div className='text-center'>
                                <div className='inline-flex relative mb-6'>
                                    <div className='absolute inset-0 bg-indigo-500/30 blur-2xl animate-pulse rounded-full'></div>
                                    <div className='bg-white p-4 rounded-2xl shadow-xl relative z-10 ring-4 ring-indigo-50'>
                                        <Loader2 size={40} className='text-indigo-600 animate-spin' />
                                    </div>
                                </div>
                                <h2 className='text-3xl font-bold text-slate-900 mb-2'>Analyzing Footage</h2>
                                <p className='text-slate-500'>Our AI agents are watching your video...</p>
                            </div>

                            <div className='space-y-6 max-w-sm mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-100'>
                                {[
                                    { label: 'Upload Speed', val: progress.upload },
                                    { label: 'Scene Detection', val: progress.subtitles },
                                    { label: 'Final Render', val: progress.visuals }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className='flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-2'>
                                            <span>{item.label}</span>
                                            <span className='text-indigo-600'>{item.val}%</span>
                                        </div>
                                        <div className='h-2 bg-slate-200 rounded-full overflow-hidden'>
                                            <div
                                                className='h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]'
                                                style={{ width: `${item.val}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
