"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';

// --- CONSTANTS ---
const RANKS = [
  "General", "Lieutenant General", "Major General", "Brigadier", 
  "Colonel", "Lieutenant Colonel", "Major", "Captain", "Lieutenant",
  "Subedar Major", "Subedar", "Naib Subedar",
  "Havildar", "Naik", "Lance Naik", "Sepoy"
];

const ARMS = [
  "Infantry", "Armoured Corps", "Artillery", "Mechanised Infantry",
  "Army Aviation Corps", "Corps of Engineers", "Corps of Signals", "Army Air Defence",
  "Army Service Corps (ASC)", "Army Medical Corps (AMC)", "Army Dental Corps (ADC)",
  "Military Nursing Service (MNS)", "Army Ordnance Corps (AOC)",
  "Corps of Electronics & Mechanical Engineers (EME)", "Remount & Veterinary Corps (RVC)",
  "Military Intelligence (MI)", "Judge Advocate General (JAG)", "Army Education Corps (AEC)",
  "Corps of Military Police (CMP)", "Pioneer Corps",
  "Soldier General Duty (GD)", "Clerk / Store Keeper Technical (SKT)", "Tradesman",
  "Technical Soldier", "Nursing Assistant", "Driver", "Operator Radio & Line (ORL)",
  "Surveyor", "Artisan (EME)"
];

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',  // <--- Password Field State
    rank: 'Sepoy',
    arm: 'Infantry'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Save Session Locally
        localStorage.setItem('veteran_userId', data.userId);
        localStorage.setItem('veteran_rank', data.rank);
        localStorage.setItem('veteran_arm', data.arm);
        localStorage.setItem('veteran_fullName', formData.fullName);
        
        router.push('/');
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-900/50">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join the Veteran Career Network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Ex: Amit Singh"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Phone Number</label>
            <input 
              type="tel" 
              required
              placeholder="9876543210"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                required
                placeholder="Create a password"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition pr-10"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <Lock size={16} className="absolute right-3 top-3.5 text-gray-500" />
            </div>
          </div>

          {/* Rank & Arm Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Rank</label>
              <select 
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                value={formData.rank}
                onChange={(e) => setFormData({...formData, rank: e.target.value})}
              >
                {RANKS.map((rank) => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Arm / Service</label>
              <select 
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                value={formData.arm}
                onChange={(e) => setFormData({...formData, arm: e.target.value})}
              >
                {ARMS.map((arm) => (
                  <option key={arm} value={arm}>{arm}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-6 shadow-lg shadow-blue-900/40"
          >
            {loading ? "Creating Profile..." : "Register & Start"} <ChevronRight size={20} />
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">Login here</Link></p>
        </div>

      </div>
    </div>
  );
}