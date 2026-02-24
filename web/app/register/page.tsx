"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

// --- DATA CONFIGURATION ---
const SERVICE_DATA: Record<string, { ranks: string[], arms: string[] }> = {
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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full flex bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white antialiased">
      
      {/* --- LEFT SIDE: BRANDING --- */}
      <div 
        className="hidden lg:flex w-[45%] xl:w-1/2 relative flex-col justify-between p-10 xl:p-12 overflow-hidden"
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
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight font-serif italic">Veer AI</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-8">
          <h2 className="text-5xl xl:text-6xl font-medium text-white leading-[1.1] font-serif">
            Service to <br/>
            <span className="text-zinc-400 italic">Civilian Success.</span>
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed font-light max-w-md">
            Join thousands of veterans transitioning into corporate leadership. Your discipline is your greatest asset.
          </p>

          {/* Premium Testimonial Card */}
          <div className="bg-white/[0.03] backdrop-blur-[16px] border border-white/[0.08] p-6 rounded-2xl shadow-2xl shadow-black/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                <Quote size={80} className="text-white" />
            </div>
            
            <Quote className="text-zinc-500 mb-3 relative z-10" size={20} />
            <p className="text-zinc-200 mb-6 text-sm font-light leading-relaxed relative z-10">
                "The platform understood my service background instantly. I found a role that valued my command experience within days."
            </p>
            
            <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                    VS
                </div>
                <div>
                    <p className="text-sm font-bold text-white font-serif tracking-wide">Vikram Singh</p>
                    <p className="text-xs text-zinc-400">Ex-Major, 4 Para SF</p>
                </div>
                <div className="ml-auto flex gap-1 text-gold-accent" style={{ color: '#D4AF37' }}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-6">
          <div className="flex flex-col gap-1">
            <span className="text-white font-semibold tracking-wide text-xs">TRUSTED BY LEADERS AT</span>
            <div className="flex gap-4 opacity-50 text-white text-xs mt-1 font-mono uppercase">
              <span>Reliance</span> • <span>adani</span> • <span>adityabirla</span>
            </div>
          </div>
          <div className="text-zinc-500 text-xs">
            © 2026 The Veteran Company
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center bg-white p-6 sm:p-8 lg:px-12 lg:py-8 relative overflow-y-auto lg:overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-100 rounded-bl-full -z-0 opacity-50 pointer-events-none" />
        
        <div className="w-full max-w-[500px] z-10 flex flex-col justify-center h-full">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={16} />
            </div>
            <span className="text-lg font-bold text-zinc-900 font-serif italic">Veer AI</span>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-zinc-900 tracking-tight mb-2">Create Account</h1>
            <p className="text-zinc-500 text-sm lg:text-base">Enter your service details to verify eligibility.</p>
          </div>

          {/* BRANCH TABS */}
          <div className="bg-zinc-50 p-1.5 rounded-xl grid grid-cols-3 gap-1 border border-zinc-100 mb-6 shadow-sm">
            {['Army', 'Navy', 'Air Force'].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBranch(b)}
                className={`
                  py-2.5 rounded-lg text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-300
                  ${branch === b 
                    ? 'bg-white text-zinc-900 shadow-md ring-1 ring-zinc-200/50' 
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }
                `}
              >
                {b === 'Army' && <Shield size={16} />}
                {b === 'Navy' && <Anchor size={16} />}
                {b === 'Air Force' && <Plane size={16} />}
                <span className="hidden sm:inline">{b}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {error && (
              <div className="col-span-1 md:col-span-2 p-2.5 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertTriangle size={16} className="text-red-500 shrink-0" />
                <p className="text-xs font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors duration-300">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Ex: Amit Singh"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full pl-10 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:bg-white focus:border-zinc-800 focus:ring-0 transition-all placeholder:text-zinc-400 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors duration-300">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  placeholder="Ex: 9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full pl-10 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:bg-white focus:border-zinc-800 focus:ring-0 transition-all placeholder:text-zinc-400 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors duration-300">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:bg-white focus:border-zinc-800 focus:ring-0 transition-all placeholder:text-zinc-400 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* RANK SELECTOR */}
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 ml-1">Rank</label>
              {isCustomRank ? (
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <input
                    type="text"
                    placeholder="Type rank..."
                    value={formData.rank}
                    onChange={(e) => setFormData({...formData, rank: e.target.value})}
                    className="w-full pl-4 pr-10 h-12 bg-white border border-zinc-800 rounded-xl text-zinc-900 text-sm focus:outline-none shadow-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomRank(false);
                      setFormData(prev => ({ ...prev, rank: SERVICE_DATA[branch].ranks[0] }));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 rounded-full"
                  >
                    <X size={14} />
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
                    className="w-full pl-4 pr-10 h-12 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:bg-white focus:border-zinc-800 focus:ring-0 appearance-none cursor-pointer transition-all shadow-sm"
                  >
                    {SERVICE_DATA[branch].ranks.map((r) => <option key={r} value={r}>{r}</option>)}
                    <option value="Other" className="font-semibold text-zinc-900">+ Type Custom Rank</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-zinc-900 transition-colors" size={18} />
                </div>
              )}
            </div>

            {/* ARM SELECTOR */}
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 ml-1">
                {branch === 'Navy' ? 'Trade' : branch === 'Air Force' ? 'Stream' : 'Arm'}
              </label>
              {isCustomArm ? (
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <input
                    type="text"
                    placeholder="Type arm..."
                    value={formData.arm}
                    onChange={(e) => setFormData({...formData, arm: e.target.value})}
                    className="w-full pl-4 pr-10 h-12 bg-white border border-zinc-800 rounded-xl text-zinc-900 text-sm focus:outline-none shadow-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomArm(false);
                      setFormData(prev => ({ ...prev, arm: SERVICE_DATA[branch].arms[0] }));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 rounded-full"
                  >
                    <X size={14} />
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
                    className="w-full pl-4 pr-10 h-12 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:bg-white focus:border-zinc-800 focus:ring-0 appearance-none cursor-pointer transition-all shadow-sm"
                  >
                    {SERVICE_DATA[branch].arms.map((a) => <option key={a} value={a}>{a}</option>)}
                    <option value="Other" className="font-semibold text-zinc-900">+ Type Custom Arm</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-zinc-900 transition-colors" size={18} />
                </div>
              )}
            </div>

            {/* Unit Field */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 ml-1">
                {branch === 'Navy' ? 'Last Ship / Base' : branch === 'Air Force' ? 'Last Squadron / Base' : 'Last Unit / Regiment'}
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors duration-300">
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
                  className="w-full pl-10 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:bg-white focus:border-zinc-800 focus:ring-0 transition-all placeholder:text-zinc-400 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors duration-300">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:bg-white focus:border-zinc-800 focus:ring-0 transition-all placeholder:text-zinc-400 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-zinc-900 hover:bg-black text-white rounded-xl font-medium text-sm shadow-xl shadow-zinc-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-80 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>Creating Account... <Loader2 size={16} className="animate-spin" /></>
                  ) : (
                    <>Complete Registration <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </span>
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-zinc-500 text-sm">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-zinc-900 font-bold hover:text-black hover:underline underline-offset-4 ml-1"
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