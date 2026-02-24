"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Loader2, 
  ArrowRight, 
  Phone, 
  Lock, 
  AlertTriangle, 
  TrendingUp,
  Check
} from 'lucide-react';

export default function Login() {
  const router = useRouter();
  
  // --- STATE ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- LOGIC ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let loginSucceeded = false;

    try {
      // Simulation of API call logic
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        loginSucceeded = true;
        // Session Data
        localStorage.setItem('veteran_userId', data.user.userId);
        localStorage.setItem('veteran_rank', data.user.rank);
        localStorage.setItem('veteran_arm', data.user.arm);
        localStorage.setItem('veteran_fullName', data.user.fullName);
        localStorage.setItem('veteran_branch', data.user.branch);
        localStorage.setItem('veteran_unitName', data.user.unitName);
        localStorage.setItem('veteran_isInterviewComplete', String(Boolean(data.user.isInterviewComplete)));
        
        const nextPath = data.user.isInterviewComplete ? '/dashboard/profile' : '/interview';
        router.replace(nextPath);
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Connection failed. Please check your internet.");
    } finally {
      if (!loginSucceeded) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white antialiased">
      
      {/* --- LEFT SIDE: BRANDING --- */}
      <div 
        className="hidden lg:flex w-[45%] xl:w-1/2 relative flex-col justify-between p-12 xl:p-16 overflow-hidden"
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
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBihxmuqm-tlXEHkhn3Phc58gYg8AyYFczFHA3zg0-N3bvi9aR1tumMqB4q16LLr_sCqAnWT0OB3dQ3e79wKIWh78qep9Y8k7HNLdQqi8Lr5lv1ai12inOdk2fqhbVUnh09jwz4wgnx8avhd0Yy2IgzwtWhJUC6iIZTeKWPV2XJEu6UD9aySEzwGk2mUfL_6w2Q7jcIhenvsYr6bBTtjC1qRA6PfLMKkdKbn7HLNLROSYi1Ysf9rEqyWwnaof5OdnmXnbrk7LSKj7ZI')" }}
        />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight font-serif italic">Veer AI</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-10">
          <h2 className="text-5xl xl:text-6xl font-medium text-white leading-[1.1] font-serif">
            From Service <br/>
            <span className="text-zinc-400 italic">to the C-Suite.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed font-light max-w-md">
            Your rank defined your past. Your ambition defines your future. Access a network built for high-performance veterans.
          </p>

          <div className="bg-white/[0.03] backdrop-blur-[16px] border border-white/[0.08] p-6 rounded-2xl flex items-center gap-6 transform transition hover:scale-[1.02] duration-500 hover:bg-white/5 group cursor-default shadow-2xl shadow-black/20">
            <div className="relative">
              <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 group-hover:border-zinc-500 transition-colors">
                <TrendingUp size={28} className="text-green-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                <Check size={12} strokeWidth={4} className="text-zinc-900" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white font-serif">Top 1%</p>
                <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">+12.5%</span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">Placement rate for registered officers vs industry average.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-8">
          <div className="flex flex-col gap-1">
            <span className="text-white font-semibold tracking-wide text-sm">TRUSTED BY LEADERS AT</span>
            <div className="flex gap-4 opacity-50 text-white text-xs mt-2 font-mono uppercase">
              <span>Reliance</span> • <span>Adani</span> • <span>Aditya Birla</span>
            </div>
          </div>
          <div className="text-zinc-500 text-xs">
            © 2026 The Veteran Company
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center bg-white p-6 sm:p-12 lg:p-20 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-100 rounded-bl-full -z-0 opacity-50" />
        
        <div className="w-full max-w-[440px] z-10">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={20} />
            </div>
            <span className="text-xl font-bold text-zinc-900 font-serif italic">Veer AI</span>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-serif font-semibold text-zinc-900 tracking-tight mb-3">Welcome Back</h1>
            <p className="text-zinc-500 text-base">Please enter your details to access your dashboard.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertTriangle size={18} className="text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 ml-1 flex justify-between">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors duration-300">
                  <Phone size={20} />
                </div>
                <input 
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-12 pr-4 h-14 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-base focus:outline-none focus:bg-white focus:border-zinc-800 focus:ring-0 transition-all placeholder:text-zinc-400 shadow-sm" 
                  placeholder="Ex: 1234 5678 90" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-zinc-700">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors duration-300">
                  <Lock size={20} />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 h-14 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-base focus:outline-none focus:bg-white focus:border-zinc-800 focus:ring-0 transition-all placeholder:text-zinc-400 shadow-sm" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-6 bg-zinc-900 hover:bg-black text-white rounded-xl font-medium text-base shadow-xl shadow-zinc-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-80 disabled:cursor-not-allowed" 
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>Logging in... <Loader2 size={18} className="animate-spin" /></>
                ) : (
                  <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </button>
          </form>

          <div className="text-center pt-8">
            <p className="text-zinc-500 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-zinc-900 font-bold hover:text-black hover:underline underline-offset-4 ml-1">
                Apply for Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}