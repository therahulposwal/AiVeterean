"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import ProfileView from './ProfileView';
import ResumesView from './ResumesView';
import JobsView from './JobsView';

interface DashboardProps {
  profile: any;
  // onRetake removed from props; we handle it internally now.
}

export default function DashboardView({ profile }: DashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const { rank, fullName } = profile;

  // ✅ INTEGRATED RETAKE LOGIC
  const handleRetake = async () => {
    const confirmed = window.confirm(
      "⚠️ RETAKE INTERVIEW?\n\nThis will PERMANENTLY DELETE all your current progress, notes, and generated profile.\n\nAre you sure you want to start over?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      
      // Call the API route we created
      const res = await fetch('/api/reset-interview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.success) {
        // Clear local storage hints
        localStorage.removeItem('veteran_summary');
        
        // Force a hard refresh/redirect to the interview page
        router.push('/interview'); 
        router.refresh(); 
      } else {
        alert("Failed to reset: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Connection failed.");
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen flex flex-col font-sans">
      {/* 1. Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRank={rank} 
        userName={fullName} 
      />

      {/* 2. Main Content Area */}
      <main className="flex-grow w-full max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        
        {activeTab === 'profile' && (
          <ProfileView 
            profile={profile} 
            onRetake={handleRetake} // ✅ Pass the internal handler
          />
        )}
        
        {activeTab === 'resumes' && (
          <ResumesView />
        )}
        
        {activeTab === 'jobs' && (
          <JobsView />
        )}

      </main>
    </div>
  );
}