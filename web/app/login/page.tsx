"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, ChevronRight, UserPlus, Lock } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState(''); // <--- Password State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }), // <--- Sending Password
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Restore Session to Local Storage
        localStorage.setItem('veteran_token', data.token);
        localStorage.setItem('veteran_userId', data.user.userId);
        localStorage.setItem('veteran_rank', data.user.rank);
        localStorage.setItem('veteran_arm', data.user.arm);
        localStorage.setItem('veteran_fullName', data.user.fullName);
        
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

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-cyan-900/50">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to continue your interview</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Phone Number</label>
            <input 
              type="tel" 
              required
              placeholder="9876543210"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                required
                placeholder="Enter your password"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={16} className="absolute right-3 top-3.5 text-gray-500" />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4 shadow-lg shadow-cyan-900/40"
          >
            {loading ? "Verifying..." : "Secure Login"} <ChevronRight size={20} />
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col items-center gap-4">
            <p className="text-gray-400 text-sm">Don't have an account?</p>
            <Link href="/register" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold transition">
                <UserPlus size={18} /> Register New Profile
            </Link>
        </div>

      </div>
    </div>
  );
}