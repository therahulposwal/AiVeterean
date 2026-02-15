"use client";

import { LogOut } from 'lucide-react';

interface SessionHeaderProps {
  isConnected: boolean;
  onLogout: () => void;
}

export default function SessionHeader({ isConnected, onLogout }: SessionHeaderProps) {
  return (
    <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-zinc-800 bg-zinc-900/70">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
        <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
          {isConnected ? 'Live Session' : 'Standby'}
        </span>
      </div>
      <button
        onClick={onLogout}
        className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
