'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ContextPanel from '../components/ContextPanel';
import ChatInterface from '../components/ChatInterface';

interface Storyboard {
    [key: string]: any;
}

export default function DashboardPage() {
    // --- STATE ---

    // UI Navigation
    const [activeTab, setActiveTab] = useState('presets');

    // Content State
    const [files, setFiles] = useState<File[]>([]);
    const [style, setStyle] = useState('Motivational');
    const [duration, setDuration] = useState(30);
    const [aspectRatio, setAspectRatio] = useState('9:16');
    const useVoiceover = false;
    const useMusic = false;

    // AI Brain State
    const [storyboard, setStoryboard] = useState<Storyboard | null>(null);

    // Processing State
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    // Load from Onboarding
    useEffect(() => {
        const storedUrl = localStorage.getItem('avea_onboarding_url');
        const storedData = localStorage.getItem('avea_onboarding_data');
        const storedJobId = localStorage.getItem('avea_onboarding_job_id');

        if (storedData) {
            setStoryboard(JSON.parse(storedData));
        }

        if (storedUrl) {
            setVideoUrl(storedUrl);
        } else if (storedJobId) {
            // New logic: If we have a job ID but no URL, we are still processing
            setIsProcessing(true);
            setStatus('Finalizing your video...');
            pollJob(storedJobId);
            // Clear it so we don't poll forever on refresh if it completed? 
            // Better to leave it until completion clears it or overwrites URL
        }
    }, []);

    // --- HANDLERS ---

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Append new files to existing list
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const pollJob = (jobId: string) => {
        const interval = setInterval(async () => {
            try {
                const statusRes = await fetch(`/api/status/${jobId}`);
                const statusData = await statusRes.json();

                if (statusData.status === 'completed') {
                    clearInterval(interval);
                    setIsProcessing(false);
                    // Use relative path for video URL
                    setVideoUrl(statusData.output_url);
                    setStatus('Completed!');
                    localStorage.removeItem('avea_onboarding_job_id'); // Clear job ID
                } else if (statusData.status === 'failed') {
                    clearInterval(interval);
                    setIsProcessing(false);
                    alert('Generation Failed: ' + statusData.message);
                    localStorage.removeItem('avea_onboarding_job_id'); // Clear job ID
                }
            } catch (e) {
                console.error('Polling error', e);
            }
        }, 2000);
    };

    const handleGenerate = async () => {
        if (files.length === 0) {
            alert('Please upload at least one file!');
            return;
        }
        setIsProcessing(true);
        setStatus('Uploading Files...');
        setVideoUrl(null);
        setStoryboard(null);

        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));
        formData.append('style', style);

        // Handle 'Auto' duration (0) logic
        formData.append('duration_seconds', duration.toString());
        formData.append('aspect_ratio', aspectRatio);

        // Audio flags
        formData.append('use_music', useMusic.toString());
        formData.append('use_voiceover', useVoiceover.toString());

        try {
            setStatus('Analyzing Content (Gemini)...');
            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Analysis failed');

            setStatus('Rendering Video (MoviePy)... this may take a moment.');
            const data = await res.json();

            // Save the brain (storyboard) for Chat
            setStoryboard(data);

            if (data.job_id) {
                localStorage.setItem('avea_onboarding_job_id', data.job_id);
                pollJob(data.job_id);
            }
        } catch (e) {
            console.error(e);
            setIsProcessing(false);
            alert('Error starting generation');
        }
    };

    const handleUpdateStoryboard = async (newStoryboard: Storyboard) => {
        // Called by Chat Interface when AI modifies the plan
        setStoryboard(newStoryboard);
        setIsProcessing(true);
        setStatus('Re-rendering with changes...');
        setVideoUrl(null);

        try {
            const res = await fetch('/api/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStoryboard)
            });
            const data = await res.json();
            if (data.job_id) {
                localStorage.setItem('avea_onboarding_job_id', data.job_id); 
                pollJob(data.job_id);
            }
        } catch (e) {
            console.error('Render error', e);
            setIsProcessing(false);
            setStatus('Error re-rendering');
        }
    };

    // --- RENDER ---
    return (
        <div className='flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden'>

            {/* 1. SIDEBAR */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* 2. CONTEXT PANEL */}
            <ContextPanel
                activeTab={activeTab}
                selectedStyle={style}
                onStyleSelect={setStyle}
                files={files}
                onUpload={handleFileChange}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                duration={duration}
                setDuration={setDuration}
            />

            {/* 3. MAIN STAGE */}
            <div className='flex-1 flex flex-col relative w-full'>

                {/* Header */}
                <header className='h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10'>
                    <div className='flex items-center gap-2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors'>
                        <span className='text-lg'>←</span>
                        <span className='text-sm font-medium'>Back to Library</span>
                    </div>

                    <div className='font-semibold text-slate-700'>New Project</div>

                    <div className='flex gap-3'>
                        <button className='px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50'>
                            Give feedback
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={isProcessing}
                            className={`px-6 py-2 text-sm font-bold text-white rounded-lg shadow-lg shadow-orange-500/20 transition-all ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                                }`}
                        >
                            {isProcessing ? 'Processing...' : '⚡ Export'}
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className='flex-1 flex overflow-hidden'>

                    {/* Canvas */}
                    <div className='flex-1 bg-slate-100 flex items-center justify-center p-8 relative overflow-hidden'>

                        {/* Background Pattern */}
                        <div className='absolute inset-0 opacity-[0.03] pointer-events-none'
                            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        </div>

                        {isProcessing ? (
                            // Processing State
                            <div className='bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full animate-pulse z-10'>
                                <div className='w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mb-6'></div>
                                <h3 className='text-xl font-bold text-slate-800 mb-2'>Creating Magic</h3>
                                <p className='text-slate-500 text-center text-sm'>{status}</p>
                            </div>
                        ) : videoUrl ? (
                            // Result State
                            <div className='relative h-full max-h-[700px] aspect-[9/16] shadow-2xl rounded-2xl overflow-hidden bg-black ring-8 ring-white z-10'>
                                <video
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    className='w-full h-full object-cover'
                                />
                            </div>
                        ) : (
                            // Empty State
                            <div className='text-center z-10'>
                                <div className='w-64 h-96 border-4 border-dashed border-slate-300 rounded-2xl flex items-center justify-center mb-6 bg-slate-50/50'>
                                    <span className='text-slate-300 text-6xl'>🎬</span>
                                </div>
                                <h3 className='text-lg font-bold text-slate-700'>Ready to Create</h3>
                                <p className='text-slate-400 text-sm mt-1'>Select a style and click Export</p>
                            </div>
                        )}
                    </div>

                    {/* Chat Panel (Right Side) */}
                    <div className='w-96 border-l border-slate-200 bg-white p-4 hidden lg:flex flex-col'>
                        <ChatInterface
                            storyboard={storyboard}
                            onUpdateStoryboard={handleUpdateStoryboard}
                        />
                    </div>
                </div>

                {/* Bottom Bar (Timeline Placeholder) */}
                <div className='h-16 bg-white border-t border-slate-200 flex items-center px-6 gap-4 shrink-0 z-10'>
                    <button className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200'>▶</button>
                    <div className='flex-1 h-2 bg-slate-100 rounded-full relative overflow-hidden group cursor-pointer'>
                        <div className='absolute top-0 left-0 w-1/3 h-full bg-orange-200 group-hover:bg-orange-300 transition-colors'></div>
                    </div>
                    <span className='text-xs font-mono text-slate-400'>00:00 / {duration === 0 ? '--:--' : `00:${duration}`}</span>
                </div>

            </div>
        </div>
    );
}
