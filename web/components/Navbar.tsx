"use client";
import { ShieldCheck, User, FileText, Briefcase, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRank: string;
  userName: string; // <--- NEW PROP
}

export default function Navbar({ activeTab, setActiveTab, userRank, userName }: NavbarProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'resumes', label: 'Resumes', icon: FileText },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
            <ShieldCheck size={24} className="text-emerald-600" />
          </div>
          <div>
            <span className="block text-lg font-black text-stone-900 leading-none">VEER</span>
            <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">Career Network</span>
          </div>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-1 bg-stone-50/50 p-1.5 rounded-2xl border border-stone-100/50">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-white text-stone-900 shadow-sm ring-1 ring-black/5' 
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <item.icon size={16} className={activeTab === item.id ? 'text-emerald-500' : 'text-stone-400'} />
              {item.label}
            </button>
          ))}
        </div>

        {/* DESKTOP USER / LOGOUT */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right hidden lg:block">
            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Logged in as</span>
            {/* ✅ UPDATED: Shows Rank + Name */}
            <span className="block text-sm font-bold text-stone-900 truncate max-w-[200px]">
              {userRank} {userName}
            </span>
          </div>
          <div className="w-px h-8 bg-stone-200"></div>
          <button 
            onClick={handleLogout}
            className="group p-2.5 rounded-xl bg-white border border-stone-100 hover:bg-red-50 hover:border-red-100 text-stone-400 hover:text-red-500 transition-all shadow-sm"
            title="Logout"
          >
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button 
          className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 absolute w-full shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 space-y-2">
            <div className="px-4 py-3 mb-2 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Current User</span>
                {/* ✅ UPDATED: Shows Rank + Name */}
                <div className="text-stone-900 font-bold">{userRank} {userName}</div>
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                  activeTab === item.id ? 'bg-emerald-50 text-emerald-900' : 'text-stone-500 hover:bg-stone-50'
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
            <div className="h-px bg-stone-100 my-2"></div>
            <button 
              onClick={handleLogout} 
              className="w-full px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 text-red-500 hover:bg-red-50"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}