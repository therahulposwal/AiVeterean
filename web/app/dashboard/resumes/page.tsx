import { redirect } from 'next/navigation';
import ResumesClient from './ResumesClient';
import { getAuthenticatedProfile } from '@/lib/auth';

export default async function ResumesPage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    redirect('/login');
  }

  return <ResumesClient profile={profile} />;
}
