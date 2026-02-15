"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Loader2, 
  ArrowRight, 
  User, 
  Mail,
  Phone, 
  Lock, 
  ChevronDown, 
  MapPin, 
  Anchor, 
  Plane, 
  Shield, 
  X,
  AlertTriangle,
  Star,
  Quote
} from 'lucide-react';
import Link from 'next/link';

// --- DATA CONFIGURATION ---
const SERVICE_DATA: any = {
  Army: {
    ranks: ["General", "Lt General", "Major General", "Brigadier", "Colonel", "Lt Colonel", "Major", "Captain", "Lieutenant", "Subedar Major", "Subedar", "Naib Subedar", "Havildar", "Naik", "Sepoy"],
    arms: ["Infantry", "Armoured Corps", "Artillery", "Engineers", "Signals", "Army Air Defence", "ASC", "AMC", "EME", "AOC", "Intelligence", "Para SF"]
  },
  Navy: {
    ranks: ["Admiral", "Vice Admiral", "Rear Admiral", "Commodore", "Captain", "Commander", "Lt Commander", "Lieutenant", "Sub Lieutenant", "MCPO I", "MCPO II", "CPO", "PO", "Leading Seaman", "Seaman I/II"],
    arms: ["Executive", "Engineering", "Electrical", "Education", "Logistics", "Medical", "Submarine Arm", "Aviation", "Marcos"]
  },
  'Air Force': {
    ranks: ["Air Chief Marshal", "Air Marshal", "Air Vice Marshal", "Air Commodore", "Group Captain", "Wing Commander", "Squadron Leader", "Flight Lieutenant", "Flying Officer", "MWO", "WO", "JWO", "Sergeant", "Corporal", "LAC/AC"],
    arms: ["Flying Branch", "Technical (AE L)", "Technical (AE M)", "Logistics", "Administration", "Accounts", "Education", "Meteorology", "Medical", "Garud Commando"]
  }
};

