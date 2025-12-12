'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface Message {
    role: 'user' | 'ai';
    text: string;
}

interface Scene {
    [key: string]: any;
}

interface Storyboard {
    style?: string;
    scenes?: Scene[];
    [key: string]: any;
}

interface ChatInterfaceProps {
    storyboard: Storyboard | null;
    onUpdateStoryboard: (newStoryboard: Storyboard) => Promise<void>;
}

export default function ChatInterface({ storyboard, onUpdateStoryboard }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        if (storyboard && messages.length === 0) {
            setMessages([{
                role: 'ai',
                text: `I\'ve created a ${storyboard.style || 'video'} plan with ${storyboard.scenes?.length || 0} scenes. Want to change anything?`
            }]);
        }
    }, [storyboard, messages.length]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isThinking || !storyboard) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsThinking(true);

        try {
            // Call API
            const res = await fetch('/api/chat/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyboard: storyboard,
                    message: userMsg
                }),
            });

            const data = await res.json();

            if (data.storyboard) {
                // Update Parent
                await onUpdateStoryboard(data.storyboard);

                setMessages(prev => [...prev, {
                    role: 'ai',
                    text: data.explanation || 'I\'ve updated the video plan based on your request.'
                }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I couldn\'t understand how to edit that.' }]);
            }

        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to the editor brain.' }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className='flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl'>
            {/* Header */}
            <div className='p-4 border-b border-slate-800 bg-slate-900/90 flex items-center gap-2'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center'>
                    <Sparkles size={16} className='text-white' />
                </div>
                <div>
                    <h3 className='text-sm font-bold text-slate-200'>AI Co-Editor</h3>
                    <p className='text-[10px] text-slate-500 font-mono'>Powered by Gemini 2.5</p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className='flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50'>
                {messages.length === 0 && (
                    <div className='text-center mt-10 opacity-30 text-slate-400 text-sm'>
                        <p>Ask me to change pacing, remove clips, or update captions.</p>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'
                            }`}>
                            {m.text}
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className='flex justify-start'>
                        <div className='bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-700 flex gap-1'>
                            <span className='w-2 h-2 bg-slate-500 rounded-full animate-bounce'></span>
                            <span className='w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100'></span>
                            <span className='w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200'></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className='p-3 bg-slate-900 border-t border-slate-800'>
                <div className='flex gap-2 relative'>
                    <input
                        type='text'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder='Type edits here...'
                        disabled={!storyboard || isThinking}
                        className='w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50'
                    />
                    <button
                        onClick={handleSend}
                        disabled={!storyboard || isThinking || !input.trim()}
                        className='absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-0'
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
