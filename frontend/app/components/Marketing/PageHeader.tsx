export function PageHeader({ title, subtitle, label }: { title: string; subtitle: string; label?: string }) {
    return (
        <section className="pt-40 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {label && (
                    <span className="text-xs font-mono text-indigo-600 mb-6 block tracking-widest uppercase">
                        {label} -- 001
                    </span>
                )}
                <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-slate-900 mb-8 max-w-4xl">
                    {title}
                </h1>
                <p className="text-xl md:text-2xl text-slate-500 max-w-2xl leading-relaxed">
                    {subtitle}
                </p>
            </div>
        </section>
    );
}
