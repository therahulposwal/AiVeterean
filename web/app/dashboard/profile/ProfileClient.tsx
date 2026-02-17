"use client";

import { 
    User, Briefcase, Award, BookOpen, Shield, RefreshCw, MapPin, 
    Calendar, Anchor, Plane, Target, Edit2, Save, X, Mail, 
    GraduationCap, Plus, Trash2, Hash, Phone, Linkedin, FileText, CheckCircle2
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useProfileEditor } from './hooks/useProfileEditor';
import type { EducationItem, VeteranProfilePayload, WorkExperienceItem } from '@/types/profile';

// --- SUB-COMPONENTS (Dark Theme) ---

const Badge = ({ icon, label, color = "zinc" }: { icon: ReactNode; label: string; color?: "zinc" | "emerald" | "blue" }) => (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold uppercase tracking-wider
        ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
          color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
          'bg-zinc-950 text-zinc-400 border-zinc-700'}`}>
        {icon} <span>{label}</span>
    </div>
);

const Pill = ({ text, variant = "default" }: { text: string, variant?: "default" | "green" }) => (
    <span className={`px-3 py-1.5 rounded-full text-xs font-medium border
        ${variant === 'green' 
            ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' 
            : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
        {text}
    </span>
);

const EmptyState = ({ text }: { text: string }) => (
    <span className="text-zinc-500 italic text-sm">{text}</span>
);

