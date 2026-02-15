import { redirect } from 'next/navigation';
import { getAuthenticatedProfile } from '@/lib/auth';
import InterviewFlowClient from './InterviewFlowClient';

export default async function InterviewPage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    redirect('/login');
  }

  if (profile.isInterviewComplete) {
    redirect('/dashboard/profile');
  }

  return <InterviewFlowClient />;
}
