"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, ArrowRight, Phone, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  
  // --- STATE ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- LOGIC (From your old file) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // ✅ CRITICAL: Save Session Data for Dashboard/Interview
        localStorage.setItem('veteran_token', data.token);
        localStorage.setItem('veteran_userId', data.user.userId);
        localStorage.setItem('veteran_rank', data.user.rank);
        localStorage.setItem('veteran_arm', data.user.arm);
        localStorage.setItem('veteran_fullName', data.user.fullName);
        localStorage.setItem('veteran_branch', data.user.branch);
        localStorage.setItem('veteran_unitName', data.user.unitName);
        
        router.push('/');
      } else {
        setError(data.message || "Invalid phone number or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Connection failed. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER (Sprout Design Language) ---
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* BRAND HEADER */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
          <ShieldCheck size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Welcome Back</h1>
        <p className="text-stone-500 mt-2 font-medium">Log in to access your service profile</p>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 p-8 sm:p-10 animate-in zoom-in-95 duration-500">
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              {error}
            </div>
          )}

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300"
                placeholder="9876543210"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-300"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Log In <ArrowRight size={20} className="text-emerald-400" /></>}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-stone-500 text-sm font-medium">
            New to Veer?{' '}
            <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline decoration-2 underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}