const Card = ({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) => (
    <div className="bg-zinc-900 rounded-xl md:rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 md:px-5 md:py-4 border-b border-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                {icon}
            </div>
            <h3 className="font-bold text-zinc-100 text-xs md:text-sm uppercase tracking-wide">{title}</h3>
        </div>
        <div className="p-4 md:p-5">
            {children}
        </div>
    </div>
);

// --- MAIN COMPONENT ---

interface ProfileViewProps {
  profile: VeteranProfilePayload;
  onRetake?: () => void;
}

export default function ProfileView({ profile, onRetake }: ProfileViewProps) {
  // Use the real profile editor hook (persists to API/database)
  const {
    isEditing,
    isSaving,
    isRetaking,
    formData,
    setIsEditing,
    handleSave,
    handleCancel,
    handleRetake,
    handleChange,
    handleSummaryChange,
    setFormData 
  } = useProfileEditor(profile, onRetake);

  // Helper for arrays (Inline for demo)
  const handleArrayChange = (field: string, val: string) => {
      setFormData({ ...formData, profileData: { ...formData.profileData, [field]: val.split('\n') } });
  };

  const addEducation = () => {
      const updatedEducation = [
        ...(formData.profileData?.education || []),
        { degree: '', institution: '', year: '', marks: '' },
      ];

      setFormData({
        ...formData,
        profileData: {
          ...formData.profileData,
          education: updatedEducation,
        },
      });
  };

  const removeEducation = (index: number) => {
      const updatedEducation = [...(formData.profileData?.education || [])];
      updatedEducation.splice(index, 1);

      setFormData({
        ...formData,
        profileData: {
          ...formData.profileData,
          education: updatedEducation,
        },
      });
  };
  
  // Branch Icon Logic
  const getBranchIcon = () => {
    if (formData.branch?.includes('Navy')) return <Anchor size={32} className="text-blue-400" />;
    if (formData.branch?.includes('Air Force')) return <Plane size={32} className="text-sky-400" />;
    return <User size={40} className="text-emerald-400" />;
  };

  // Dark Theme Input Style
  const inputBase = "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-600";

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out font-sans selection:bg-zinc-800 selection:text-white">
      
      {/* HERO HEADER */}
      <div className="relative group overflow-hidden bg-zinc-900/80 backdrop-blur-xl rounded-3xl md:rounded-[2rem] p-4 md:p-10 mb-6 md:mb-8 border border-zinc-800/80 shadow-[0_20px_70px_rgba(0,0,0,0.30)]">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-emerald-900/10 to-transparent blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row gap-6 md:gap-8 items-start xl:items-center justify-between">
          <div className="flex flex-col md:flex-row items-start md:items-start gap-5 md:gap-6 text-left w-full">
            {/* Avatar + Mobile Name */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-zinc-950 shadow-2xl shadow-black flex items-center justify-center border border-zinc-800">
                  {getBranchIcon()}
                </div>
                <div className="absolute -bottom-3 -right-3 bg-zinc-900 text-emerald-400 p-1.5 rounded-lg border border-zinc-800">
                  <CheckCircle2 size={16} />
                </div>
              </div>

              {!isEditing && (
                <h1 className="md:hidden flex-1 min-w-0 text-2xl font-extrabold text-white tracking-tight break-words">
                  {formData.fullName || "Veteran Profile"}
                </h1>
              )}
            </div>

            <div className="flex-grow w-full space-y-4">
              {isEditing ? (
                <input
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full text-3xl font-extrabold text-white bg-transparent border-b border-zinc-700 focus:border-white outline-none pb-2 placeholder:text-zinc-600"
                  placeholder="Full Name"
                />
              ) : (
                <h1 className="hidden md:block text-3xl md:text-4xl font-extrabold text-white tracking-tight break-words">
                  {formData.fullName || "Veteran Profile"}
                </h1>
              )}

              {/* CONTACT DETAILS */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-start gap-2.5 md:gap-3 w-full">
                  {isEditing ? (
                      <div className="relative w-full md:w-auto">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} className={`${inputBase} pl-9 w-full md:w-64`} placeholder="Email Address" />
                      </div>
                  ) : (
                      formData.email && (
                        <div className="w-full md:w-auto max-w-full flex items-center gap-2 text-zinc-400 text-sm font-medium bg-zinc-950 px-3 py-1.5 rounded-xl md:rounded-full border border-zinc-800">
                          <Mail size={14} className="shrink-0" />
                          <span className="break-all">{formData.email}</span>
                        </div>
                      )
                  )}

                  {isEditing ? (
                      <div className="relative w-full md:w-auto">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input value={formData.phoneNumber || ''} onChange={(e) => handleChange('phoneNumber', e.target.value)} className={`${inputBase} pl-9 w-full md:w-48`} placeholder="Phone Number" />
                      </div>
                  ) : (
                      formData.phoneNumber && (
                        <div className="w-full md:w-auto max-w-full flex items-center gap-2 text-zinc-400 text-sm font-medium bg-zinc-950 px-3 py-1.5 rounded-xl md:rounded-full border border-zinc-800">
                          <Phone size={14} className="shrink-0" />
                          <span className="break-all">{formData.phoneNumber}</span>
                        </div>
                      )
                  )}

                  {isEditing ? (
                      <div className="relative w-full md:w-auto">
                        <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input value={formData.linkedin || ''} onChange={(e) => handleChange('linkedin', e.target.value)} className={`${inputBase} pl-9 w-full md:w-72`} placeholder="LinkedIn URL (Optional)" />
                      </div>
                  ) : (
                    <div className="w-full md:w-auto max-w-full flex items-center gap-2 text-zinc-400 text-sm font-medium bg-zinc-950 px-3 py-1.5 rounded-xl md:rounded-full border border-zinc-800">
                      <Linkedin size={14} className="shrink-0" />
                      <span className={`break-all text-left leading-tight ${!formData.linkedin ? "text-zinc-600 italic" : ""}`}>
                        {formData.linkedin || "Click on edit profile to add"}
                      </span>
                    </div>
                  )}
              </div>

              {/* DETAILS */}
              <div className="flex flex-wrap items-center justify-start gap-2 md:gap-3 w-full">
                {isEditing ? (
                    <>
                        <input value={formData.rank} onChange={(e) => handleChange('rank', e.target.value)} className={`${inputBase} w-full sm:w-28`} placeholder="Rank" />
                        <input value={formData.branch} onChange={(e) => handleChange('branch', e.target.value)} className={`${inputBase} w-full sm:w-36`} placeholder="Branch" />
                        <input value={formData.arm} onChange={(e) => handleChange('arm', e.target.value)} className={`${inputBase} w-full sm:w-40`} placeholder="Arm/Trade" />
                    </>
                ) : (
                    <>
                        <div className="bg-zinc-100 text-zinc-950 text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider">{formData.rank || "Rank"}</div>
                        <Badge icon={<Shield size={12}/>} label={formData.branch} />
                        <Badge icon={<Hash size={12}/>} label={formData.arm} color="emerald" />
                    </>
                )}
              </div>

              {/* LAST UNIT */}
              <div className="flex items-center justify-start gap-2 text-zinc-400 text-sm font-medium bg-zinc-800/50 px-4 py-2 rounded-lg w-full md:w-fit border border-zinc-800">
                   <Target size={16} className="text-red-500 flex-shrink-0" />
                   {isEditing ? (
                       <input value={formData.unitName} onChange={(e) => handleChange('unitName', e.target.value)} className="bg-transparent border-b border-zinc-600 focus:border-white outline-none w-full md:w-64 text-white" placeholder="Last Unit Name" />
                   ) : (
                       <span className="break-words">Last Unit: <span className="text-zinc-200 font-semibold">{formData.unitName}</span></span>
                   )}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="w-full xl:w-auto mt-2 md:mt-0 flex flex-col gap-3">
            {!isEditing ? (
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full">
                    <button onClick={() => setIsEditing(true)} className="w-full sm:flex-1 whitespace-nowrap flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-sm hover:bg-white transition-all active:scale-95">
                        <Edit2 size={16} /> Edit Profile
                    </button>
                    <button
                      onClick={handleRetake}
                      disabled={isRetaking}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-white hover:border-zinc-600 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={16} className={isRetaking ? "animate-spin" : ""} />
                        <span className="text-sm font-semibold">{isRetaking ? "Retaking..." : "Retake Interview"}</span>
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2.5 sm:gap-3 w-full">
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 whitespace-nowrap flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                        {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                    </button>
                    <button onClick={handleCancel} disabled={isSaving} className="h-12 w-12 shrink-0 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-600 transition-all inline-flex items-center justify-center">
                        <X size={18} />
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:grid xl:grid-cols-12 gap-5 md:gap-6 items-start">
        
        {/* SIDEBAR */}
        <div className="order-2 xl:order-1 xl:col-span-4 w-full space-y-5 md:space-y-6">
            
            <Card title="Academic Background" icon={<GraduationCap size={18} className="text-purple-400" />}>
                <div className="space-y-4">
                    {formData.profileData?.education?.map((edu: EducationItem, i: number) => (
                        <div key={i} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-zinc-200 group relative hover:border-zinc-700 transition-colors">
                             {isEditing ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <input value={edu.degree} onChange={(e) => {const n=[...formData.profileData.education]; n[i].degree=e.target.value; setFormData({...formData, profileData: {...formData.profileData, education: n}})}} className={inputBase} placeholder="Degree" />
                                        <button type="button" onClick={() => removeEducation(i)} className="text-zinc-500 hover:text-red-500 transition-colors p-2"><Trash2 size={16}/></button>
                                    </div>
                                    <input value={edu.institution} onChange={(e) => {const n=[...formData.profileData.education]; n[i].institution=e.target.value; setFormData({...formData, profileData: {...formData.profileData, education: n}})}} className={inputBase} placeholder="Institution" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input value={edu.year} onChange={(e) => {const n=[...formData.profileData.education]; n[i].year=e.target.value; setFormData({...formData, profileData: {...formData.profileData, education: n}})}} className={inputBase} placeholder="Year" />
                                        <input value={edu.marks} onChange={(e) => {const n=[...formData.profileData.education]; n[i].marks=e.target.value; setFormData({...formData, profileData: {...formData.profileData, education: n}})}} className={inputBase} placeholder="Marks / CGPA" />
                                    </div>
                                </div>
                             ) : (
                                <>
                                    <div className="font-bold text-zinc-100 text-sm leading-tight">{edu.degree || "Degree Not Set"}</div>
                                    <div className="text-xs text-zinc-500 mt-1">{edu.institution || "Institution Not Set"}</div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-900">
                                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">{edu.year || "Year"}</span>
                                        {edu.marks && (<span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-2 py-0.5 rounded">{edu.marks}</span>)}
                                    </div>
                                </>
                             )}
                        </div>
                    ))}
                    {(!formData.profileData?.education?.length && !isEditing) && <EmptyState text="Click on edit profile to add" />}
                    {isEditing && (
                        <button type="button" onClick={addEducation} className="w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-500 text-xs font-bold hover:border-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-2 transition-all">
                            <Plus size={16} /> Add Education
                        </button>
                    )}
                </div>
            </Card>

            <Card title="Core Competencies" icon={<Shield size={18} className="text-indigo-400" />}>
              {isEditing ? (
                  <textarea className={`${inputBase} h-32 resize-none`} value={formData.profileData?.technicalSkills?.join('\n')} onChange={(e) => handleArrayChange('technicalSkills', e.target.value)} placeholder="Skills (one per line)..." />
              ) : (
                  <div className="flex flex-wrap gap-2">
                      {formData.profileData?.technicalSkills?.length > 0 ? formData.profileData.technicalSkills.map((s: string, i: number) => <Pill key={i} text={s} />) : <span className="text-zinc-600 text-sm italic">No skills recorded</span>}
                  </div>
              )}
            </Card>

            <Card title="Leadership Traits" icon={<User size={18} className="text-emerald-400" />}>
              {isEditing ? (
                  <textarea className={`${inputBase} h-32 resize-none`} value={formData.profileData?.softSkills?.join('\n')} onChange={(e) => handleArrayChange('softSkills', e.target.value)} placeholder="Traits (one per line)..." />
              ) : (
                  <div className="flex flex-wrap gap-2">
                      {formData.profileData?.softSkills?.length > 0 ? formData.profileData.softSkills.map((s: string, i: number) => <Pill key={i} text={s} variant="green" />) : <span className="text-zinc-600 text-sm italic">No traits recorded</span>}
                  </div>
              )}
            </Card>
        </div>

        {/* MAIN CONTENT */}
        <div className="order-1 xl:order-2 xl:col-span-8 space-y-5 md:space-y-6 w-full">
          
          {/* PROFESSIONAL SUMMARY */}
          <div className="bg-zinc-900 rounded-2xl p-5 md:p-8 border border-zinc-800">
            <div className="flex items-center gap-3 mb-5 md:mb-6 border-b border-zinc-800 pb-4">
              <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-400"><FileText size={20} /></div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Professional Summary</h2>
            </div>
            
            {isEditing ? (
                <textarea 
                    className={`${inputBase} h-32 resize-y leading-relaxed bg-zinc-950`} 
                    value={formData.profileData?.professionalSummary || ''} 
                    onChange={(e) => handleSummaryChange(e.target.value)} 
                    placeholder="Write a brief professional summary..." 
                />
            ) : (
                <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                    {formData.profileData?.professionalSummary || <span className="text-zinc-600 italic">No summary added yet.</span>}
                </p>
            )}
          </div>

          {/* SERVICE RECORD */}
          <div className="bg-zinc-900 rounded-2xl p-5 md:p-8 border border-zinc-800">
            <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-zinc-800 pb-5 md:pb-6">
              <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-400"><Briefcase size={20} /></div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Service Record</h2>
            </div>
            
            <div className="space-y-6 md:space-y-8">
              {formData.profileData?.workExperience?.length > 0 ? formData.profileData.workExperience.map((job: WorkExperienceItem, i: number) => (
                <div key={i} className="group relative pl-5 md:pl-8 pb-2 border-l border-zinc-800">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[4px] md:-left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-700 group-hover:bg-emerald-500 transition-all shadow-sm z-10 ring-2 md:ring-4 ring-zinc-900"></div>
                  
                  {isEditing ? (
                      <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4">
                          <input value={job.role} onChange={(e) => {const n=[...formData.profileData.workExperience]; n[i].role=e.target.value; setFormData({...formData, profileData: {...formData.profileData, workExperience: n}})}} className={inputBase} placeholder="Role" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <input value={job.unit} className={inputBase} placeholder="Unit" readOnly />
                             <input value={job.location} className={inputBase} placeholder="Location" readOnly />
                          </div>
                          <textarea className={`${inputBase} h-32`} value={job.responsibilities?.join('\n')} onChange={(e) => {const n=[...formData.profileData.workExperience]; n[i].responsibilities=e.target.value.split('\n'); setFormData({...formData, profileData: {...formData.profileData, workExperience: n}})}} />
                      </div>
                  ) : (
                      <>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
                            <div>
                                <h3 className="text-base md:text-lg font-bold text-zinc-100">{job.role}</h3>
                                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-medium text-zinc-500 mt-1">
                                    <span className="text-zinc-400 break-words">{job.unit}</span>
                                    <span className="hidden md:inline text-zinc-700">•</span>
                                    <span className="flex items-center gap-1 break-words"><MapPin size={12} className="shrink-0" /> {job.location}</span>
                                </div>
                            </div>
                            <div className="self-start w-full md:w-auto justify-center md:justify-start bg-emerald-900/10 text-emerald-400 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-lg border border-emerald-500/10 uppercase flex items-center gap-1.5">
                                <Calendar size={12} /> {job.startDate} — {job.endDate}
                            </div>
                        </div>
                        <ul className="mt-3 space-y-2">
                            {job.responsibilities?.map((resp: string, j: number) => (
                                <li key={j} className="text-zinc-400 text-sm flex items-start gap-3">
                                    <div className="block w-1 h-1 bg-zinc-600 rounded-full mt-2 flex-shrink-0" />
                                    <span className="leading-relaxed">{resp}</span>
                                </li>
                            ))}
                        </ul>
                      </>
                  )}
                </div>
              )) : (
                <div className="py-12 text-center bg-zinc-950 rounded-2xl border border-dashed border-zinc-800">
                    <p className="text-zinc-600 font-medium text-sm">No experience recorded yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Military Courses" icon={<BookOpen size={18} className="text-sky-400" />}>
               {isEditing ? (
                  <textarea className={`${inputBase} h-40 resize-none`} value={formData.profileData?.courses?.join('\n')} onChange={(e) => handleArrayChange('courses', e.target.value)} placeholder="Enter courses..." />
               ) : ( 
                  <ul className="space-y-2">
                      {formData.profileData?.courses?.map((c: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                              <CheckCircle2 size={14} className="text-sky-500 mt-0.5 shrink-0" /> {c}
                          </li>
                      ))}
                  </ul>
               )}
            </Card>

            <Card title="Achievements" icon={<Award size={18} className="text-amber-400" />}>
               {isEditing ? (
                  <textarea className={`${inputBase} h-40 resize-none`} value={formData.profileData?.achievements?.join('\n')} onChange={(e) => handleArrayChange('achievements', e.target.value)} placeholder="Enter achievements..." />
               ) : ( 
                  <ul className="space-y-2">
                    {formData.profileData?.achievements?.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                            <CheckCircle2 size={14} className="text-amber-500 mt-0.5 shrink-0" /> {c}
                        </li>
                    ))}
                 </ul>
               )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}