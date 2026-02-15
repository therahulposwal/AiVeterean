"use client";

import type { ReactNode } from 'react';

export function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-zinc-900 p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-zinc-800 flex flex-col h-full">
      <h3 className="text-zinc-100 font-bold text-lg md:text-xl mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        {icon} {title}
      </h3>
      <div className="flex-grow">{children}</div>
    </div>
  );
}

export function Badge({
  icon,
  label,
  color,
}: {
  icon: ReactNode;
  label: string;
  color: 'slate' | 'emerald';
}) {
  const styles =
    color === 'emerald'
      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/40'
      : 'bg-zinc-800 text-zinc-300 border-zinc-700';
  return (
    <span className={`px-2.5 py-1 text-[10px] md:text-xs font-bold rounded-lg border flex items-center gap-1.5 ${styles}`}>
      {icon} {label}
    </span>
  );
}

export function Pill({ text, variant = 'slate' }: { text: string; variant?: 'slate' | 'green' }) {
  const styles =
    variant === 'green'
      ? 'bg-emerald-950/30 text-emerald-300 border-emerald-700/30'
      : 'bg-zinc-950 text-zinc-300 border-zinc-800';
  return <span className={`px-2.5 py-1 text-xs md:text-sm font-semibold rounded-lg border ${styles}`}>{text}</span>;
}

export function EmptyState({ text }: { text: string }) {
  return <span className="text-zinc-500 italic text-sm">{text}</span>;
}

export function ListItems({ items, color }: { items: string[]; color: 'sky' | 'amber' }) {
  if (items.length === 0) return <EmptyState text="None recorded" />;
  const dotColor = color === 'sky' ? 'bg-sky-400' : 'bg-amber-400';
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="text-zinc-400 text-xs md:text-sm font-medium flex items-start gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800"
        >
          <div className={`mt-1.5 w-1.5 h-1.5 md:w-2 md:h-2 ${dotColor} rounded-full flex-shrink-0`} />
          <span className="break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}
