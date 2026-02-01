"use client";
import { Briefcase, Construction, Search } from 'lucide-react';

export default function JobsView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 lg:py-32 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Icon Circle */}
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-stone-100">
        <Briefcase size={40} className="text-stone-300" />
      </div>

      {/* Text Content */}
      <h2 className="text-3xl font-black text-stone-900 mb-3 tracking-tight">Job Matcher</h2>
      <p className="text-stone-500 max-w-lg text-center mb-8 text-lg">
        AI-powered job recommendations that specifically match your military skills to civilian opportunities.
      </p>

      {/* Action Area */}
      <div className="flex flex-col items-center gap-4">
        <div className="px-5 py-2 bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-widest rounded-full border border-stone-200 flex items-center gap-2">
          <Construction size={14} /> Feature Coming Soon
        </div>

        {/* Mock Search Bar */}
        <div className="mt-4 w-full max-w-xs relative opacity-50 grayscale select-none pointer-events-none">
            <input type="text" placeholder="Search roles..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white" disabled />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        </div>
      </div>
    </div>
  );
}