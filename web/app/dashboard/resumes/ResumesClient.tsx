"use client";

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText, Download, Loader2, CheckCircle2, LayoutTemplate, Sparkles } from 'lucide-react';
import { StandardATS } from './templates/StandardATS';
import { type VeteranProfilePayload } from '@/types/profile';

interface ResumesViewProps {
  profile: VeteranProfilePayload;
}

export default function ResumesView({ profile }: ResumesViewProps) {
  if (!profile) return null;

  const fileName = `${profile.fullName.replace(/\s+/g, '_')}_Resume.pdf`;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out font-sans selection:bg-zinc-700 selection:text-white pb-12 space-y-8">
      
      {/* PREMIUM HERO HEADER */}
      <div 
        className="relative group overflow-hidden rounded-[2rem] p-8 md:p-12 border border-white/10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
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
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBihxmuqm-tlXEHkhn3Phc58gYg8AyYFczFHA3zg0-N3bvi9aR1tumMqB4q16LLr_sCqAnWT0OB3dQ3e79wKIWh78qep9Y8k7HNLdQqi8Lr5lv1ai12inOdk2fqhbVUnh09jwz4wgnx8avhd0Yy2IgzwtWhJUC6iIZTeKWPV2XJEu6UD9aySEzwGk2mUfL_6w2Q7jcIhenvsYr6bBTtjC1qRA6PfLMKkdKbn7HLNLROSYi1Ysf9rEqyWwnaof5OdnmXnbrk7LSKj7ZI')" }} />
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3 mb-5">
             <div className="p-2.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg">
                <FileText size={20} className="text-white" />
             </div>
             <span className="text-sm font-bold text-white tracking-wider uppercase font-serif italic">Document Generator</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-white tracking-tight leading-tight">
            Resume Builder
          </h1>
          <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-light mt-4">
            Transform your verified service record into an ATS-optimized corporate profile. Instantly generated and formatted for executive roles.
          </p>
        </div>
        
        <div className="relative z-10 flex-shrink-0 w-full lg:w-auto">
          <PDFDownloadLink
            document={<StandardATS data={profile} />}
            fileName={fileName}
          >
            {({ loading: pdfLoading }) => (
              <button 
                disabled={pdfLoading}
                className={`w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm md:text-base transition-all active:scale-[0.98] border shadow-xl ${
                  pdfLoading 
                  ? 'bg-zinc-900/80 backdrop-blur-sm text-zinc-500 border-zinc-800 cursor-wait' 
                  : 'bg-white text-zinc-950 hover:bg-zinc-200 border-white'
                }`}
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Generating Document...
                  </>
                ) : (
                  <>
                    <Download size={20} /> Download PDF Resume
                  </>
                )}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* TEMPLATES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Active Template Card */}
        <div className="bg-[#121214]/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl shadow-black/20 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,1) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          <div className="absolute top-6 right-6 z-20 bg-green-500 text-zinc-900 p-1.5 rounded-full border-4 border-[#121214] shadow-lg">
            <CheckCircle2 size={16} strokeWidth={4} />
          </div>
          
          {/* Abstract Resume Preview */}
          <div className="relative z-10 h-64 bg-zinc-900/50 rounded-xl mb-6 flex flex-col items-center justify-start p-6 border border-zinc-700/50 group-hover:border-zinc-500/50 transition-colors shadow-inner overflow-hidden">
            <div className="w-full max-w-[200px] space-y-4 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                {/* Header line */}
                <div className="flex flex-col items-center gap-2 border-b border-zinc-800/80 pb-4">
                    <div className="h-3 w-32 bg-zinc-600 rounded-full" />
                    <div className="h-2 w-24 bg-zinc-700 rounded-full" />
                </div>
                {/* Content lines */}
                <div className="space-y-3 pt-2">
                    <div className="h-2 w-full bg-zinc-800 rounded-full" />
                    <div className="h-2 w-5/6 bg-zinc-800 rounded-full" />
                    <div className="h-2 w-4/6 bg-zinc-800 rounded-full" />
                </div>
                <div className="space-y-3 pt-2">
                    <div className="h-2 w-full bg-zinc-800 rounded-full" />
                    <div className="h-2 w-5/6 bg-zinc-800 rounded-full" />
                </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-800/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-700 shadow-xl">
                <Sparkles size={14} className="text-gold-accent" style={{ color: '#D4AF37' }} />
                <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-wider">ATS Optimized</span>
            </div>
          </div>
          
          <h3 className="relative z-10 text-xl md:text-2xl font-serif font-semibold text-white tracking-tight">Standard ATS Format</h3>
          <p className="relative z-10 text-sm md:text-base font-light text-zinc-400 mt-2 leading-relaxed">
            Clean, strict text-based hierarchy engineered to parse perfectly through 99% of Applicant Tracking Systems. High readability score for recruiters.
          </p>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="bg-[#121214]/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-dashed border-zinc-800/80 flex flex-col items-center justify-center text-center opacity-80 min-h-[400px]">
            <div className="w-20 h-20 bg-zinc-900/50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800 shadow-inner">
                <LayoutTemplate size={32} className="text-zinc-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-serif font-semibold text-zinc-500 tracking-tight">Executive Creative</h3>
            <p className="text-sm font-light text-zinc-600 mt-2 max-w-xs">
                Modern multi-column layouts and visual timelines.
            </p>
            <div className="mt-6 bg-zinc-900/50 text-zinc-500 text-xs font-bold px-4 py-2.5 rounded-lg border border-zinc-800 uppercase tracking-widest shadow-inner">
                Coming Soon
            </div>
        </div>

      </div>
    </div>
  );
}