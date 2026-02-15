"use client";
import { Briefcase, Construction, Search } from 'lucide-react';

export default function JobsView() {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl flex flex-col items-center justify-center py-20 lg:py-28 px-6 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.10) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="pointer-events-none absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-900/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-zinc-700/30 blur-3xl" />

        {/* Icon Circle */}
        <div className="relative z-10 w-24 h-24 bg-zinc-950 rounded-full flex items-center justify-center mb-6 border border-zinc-700 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
          <Briefcase size={40} className="text-zinc-300" />
        </div>

        {/* Text Content */}
        <h2 className="relative z-10 text-3xl md:text-4xl font-black text-zinc-100 mb-3 tracking-tight">Job Matcher</h2>
        <p className="relative z-10 text-zinc-400 max-w-2xl mb-8 text-base md:text-lg leading-relaxed">
          AI-powered job recommendations that specifically match your military skills to civilian opportunities.
        </p>

        {/* Action Area */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="px-5 py-2 bg-zinc-950 text-zinc-300 text-xs font-bold uppercase tracking-widest rounded-full border border-zinc-700 flex items-center gap-2">
            <Construction size={14} className="text-emerald-400" /> Feature Coming Soon
          </div>

          {/* Mock Search Bar */}
          <div className="mt-4 w-full max-w-sm relative opacity-60 select-none pointer-events-none">
            <input type="text" placeholder="Search roles..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-500 placeholder:text-zinc-600" disabled />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}
