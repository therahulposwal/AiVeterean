"use client";

import { useState } from 'react';
import { AlertTriangle, Loader2, Mic, MicOff, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SessionHeader from './components/SessionHeader';
import PhaseFooterControls from './components/PhaseFooterControls';
import { useInterviewSession } from './hooks/useInterviewSession';

interface InterviewClientProps {
  onFinish: () => Promise<void>;
}

export default function InterviewClient({ onFinish }: InterviewClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    isConnected,
    isConnecting,
    isRecording,
    aiSpeaking,
    errorMessage,
    phaseState,
    connectToRelay,
    startRecording,
    stopRecording,
    goToNextPhase,
    goToPreviousPhase,
    jumpToNextAppointment,
    finishInterview,
  } = useInterviewSession({
    onUnauthorized: () => {
      router.push('/login');
      router.refresh();
    },
  });

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleFinish = async () => {
    setIsProcessing(true);
    await finishInterview(onFinish);
    setIsProcessing(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-zinc-950 p-4 md:p-6 font-sans overflow-hidden selection:bg-zinc-800 selection:text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.12) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="pointer-events-none absolute -top-40 -right-20 h-96 w-96 rounded-full bg-zinc-800 blur-3xl opacity-40" />
      <div className="pointer-events-none absolute -bottom-48 -left-16 h-96 w-96 rounded-full bg-emerald-900 blur-3xl opacity-20" />

      <div className="relative z-10 w-full max-w-md bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.45)] border border-zinc-800 overflow-hidden flex flex-col transition-all duration-500">
        <SessionHeader isConnected={isConnected} onLogout={handleLogout} />

        <div className="flex-1 flex flex-col p-6 items-center">
          {isConnected && (
            <div className="w-full mb-8 text-center animate-in fade-in slide-in-from-bottom-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Phase {phaseState.phaseNumber} of {phaseState.totalPhases}
              </span>
              <h2 className="text-xl font-bold text-zinc-100 mt-1 mb-1">{phaseState.phaseName}</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{phaseState.phaseDescription}</p>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${(phaseState.phaseNumber / phaseState.totalPhases) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[280px]">
            {errorMessage && !isConnected && !isConnecting && (
              <div className="text-center p-6 bg-red-950/30 rounded-2xl border border-red-900/50 mb-6 w-full">
                <AlertTriangle className="mx-auto text-red-400 mb-2" size={24} />
                <p className="text-red-200 font-medium text-sm">{errorMessage}</p>
                <button
                  onClick={connectToRelay}
                  className="mt-3 text-xs font-bold text-red-300 underline decoration-red-500/50 underline-offset-2"
                >
                  Try Again
                </button>
              </div>
            )}

            {!isConnected && !isProcessing && !errorMessage && (
              <button
                onClick={connectToRelay}
                disabled={isConnecting}
                className="group relative flex flex-col items-center gap-4"
              >
                <div className="w-24 h-24 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.16)] transition-transform duration-300 group-hover:scale-105 active:scale-95">
                  {isConnecting ? <Loader2 className="animate-spin" size={32} /> : <ShieldCheck size={32} />}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-zinc-100">Start Interview</h3>
                  <p className="text-sm text-zinc-500">
                    {isConnecting ? 'Securing connection...' : 'Click to begin session'}
                  </p>
                </div>
              </button>
            )}

            {isProcessing && (
              <div className="text-center">
                <div className="inline-block p-4 rounded-full bg-zinc-800 border border-zinc-700 mb-4 relative">
                  <Loader2 className="animate-spin text-zinc-100" size={32} />
                </div>
                <h3 className="font-bold text-zinc-100">Finalizing Profile</h3>
                <p className="text-sm text-zinc-400 mt-1">Please wait a moment...</p>
              </div>
            )}

            {isConnected && (
              <div className="relative">
                {aiSpeaking && (
                  <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                )}

                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                    aiSpeaking
                      ? 'bg-zinc-950 border-2 border-zinc-700 text-zinc-100 shadow-lg shadow-black/40'
                      : isRecording
                        ? 'bg-emerald-500 text-zinc-950 shadow-xl shadow-emerald-900/30 scale-100'
                        : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  {aiSpeaking ? (
                    <div className="flex gap-1 items-end h-8">
                      <div className="w-1 bg-emerald-400 h-3 animate-[bounce_1s_infinite]" />
                      <div className="w-1 bg-emerald-400 h-6 animate-[bounce_1.2s_infinite]" />
                      <div className="w-1 bg-emerald-400 h-3 animate-[bounce_0.8s_infinite]" />
                    </div>
                  ) : isRecording ? (
                    <Mic size={32} />
                  ) : (
                    <MicOff size={32} />
                  )}
                </button>

                <div className="absolute -bottom-12 left-0 right-0 text-center">
                  <span className={`text-xs font-bold uppercase tracking-widest ${aiSpeaking ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {aiSpeaking ? 'Speaking' : isRecording ? 'Listening...' : 'Paused'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {isConnected && (
            <div className="w-full mt-8 pt-6 border-t border-zinc-800">
              <PhaseFooterControls
                currentPhase={phaseState.currentPhase}
                canGoBack={phaseState.canGoBack}
                canGoNext={phaseState.canGoNext}
                appointmentCount={phaseState.appointmentCount}
                onFinish={handleFinish}
                onPrevious={goToPreviousPhase}
                onNext={goToNextPhase}
                onAddAppointment={jumpToNextAppointment}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
