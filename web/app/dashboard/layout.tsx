import { redirect } from 'next/navigation';
import Navbar from './Navbar';
import { getAuthenticatedProfile } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getAuthenticatedProfile();
  if (!profile) redirect('/login');
  if (!profile.isInterviewComplete) redirect('/interview');

  return (
    <div className="relative min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.12) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="pointer-events-none absolute -top-40 -right-20 h-96 w-96 rounded-full bg-zinc-800 blur-3xl opacity-40" />
      <div className="pointer-events-none absolute -bottom-48 -left-20 h-96 w-96 rounded-full bg-emerald-900 blur-3xl opacity-20" />
      <Navbar 
        userRank={profile.rank ?? 'Veteran'} 
        userName={profile.fullName ?? 'User'} 
      />
      <main className="relative z-10 flex-grow w-full max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
