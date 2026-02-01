"use client";
import { User, Briefcase, Award, BookOpen, Shield, RefreshCw, MapPin, Calendar, Anchor, Plane, Target, ChevronRight, Hash } from 'lucide-react';

interface ProfileViewProps {
  profile: any;
  onRetake: () => void;
}

export default function ProfileView({ profile, onRetake }: ProfileViewProps) {
  const { fullName, rank, arm, branch, unitName, profileData } = profile;
  const { workExperience, technicalSkills, softSkills, courses, achievements } = profileData || {};

  const getBranchIcon = () => {
    if (branch?.includes('Navy')) return <Anchor size={32} className="text-blue-600" />;
    if (branch?.includes('Air Force')) return <Plane size={32} className="text-sky-600" />;
    return <User size={50} className="text-emerald-600" />;
  };

  return (
    // IMPROVEMENT: Reduced padding for mobile (p-3) to maximize screen real estate
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out p-3 md:p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      
      {/* --- HERO HEADER --- */}
      <div className="relative group overflow-hidden bg-white rounded-3xl md:rounded-[2rem] p-5 md:p-8 lg:p-10 mb-6 md:mb-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
        
        {/* Decorative Background - Tone down opacity for cleaner mobile look */}
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-emerald-50/60 to-transparent blur-3xl pointer-events-none opacity-40 md:opacity-60"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row gap-6 md:gap-8 items-start xl:items-center justify-between">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left w-full">
            
            {/* Avatar Container - Slightly smaller on mobile */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center border border-slate-100">
                <div className="scale-75 md:scale-100">
                  {getBranchIcon()}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 bg-slate-900 text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 rounded-lg border-2 border-white shadow-sm">
                {rank || "N/A"}
              </div>
            </div>

            {/* Name & Details */}
            <div className="flex-grow w-full">
              {/* IMPROVEMENT: Responsive text sizing */}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-2 md:mb-3 leading-tight">
                {fullName || "Veteran Profile"}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-4">
                <Badge icon={<Shield size={12} className="md:w-3.5 md:h-3.5"/>} label={branch} color="slate" />
                <Badge icon={<Hash size={12} className="md:w-3.5 md:h-3.5"/>} label={arm} color="emerald" />
              </div>

              {unitName && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 text-xs md:text-sm font-medium bg-slate-50/80 px-3 py-1.5 md:px-4 md:py-2 rounded-full w-full md:w-fit border border-slate-100/50">
                   <Target size={14} className="text-emerald-500 flex-shrink-0" />
                   <span className="truncate max-w-[200px] md:max-w-none">Last: <span className="text-slate-800 font-semibold">{unitName}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Action Area - Full width button on mobile */}
          <div className="w-full xl:w-auto mt-2 md:mt-0">
            <button 
              onClick={onRetake}
              className="group/btn w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-600 font-semibold text-sm border border-slate-200 shadow-sm hover:border-red-200 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 active:scale-[0.98]"
            >
              <RefreshCw size={18} className="group-hover/btn:rotate-180 transition-transform duration-500" />
              <span>Retake Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* IMPROVEMENT: Switch to Flexbox on Mobile to reorder content. 
         We want Experience (Main Content) to show BEFORE Skills (Sidebar) on small screens.
         On XL screens, it reverts to the 12-column grid.
      */}
      <div className="flex flex-col xl:grid xl:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* --- LEFT SIDEBAR (Skills) --- */}
        {/* Order-2 puts this at the bottom on mobile, but xl:col-span-4 keeps it left on desktop */}
        <div className="order-2 xl:order-1 xl:col-span-4 w-full xl:sticky xl:top-8">
          {/* Grid on tablet (sm) to show side-by-side, Stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
            <Card title="Core Competencies" icon={<Shield className="text-indigo-500" />}>
              <div className="flex flex-wrap gap-2">
                {technicalSkills?.length > 0 ? technicalSkills.map((s: string, i: number) => (
                  <Pill key={i} text={s} />
                )) : <EmptyState text="No skills recorded" />}
              </div>
            </Card>

            <Card title="Leadership Traits" icon={<User className="text-emerald-500" />}>
              <div className="flex flex-wrap gap-2">
                {softSkills?.length > 0 ? softSkills.map((s: string, i: number) => (
                  <Pill key={i} text={s} variant="green" />
                )) : <EmptyState text="No traits recorded" />}
              </div>
            </Card>
          </div>
        </div>

        {/* --- MAIN CONTENT (Experience) --- */}
        {/* Order-1 ensures this shows FIRST on mobile */}
        <div className="order-1 xl:order-2 xl:col-span-8 space-y-6 w-full">
          
          {/* Experience Section */}
          <div className="bg-white rounded-3xl md:rounded-[2rem] p-5 md:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-slate-100 pb-4 md:pb-6">
              <div className="p-2.5 md:p-3 bg-slate-100 rounded-2xl text-slate-700">
                <Briefcase size={20} className="md:w-6 md:h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Service Record</h2>
            </div>
            
            <div className="space-y-1">
              {workExperience?.length > 0 ? workExperience.map((job: any, i: number) => (
                <div key={i} className="group relative pl-4 md:pl-10 pb-10 md:pb-12 last:pb-0 border-l-[2px] border-slate-100 hover:border-emerald-200 transition-colors duration-300">
                  
                  {/* Timeline Dot - Position adjusted for tighter mobile padding */}
                  <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-[3px] border-white bg-slate-200 group-hover:bg-emerald-500 group-hover:scale-125 transition-all duration-300 shadow-sm z-10"></div>
                  
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-4 mb-3 md:mb-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-snug">{job.role}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs md:text-sm font-medium text-slate-500 mt-1.5">
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md"><MapPin size={12} className="text-slate-400" /> {job.unit}</span>
                        <span className="hidden md:inline text-slate-300">•</span>
                        <span>{job.location}</span>
                      </div>
                    </div>
                    {/* Date Badge - Moves nicely on mobile */}
                    <div className="self-start mt-1 md:mt-0 bg-emerald-50/50 text-emerald-800 text-[10px] md:text-xs font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-emerald-100/50 uppercase tracking-wide whitespace-nowrap flex items-center gap-1.5">
                      <Calendar size={12} />
                      {job.startDate} — {job.endDate}
                    </div>
                  </div>

                  <ul className="mt-3 md:mt-4 space-y-3">
                    {job.responsibilities?.map((resp: string, j: number) => (
                      <li key={j} className="text-slate-600 text-sm md:text-[15px] leading-relaxed flex items-start gap-2 md:gap-3">
                         {/* Hidden on mobile to save space, visible on hover desktop */}
                        <ChevronRight size={18} className="hidden md:block text-emerald-500 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-300" />
                         {/* Simple dot for mobile */}
                        <div className="block md:hidden w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 flex-shrink-0" />
                        <span className="group-hover:text-slate-900 transition-colors duration-200">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )) : (
                <div className="py-12 md:py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No experience recorded yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Grid for Courses & Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Courses" icon={<BookOpen className="text-sky-500" />}>
              <ListItems items={courses} color="sky" />
            </Card>

            <Card title="Achievements" icon={<Award className="text-amber-500" />}>
               <ListItems items={achievements} color="amber" />
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

/* --- SUB COMPONENTS --- */

function Card({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      <h3 className="text-slate-900 font-bold text-lg md:text-xl mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        {icon} {title}
      </h3>
      <div className="flex-grow">{children}</div>
    </div>
  );
}

function Badge({ icon, label, color }: { icon: any, label: string, color: 'slate' | 'emerald' }) {
  const styles = color === 'emerald' 
    ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
    : "bg-slate-100 text-slate-700 border-slate-200";
  
  return (
    <span className={`px-2.5 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-bold rounded-lg border shadow-sm flex items-center gap-1.5 ${styles}`}>
      {icon} {label}
    </span>
  );
}

function Pill({ text, variant = "slate" }: { text: string, variant?: "slate" | "green" }) {
  const base = "px-2.5 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-semibold rounded-lg border transition-all duration-200 cursor-default";
  const styles = variant === "green"
    ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200"
    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900";

  return <span className={`${base} ${styles}`}>{text}</span>;
}

function ListItems({ items, color }: { items: string[], color: "sky" | "amber" }) {
  if (!items || items.length === 0) return <EmptyState text="None recorded" />;
  
  const dotColor = color === "sky" ? "bg-sky-400" : "bg-amber-400";
  
  return (
    <ul className="space-y-2 md:space-y-3">
      {items.map((item, i) => (
        <li key={i} className="text-slate-600 text-xs md:text-sm font-medium flex items-start gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
          <div className={`mt-1.5 w-1.5 h-1.5 md:w-2 md:h-2 ${dotColor} rounded-full flex-shrink-0 ring-4 ring-white`}></div>
          <span className="break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ text }: { text: string }) {
  return <span className="text-slate-400 italic text-sm">{text}</span>;
}