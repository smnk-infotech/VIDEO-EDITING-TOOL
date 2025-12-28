"use client";
import React from 'react';
import { MarketingLayout } from '../components/Marketing/MarketingLayout';
import { FadeIn } from '@/app/components/Marketing/Motion';

export default function PrivacyPage() {
    return (
        <MarketingLayout>
            <section className="min-h-screen pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <FadeIn>
                        <h1 className="text-4xl md:text-5xl font-bold mb-12">Privacy Policy</h1>

                        <div className="prose prose-invert prose-lg max-w-none text-slate-400">
                            <p className="lead text-xl text-white mb-8">
                                At prema.ai, we take your creative IP serious. We process your data, we don't own it.
                            </p>

                            <h3>1. Data Isolation</h3>
                            <p>
                                All uploaded video content is assigned a unique, ephemeral ID. Your files are processed in an isolated container environment and are automatically deleted from our hot storage upon project deletion.
                            </p>

                            <h3>2. AI Processing</h3>
                            <p>
                                We use Google Gemini 3.0 Pro for analysis. Your video frames are sent to the AI model for the sole purpose of generating the analysis report. We do not use your content to train our own models.
                            </p>

                            <h3>3. Local Storage</h3>
                            <p>
                                For the "Dev Mode" or default setup, files may be stored temporarily on the server's local disk (`temp_uploads`). These are accessible only via signed URLs or the local network proxy.
                            </p>

                            <h3>4. Contact</h3>
                            <p>
                                For any data deletion requests or privacy concerns, please contact <strong>privacy@prema.ai</strong>.
                            </p>

                            <hr className="border-white/10 my-12" />

                            <p className="text-sm text-slate-500">
                                Last Updated: December 2025
                            </p>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </MarketingLayout>
    );
}
