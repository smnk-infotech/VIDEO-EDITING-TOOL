"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MarketingLayout } from '../components/Marketing/MarketingLayout';
import { useAuth } from '@/app/context/AuthContext';
import { FadeIn } from '@/app/components/Marketing/Motion';
import { Layout, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const { signInWithGoogle, user } = useAuth();
    const router = useRouter();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) router.push('/dashboard');
    }, [user, router]);

    const handleLogin = async () => {
        setIsLoggingIn(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error(error);
            setIsLoggingIn(false);
        }
    };

    return (
        <MarketingLayout>
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[length:50px_50px]" />

                <FadeIn>
                    <div className="w-full max-w-md p-8 rounded-3xl bg-slate-950 border border-white/10 shadow-2xl relative z-10 backdrop-blur-xl">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
                                <Layout className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-bold mb-3">Welcome Back</h1>
                            <p className="text-slate-400">Sign in to access your Director Studio.</p>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={isLoggingIn}
                            className="w-full py-4 bg-white text-slate-950 rounded-xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingIn ? (
                                <span className="animate-pulse">Connecting...</span>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.1128 16.323 17.9513V20.8329H20.2115C22.4879 18.7303 23.7937 15.6309 23.766 12.2764Z" fill="#4285F4" />
                                        <path d="M12.24 24.0008C15.4764 24.0008 18.2059 22.9382 20.2155 21.0635L16.327 18.1818C15.2517 18.918 13.8291 19.3496 12.244 19.3496C9.11394 19.3496 6.45942 17.2346 5.51336 14.3938H1.47461V17.5195C3.51139 21.5646 7.68412 24.0008 12.24 24.0008Z" fill="#34A853" />
                                        <path d="M5.50941 14.394C5.02672 12.9463 5.02672 11.3853 5.50941 9.93761V6.81191H1.47065C-0.27083 10.3068 -0.27083 14.4187 1.47065 17.9136L5.50941 14.394Z" fill="#FBBC05" />
                                        <path d="M12.24 4.6508C13.9535 4.61907 15.6033 5.2758 16.8166 6.43851L20.2662 2.98894C18.0694 0.941961 15.2078 -0.16527 12.24 0.00164893C7.68412 0.00164893 3.51139 2.43781 1.47461 6.48285L5.51336 9.60855C6.45524 6.77121 9.10986 4.6508 12.24 4.6508Z" fill="#EA4335" />
                                    </svg>
                                    Sign in with Google
                                </>
                            )}
                        </button>

                        <div className="mt-8 pt-8 border-t border-white/5 text-center">
                            <p className="text-slate-500 text-sm">
                                By signing in, you agree to our <a href="/privacy" className="text-slate-300 hover:text-white underline">Privacy Policy</a>
                            </p>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </MarketingLayout>
    );
}
