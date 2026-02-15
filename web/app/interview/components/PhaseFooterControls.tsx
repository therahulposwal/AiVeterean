"use client";

import { Activity, CheckCircle2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface PhaseFooterControlsProps {
  currentPhase: string;
  canGoBack: boolean;
  canGoNext: boolean;
  appointmentCount: number;
  onFinish: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onAddAppointment: () => void;
}

export default function PhaseFooterControls({
  currentPhase,
  canGoBack,
  canGoNext,
  appointmentCount,
  onFinish,
  onPrevious,
  onNext,
  onAddAppointment,
}: PhaseFooterControlsProps) {
  if (currentPhase === 'CLOSING') {
    return (
      <button
        onClick={onFinish}
        className="w-full h-12 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-emerald-500 text-zinc-950 border border-emerald-400 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-950/30"
      >
        <CheckCircle2 size={16} />
        Finish & Submit
      </button>
    );
  }

  if (currentPhase === 'APPOINTMENT_WRAP') {
    return (
      <div className="flex gap-3">
        <button
          onClick={onAddAppointment}
          className="flex-1 h-12 rounded-xl border border-zinc-700 text-zinc-300 font-medium text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw size={16} />
          Add Another
        </button>
        <button
          onClick={onNext}
          className="flex-1 h-12 rounded-xl bg-zinc-100 text-zinc-950 font-medium text-sm flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-md"
        >
          Next Step
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <button
        onClick={onPrevious}
        disabled={!canGoBack}
        className={`h-12 w-12 rounded-full flex items-center justify-center border transition-colors ${canGoBack ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-800 text-zinc-600 cursor-not-allowed'}`}
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex-1 text-center">
        {appointmentCount > 0 && currentPhase.includes('APPOINTMENT') && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs font-semibold text-zinc-300">
            <Activity size={12} /> Appointment #{appointmentCount + 1}
          </span>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`h-12 px-6 rounded-full flex items-center justify-center gap-2 font-medium text-sm transition-all ${canGoNext ? 'bg-zinc-100 text-zinc-950 hover:bg-white shadow-md' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
