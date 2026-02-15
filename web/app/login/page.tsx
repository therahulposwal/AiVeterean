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
  TrendingUp
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
        // ✅ Session Data
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
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* --- LEFT SIDE: BRANDING (Visible on Laptop/Desktop) --- */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        </div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
        
        {/* Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} className="text-zinc-900" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">Veer AI</span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md space-y-8">
            <h2 className="text-5xl font-bold text-white leading-tight">
                The Mission <br/> 
                <span className="text-zinc-400">Continues.</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
                Log in to access exclusive corporate listings, mentorship programs, and your veteran network.
            </p>

            {/* Stat Card */}
            <div className="bg-zinc-800/50 backdrop-blur-md border border-zinc-700/50 p-6 rounded-2xl mt-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center text-green-400">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-2xl font-bold text-white">85%</p>
                    <p className="text-sm text-zinc-400">Placement rate for officers within 3 months.</p>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex gap-6 text-zinc-500 text-xs font-medium">
            <span>© 2026 The Veteran Company</span>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-[400px] space-y-8 animate-in slide-in-from-right-8 duration-700 fade-in">
            
            {/* Mobile Logo (Only visible on small screens) */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                    <ShieldCheck size={18} />
                </div>
                <span className="text-xl font-bold text-zinc-900">Veer AI</span>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Welcome Back</h1>
                <p className="text-zinc-500 mt-2">Enter your credentials to access your profile.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
            
                {/* Error Banner */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertTriangle size={18} className="text-red-500 shrink-0" />
                    <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                )}

                {/* Phone Input */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 ml-1">Phone Number</label>
                    <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                        <Phone size={18} />
                    </div>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-4 h-11 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300"
                        placeholder="Ex: 9876543210"
                        required
                    />
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-semibold text-zinc-900">Password</label>
                    </div>
                    <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                        <Lock size={18} />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 h-11 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300"
                        placeholder="••••••••"
                        required
                    />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold text-sm shadow-md shadow-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                    ) : (
                    <>
                        Sign In <ArrowRight size={18} />
                    </>
                    )}
                </button>
            </form>

            {/* Footer */}
            <div className="text-center pt-2">
                <p className="text-zinc-500 text-sm">
                    Don&apos;t have an account?{' '}
                    <Link 
                    href="/register" 
                    className="text-zinc-900 font-bold hover:underline underline-offset-4 ml-1"
                    >
                    Create Account
                    </Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
