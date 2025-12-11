"use client";

import { LayoutGrid, Video, Smile, Type, Settings } from "lucide-react";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const menuItems = [
        { id: "presets", label: "Presets", icon: LayoutGrid },
        { id: "b-rolls", label: "B-rolls", icon: Video },
        { id: "emojis", label: "Emojis", icon: Smile },
        { id: "subtitles", label: "Subtitles", icon: Type },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="w-[70px] h-screen bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 z-20">
            {/* Logo/Brand Icon Placeholder */}
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-lg">A</span>
            </div>

            {/* Nav Items */}
            <nav className="flex flex-col gap-4 w-full px-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-full group ${isActive
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                }`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium mt-1">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
