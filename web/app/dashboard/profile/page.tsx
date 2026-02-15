import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';
import { getAuthenticatedProfile } from '@/lib/auth';

export default async function ProfilePage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    redirect('/login');
  }

  return <ProfileClient profile={profile} />;
}
