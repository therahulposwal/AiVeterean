"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, ArrowRight, User, Phone, Lock, ChevronDown, CheckCircle2, MapPin, Anchor, Plane, Shield, X } from 'lucide-react';
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
    phoneNumber: '',
    password: '',
    unitName: '',
    rank: 'Sepoy', // Default start value
    arm: 'Infantry' // Default start value
  });
  
  // Custom Input Toggles
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
        alert("Account created successfully! Please log in.");
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
    <div className="min-h-dvh bg-stone-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* BRAND HEADER */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-stone-300">
          <ShieldCheck size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Join Veer</h1>
        <p className="text-stone-500 mt-2 font-medium">Begin your civilian transition journey</p>
      </div>

      <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 p-8 sm:p-10 animate-in zoom-in-95 duration-500">
        
        {/* BRANCH SELECTOR TABS */}
        <div className="flex p-1 bg-stone-100 rounded-xl mb-8">
            {['Army', 'Navy', 'Air Force'].map((b) => (
                <button
                    key={b}
                    type="button"
                    onClick={() => setBranch(b)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                        branch === b 
                        ? 'bg-white text-stone-900 shadow-sm' 
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                >
                    {b === 'Army' && <Shield size={16} />}
                    {b === 'Navy' && <Anchor size={16} />}
                    {b === 'Air Force' && <Plane size={16} />}
                    {b}
                </button>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {error && (
            <div className="col-span-1 md:col-span-2 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="text-red-500" size={16} />
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                placeholder="Ex: Amit Singh"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-stone-900 transition-colors"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="tel"
                placeholder="Ex: 9876543210"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-stone-900 transition-colors"
                required
              />
            </div>
          </div>

          {/* DYNAMIC RANK */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Rank</label>
            {isCustomRank ? (
                // ✅ FIXED: Text Input with "X" Button
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                    <input
                        type="text"
                        placeholder="Type your rank..."
                        value={formData.rank}
                        onChange={(e) => setFormData({...formData, rank: e.target.value})}
                        className="w-full pl-4 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-stone-900"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setIsCustomRank(false);
                            setFormData(prev => ({ ...prev, rank: SERVICE_DATA[branch].ranks[0] }));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
                        title="Back to list"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <select
                        value={formData.rank}
                        onChange={(e) => {
                            if (e.target.value === 'Other') {
                                setIsCustomRank(true);
                                setFormData({...formData, rank: ''}); // Clear for typing
                            } else {
                                setFormData({...formData, rank: e.target.value});
                            }
                        }}
                        className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-stone-900 appearance-none cursor-pointer"
                    >
                        {SERVICE_DATA[branch].ranks.map((r: string) => <option key={r} value={r}>{r}</option>)}
                        <option value="Other" className="text-emerald-600 font-bold">Other (Type in)...</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
                </div>
            )}
          </div>

          {/* DYNAMIC ARM */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">
                {branch === 'Navy' ? 'Branch/Trade' : branch === 'Air Force' ? 'Stream' : 'Arm/Service'}
            </label>
            {isCustomArm ? (
                // ✅ FIXED: Text Input with "X" Button
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                    <input
                        type="text"
                        placeholder="Type your arm..."
                        value={formData.arm}
                        onChange={(e) => setFormData({...formData, arm: e.target.value})}
                        className="w-full pl-4 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-stone-900"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setIsCustomArm(false);
                            setFormData(prev => ({ ...prev, arm: SERVICE_DATA[branch].arms[0] }));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
                        title="Back to list"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <select
                        value={formData.arm}
                        onChange={(e) => {
                            if (e.target.value === 'Other') {
                                setIsCustomArm(true);
                                setFormData({...formData, arm: ''}); // Clear for typing
                            } else {
                                setFormData({...formData, arm: e.target.value});
                            }
                        }}
                        className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-stone-900 appearance-none cursor-pointer"
                    >
                        {SERVICE_DATA[branch].arms.map((a: string) => <option key={a} value={a}>{a}</option>)}
                        <option value="Other" className="text-emerald-600 font-bold">Other (Type in)...</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
                </div>
            )}
          </div>

          {/* Unit Field */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">
                {branch === 'Navy' ? 'Last Ship / Base' : branch === 'Air Force' ? 'Last Squadron / Base' : 'Last Unit / Regiment'}
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                placeholder={
                  branch === 'Navy' ? "Ex: INS Vikrant" : 
                  branch === 'Air Force' ? "Ex: No. 1 Squadron" : 
                  "Ex: 9th Rajput Rifles"
                }
                value={formData.unitName}
                onChange={(e) => setFormData({...formData, unitName: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-stone-900 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-stone-900 transition-colors"
                required
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={20} className="text-emerald-100" /></>}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-stone-500 text-sm font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-stone-900 hover:text-black font-bold hover:underline decoration-2 underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}