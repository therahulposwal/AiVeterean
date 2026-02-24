"use client";

import { Briefcase, Construction, Search, Sparkles } from 'lucide-react';

export default function JobsView() {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out font-sans selection:bg-zinc-700 selection:text-white pb-12">
      
      {/* PREMIUM HERO CONTAINER */}
      <div 
        className="relative group overflow-hidden rounded-[2rem] p-10 md:p-16 lg:p-24 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center min-h-[65vh]"
        style={{
          backgroundColor: 'hsla(0, 0%, 9%, 1)',
          backgroundImage: `
            radial-gradient(at 88% 10%, hsla(240, 15%, 20%, 1) 0px, transparent 50%),
            radial-gradient(at 0% 91%, hsla(240, 15%, 20%, 1) 0px, transparent 50%),
            radial-gradient(at 81% 94%, hsla(263, 21%, 15%, 1) 0px, transparent 50%),
            radial-gradient(at 10% 12%, hsla(263, 21%, 15%, 1) 0px, transparent 50%)
          `
        }}
      >
        {/* Abstract Overlays */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBihxmuqm-tlXEHkhn3Phc58gYg8AyYFczFHA3zg0-N3bvi9aR1tumMqB4q16LLr_sCqAnWT0OB3dQ3e79wKIWh78qep9Y8k7HNLdQqi8Lr5lv1ai12inOdk2fqhbVUnh09jwz4wgnx8avhd0Yy2IgzwtWhJUC6iIZTeKWPV2XJEu6UD9aySEzwGk2mUfL_6w2Q7jcIhenvsYr6bBTtjC1qRA6PfLMKkdKbn7HLNLROSYi1Ysf9rEqyWwnaof5OdnmXnbrk7LSKj7ZI')" }} />
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,1) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        {/* Soft Glow Elements */}
        <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-900/20 blur-3xl opacity-50" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#121214] blur-3xl opacity-80" />

        {/* Floating Icon Box */}
        <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-2xl transform hover:scale-105 transition-transform duration-500">
          <Briefcase size={36} className="text-white" />
          <div className="absolute -bottom-2 -right-2 bg-[#121214] p-1.5 rounded-full border border-zinc-800 shadow-lg">
            <Sparkles size={16} className="text-gold-accent" style={{ color: '#D4AF37' }} />
          </div>
        </div>

        {/* Text Content */}
        <div className="relative z-10 max-w-3xl flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-xs md:text-sm font-bold text-zinc-400 tracking-widest uppercase font-serif italic">Exclusive Network</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-white mb-6 tracking-tight leading-tight">
            Executive Placement
          </h2>
          <p className="text-zinc-400 max-w-2xl mb-10 text-base md:text-lg font-light leading-relaxed">
            Our proprietary AI translates your military service record into corporate competencies, matching you directly with verified executive, management, and strategic roles.
          </p>

          {/* Action Area */}
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="px-6 py-2.5 bg-zinc-900/80 backdrop-blur-md text-zinc-300 text-xs md:text-sm font-bold uppercase tracking-widest rounded-xl border border-zinc-700/80 flex items-center gap-2 shadow-xl">
              <Construction size={18} className="text-emerald-400" /> Module in Development
            </div>

            {/* Premium Mock Search Bar */}
            <div className="w-full max-w-md relative opacity-60 select-none pointer-events-none mt-4 group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-xl pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search translated civilian roles..." 
                className="w-full pl-12 pr-4 h-14 rounded-xl border border-zinc-700/50 bg-zinc-950/50 text-zinc-500 placeholder:text-zinc-600 shadow-inner outline-none backdrop-blur-sm" 
                disabled 
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}