export default function Register() {
  const router = useRouter();
  
  // --- STATE ---
  const [branch, setBranch] = useState('Army');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    unitName: '',
    rank: 'Sepoy', 
    arm: 'Infantry' 
  });
  
  const [isCustomRank, setIsCustomRank] = useState(false);
  const [isCustomArm, setIsCustomArm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset dropdowns when branch changes
  useEffect(() => {
    setFormData(prev => ({ 
        ...prev, 
        rank: SERVICE_DATA[branch].ranks[0], 
        arm: SERVICE_DATA[branch].arms[0] 
    }));
    setIsCustomRank(false);
    setIsCustomArm(false);
  }, [branch]);

  // --- LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { ...formData, branch };
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (data.success) {
        router.push('/login');
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        
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
                Service to <br/> 
                <span className="text-zinc-400">Civilian Success.</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
                Join thousands of veterans transitioning into corporate leadership. Your discipline is your greatest asset.
            </p>

            {/* Testimonial Card */}
            <div className="bg-zinc-800/50 backdrop-blur-md border border-zinc-700/50 p-6 rounded-2xl mt-8">
                <Quote className="text-zinc-500 mb-4" size={24} />
                <p className="text-zinc-200 mb-4">"The platform understood my service background instantly. I found a role that valued my command experience within days."</p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">VS</div>
                    <div>
                        <p className="text-sm font-bold text-white">Vikram Singh</p>
                        <p className="text-xs text-zinc-400">Ex-Major, 4 Para SF</p>
                    </div>
                    <div className="ml-auto flex gap-0.5 text-yellow-500">
                        {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex gap-6 text-zinc-500 text-xs font-medium">
            <span>© 2026 The Veteran Company </span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-8 animate-in slide-in-from-right-8 duration-700 fade-in">
            
            {/* Mobile Logo (Only visible on small screens) */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                    <ShieldCheck size={18} />
                </div>
                <span className="text-xl font-bold text-zinc-900">Veer AI</span>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Create Account</h1>
                <p className="text-zinc-500 mt-2">Enter your service details to verify eligibility.</p>
            </div>

            {/* BRANCH TABS */}
            <div className="bg-zinc-100 p-1 rounded-xl grid grid-cols-3 gap-1">
                {['Army', 'Navy', 'Air Force'].map((b) => (
                    <button
                        key={b}
                        type="button"
                        onClick={() => setBranch(b)}
                        className={`
                        py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-200
                        ${branch === b 
                            ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5' 
                            : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                        }
                        `}
                    >
                        {b === 'Army' && <Shield size={14} />}
                        {b === 'Navy' && <Anchor size={14} />}
                        {b === 'Air Force' && <Plane size={14} />}
                        <span className="hidden sm:inline">{b}</span>
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {error && (
                <div className="col-span-1 md:col-span-2 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
            )}

            {/* Full Name */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-zinc-900 ml-1">Full Name</label>
                <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                    <User size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Ex: Amit Singh"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full pl-10 pr-4 h-11 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300"
                    required
                />
                </div>
            </div>

            {/* Phone */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-zinc-900 ml-1">Phone Number</label>
                <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                    <Phone size={18} />
                </div>
                <input
                    type="tel"
                    placeholder="Ex: 9876543210"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full pl-10 pr-4 h-11 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300"
                    required
                />
                </div>
            </div>

            {/* Email */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-zinc-900 ml-1">Email</label>
                <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                    <Mail size={18} />
                </div>
                <input
                    type="email"
                    placeholder="Ex: name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 h-11 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300"
                    required
                />
                </div>
            </div>

            {/* RANK SELECTOR */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-900 ml-1">Rank</label>
                {isCustomRank ? (
                    <div className="relative animate-in fade-in zoom-in-95 duration-200">
                        <input
                            type="text"
                            placeholder="Type rank..."
                            value={formData.rank}
                            onChange={(e) => setFormData({...formData, rank: e.target.value})}
                            className="w-full pl-3 pr-9 h-11 bg-white border border-zinc-900 ring-1 ring-zinc-900 rounded-lg text-zinc-900 text-sm focus:outline-none"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setIsCustomRank(false);
                                setFormData(prev => ({ ...prev, rank: SERVICE_DATA[branch].ranks[0] }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="relative group">
                        <select
                            value={formData.rank}
                            onChange={(e) => {
                                if (e.target.value === 'Other') {
                                    setIsCustomRank(true);
                                    setFormData({...formData, rank: ''});
                                } else {
                                    setFormData({...formData, rank: e.target.value});
                                }
                            }}
                            className="w-full pl-3 pr-9 h-11 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 appearance-none cursor-pointer transition-all"
                        >
                            {SERVICE_DATA[branch].ranks.map((r: string) => <option key={r} value={r}>{r}</option>)}
                            <option value="Other" className="font-bold text-zinc-900">+ Type Custom Rank</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-zinc-900 transition-colors" size={16} />
                    </div>
                )}
            </div>

            {/* ARM SELECTOR */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-900 ml-1">
                    {branch === 'Navy' ? 'Trade' : branch === 'Air Force' ? 'Stream' : 'Arm'}
                </label>
                {isCustomArm ? (
                    <div className="relative animate-in fade-in zoom-in-95 duration-200">
                        <input
                            type="text"
                            placeholder="Type arm..."
                            value={formData.arm}
                            onChange={(e) => setFormData({...formData, arm: e.target.value})}
                            className="w-full pl-3 pr-9 h-11 bg-white border border-zinc-900 ring-1 ring-zinc-900 rounded-lg text-zinc-900 text-sm focus:outline-none"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setIsCustomArm(false);
                                setFormData(prev => ({ ...prev, arm: SERVICE_DATA[branch].arms[0] }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="relative group">
                        <select
                            value={formData.arm}
                            onChange={(e) => {
                                if (e.target.value === 'Other') {
                                    setIsCustomArm(true);
                                    setFormData({...formData, arm: ''});
                                } else {
                                    setFormData({...formData, arm: e.target.value});
                                }
                            }}
                            className="w-full pl-3 pr-9 h-11 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 appearance-none cursor-pointer transition-all"
                        >
                            {SERVICE_DATA[branch].arms.map((a: string) => <option key={a} value={a}>{a}</option>)}
                            <option value="Other" className="font-bold text-zinc-900">+ Type Custom Arm</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-zinc-900 transition-colors" size={16} />
                    </div>
                )}
            </div>

            {/* Unit Field */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-zinc-900 ml-1">
                    {branch === 'Navy' ? 'Last Ship / Base' : branch === 'Air Force' ? 'Last Squadron / Base' : 'Last Unit / Regiment'}
                </label>
                <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                    <MapPin size={18} />
                </div>
                <input
                    type="text"
                    placeholder={
                    branch === 'Navy' ? "Ex: INS Vikrant" : 
                    branch === 'Air Force' ? "Ex: No. 1 Squadron" : 
                    "Ex: 9th Rajput Rifles"
                    }
                    value={formData.unitName}
                    onChange={(e) => setFormData({...formData, unitName: e.target.value})}
                    className="w-full pl-10 pr-4 h-11 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300"
                    required
                />
                </div>
            </div>

            {/* Password */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-zinc-900 ml-1">Password</label>
                <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                    <Lock size={18} />
                </div>
                <input
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-4 h-11 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300"
                    required
                />
                </div>
            </div>

            <div className="col-span-1 md:col-span-2 pt-2">
                <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold text-sm shadow-md shadow-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                ) : (
                    <>
                    Complete Registration <ArrowRight size={18} />
                    </>
                )}
                </button>
            </div>
            </form>

            <div className="text-center">
            <p className="text-zinc-500 text-sm">
                Already have an account?{' '}
                <Link 
                href="/login" 
                className="text-zinc-900 font-bold hover:underline underline-offset-4 ml-1"
                >
                Sign in
                </Link>
            </p>
            </div>
        </div>
      </div>
    </div>
  );
}
