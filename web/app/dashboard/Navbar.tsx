"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  User, 
  FileText, 
  Briefcase, 
  LogOut, 
  ShieldCheck,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface NavbarProps {
  userRank: string;
  userName: string;
}

export default function Navbar({ userRank, userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Profile', href: '/dashboard/profile', icon: <User size={16} /> },
    { name: 'Resumes', href: '/dashboard/resumes', icon: <FileText size={16} /> },
    { name: 'Jobs', href: '/dashboard/jobs', icon: <Briefcase size={16} /> },
  ];

  const handleLogout = async () => {
    // Simulated logout logic
    try {
      await fetch('/api/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/60 ui-transition">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* --- LEFT: BRAND --- */}
          <Link href="/dashboard/profile" className="flex items-center gap-3 group ui-transition">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.12)] group-hover:bg-white ui-transition">
              <ShieldCheck size={22} />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-black tracking-tighter text-white block leading-none">VEER AI</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-hover:text-zinc-300 ui-transition">Portal</span>
            </div>
          </Link>

          {/* --- CENTER: DESKTOP NAV --- */}
          <div className="hidden md:flex items-center bg-zinc-900/70 p-1 rounded-full border border-zinc-700/70 shadow-xl shadow-black/30">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold ui-transition
                    ${isActive 
                      ? 'bg-zinc-800 text-zinc-100 shadow-lg shadow-black/40 ring-1 ring-zinc-600' 
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }
                  `}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* --- RIGHT: USER & ACTIONS --- */}
          <div className="flex items-center gap-5">
            
            {/* User Info (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col items-end text-right border-r border-zinc-700 pr-5">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none mb-1.5 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/50">
                {userRank || "Guest"}
              </span>
              <span className="text-sm font-bold text-white leading-none tracking-tight">
                {userName || "Unknown"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLogout}
                className="group p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-xl ui-transition border border-transparent hover:border-red-900/30"
                title="Logout"
              >
                <LogOut size={20} className="group-hover:-translate-x-0.5 ui-transition" />
              </button>

              {/* Mobile Toggle */}
              <button 
                className="md:hidden p-2.5 text-zinc-100 bg-zinc-900 rounded-xl border border-zinc-700 hover:bg-zinc-800 ui-transition"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <span className="relative block h-5 w-5">
                  <Menu
                    size={20}
                    className={`absolute inset-0 ui-transition ${
                      isMenuOpen ? 'opacity-0 scale-75 rotate-90' : 'opacity-100 scale-100 rotate-0'
                    }`}
                  />
                  <X
                    size={20}
                    className={`absolute inset-0 ui-transition ${
                      isMenuOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE NAV OVERLAY --- */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 p-2 shadow-2xl z-40 ui-transition ${
          isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
               const isActive = pathname === item.href;
               return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center justify-between p-4 rounded-xl text-sm font-bold ui-transition
                    ${isActive 
                        ? 'bg-zinc-900 text-zinc-100 border border-zinc-700' 
                        : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.name}
                  </div>
                  {isActive && <ChevronRight size={16} className="text-emerald-500" />}
                </Link>
               )
            })}
            
            {/* Mobile User Info Block */}
            <div className="mt-2 pt-4 border-t border-zinc-800 px-4 pb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-800">
                        <User size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">{userRank}</p>
                        <p className="text-sm font-bold text-white">{userName}</p>
                    </div>
                </div>
            </div>
          </div>
      </div>
    </nav>
  );
}
