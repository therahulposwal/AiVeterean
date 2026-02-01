"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardView from '@/components/DashboardView';
import InterviewView from '@/components/InterviewView';

export default function Home() {
  const { isAuthenticated, token } = useAuth(); 

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);

  const fetchProfile = async () => {
    const userId = localStorage.getItem('veteran_userId');
    if (!userId) { setLoadingProfile(false); return; }

    try {
      const res = await fetch(`/api/get-profile?userId=${userId}`);
      const data = await res.json();
      
      // ✅ LOGIC: Use the database flag "isInterviewComplete"
      if (data.success) {
        setProfileData(data.data);
        setIsInterviewComplete(data.data.isInterviewComplete); // True/False from DB
      }
    } catch (e) {
      console.error("Fetch Error", e);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated]);

  const handleFinishInterview = async () => {
    const userId = localStorage.getItem('veteran_userId');
    try {
        const res = await fetch('/api/build-profile', { 
            method: 'POST', 
            body: JSON.stringify({ userId }) 
        });
        const data = await res.json();
        
        if (data.success) {
            // Refresh to get the new flag and data
            await fetchProfile();
        } else {
            alert("Analysis Failed: " + data.message);
        }
    } catch (e) { alert("Server Error"); }
  };

  const handleRetake = () => {
      if(confirm("This will clear your current resume. Are you sure?")) {
        // In a real app, you might want to call an API to reset 'isInterviewComplete' to false here
        // For now, we just flip the UI state
        setIsInterviewComplete(false);
      }
  };

  if (!isAuthenticated || loadingProfile) return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400 font-bold tracking-widest animate-pulse">LOADING...</div>;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans selection:bg-emerald-100">
      
      {isInterviewComplete && profileData ? (
        /* --- 1. DASHBOARD MODE --- */
        <div className="w-full">
            <DashboardView profile={profileData} onRetake={handleRetake} />
        </div>
      ) : (
        /* --- 2. INTERVIEW MODE --- */
        <InterviewView 
          token={token} 
          onFinish={handleFinishInterview}
          userRank={profileData?.rank || localStorage.getItem('veteran_rank') || 'Sepoy'}
          userName={profileData?.fullName || localStorage.getItem('veteran_fullName') || 'Soldier'}
        />
      )}
    </div>
  );
}