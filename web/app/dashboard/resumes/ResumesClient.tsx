"use client";
import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText, Download, Loader2, Check } from 'lucide-react';
import { StandardATS } from './templates/StandardATS';
import { type VeteranProfilePayload } from '@/types/profile';

interface ResumesViewProps {
  profile: VeteranProfilePayload;
}

export default function ResumesView({ profile }: ResumesViewProps) {
  if (!profile) return null;

  const fileName = `${profile.fullName.replace(/\s+/g, '_')}_Resume.pdf`;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out space-y-8">
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-zinc-900/70 rounded-3xl p-8 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.10) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-emerald-900/25 blur-3xl" />

        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-zinc-100">Resume Builder</h1>
          <p className="text-zinc-400 mt-2">Generate an ATS-Optimized PDF based on your service record.</p>
        </div>
        
        <div className="relative z-10 flex-shrink-0">
          <PDFDownloadLink
            document={<StandardATS data={profile} />}
            fileName={fileName}
          >
            {({ loading: pdfLoading }) => (
              <button 
                disabled={pdfLoading}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 border ${
                  pdfLoading 
                  ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-wait' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-950/30'
                }`}
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Generating PDF...
                  </>
                ) : (
                  <>
                    <Download size={20} /> Download Resume
                  </>
                )}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Templates / Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Template Card */}
        <div className="bg-zinc-900/80 rounded-3xl p-6 border border-emerald-700/60 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.10) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="absolute top-4 right-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 border border-emerald-300 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]">
            <Check size={16} className="stroke-[3]" />
          </div>
          
          <div className="relative z-10 h-64 bg-zinc-950 rounded-xl mb-4 flex items-center justify-center border border-zinc-700 group-hover:border-emerald-700/80 transition-colors">
            <FileText size={64} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          
          <h3 className="relative z-10 text-xl font-bold text-zinc-100">Standard ATS Format</h3>
          <p className="relative z-10 text-sm text-zinc-400 mt-1">
            Clean, text-based layout optimized for Applicant Tracking Systems. High readability score.
          </p>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="bg-zinc-900/50 rounded-3xl p-6 border border-dashed border-zinc-700/80 opacity-90 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center mb-4 border border-zinc-700">
                <FileText size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-300">Modern Creative</h3>
            <p className="text-sm text-zinc-500 mt-1">Coming Soon</p>
        </div>

      </div>
    </div>
  );
}
