"use client";
import { FileText, Construction, Plus } from 'lucide-react';

export default function ResumesView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 lg:py-32 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Icon Circle */}
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-stone-100">
        <FileText size={40} className="text-stone-300" />
      </div>

      {/* Text Content */}
      <h2 className="text-3xl font-black text-stone-900 mb-3 tracking-tight">Resume Builder</h2>
      <p className="text-stone-500 max-w-lg text-center mb-8 text-lg">
        Generate ATS-friendly resumes tailored for corporate roles using your service profile data.
      </p>

      {/* Action Area */}
      <div className="flex flex-col items-center gap-4">
        <div className="px-5 py-2 bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-widest rounded-full border border-stone-200 flex items-center gap-2">
          <Construction size={14} /> Feature Coming Soon
        </div>
        
        {/* Mock Button to show what's next */}
        <button disabled className="mt-4 px-6 py-3 bg-stone-900 text-stone-600 rounded-xl font-bold flex items-center gap-2 opacity-50 cursor-not-allowed">
            <Plus size={18} /> Create New Resume
        </button>
      </div>
    </div>
  );
}