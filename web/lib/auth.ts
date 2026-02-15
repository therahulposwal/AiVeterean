import 'server-only';

import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import { verifySessionLikeToken } from '@/lib/session';
import { EMPTY_PROFILE_DATA, type VeteranProfilePayload } from '@/types/profile';

type CookieLike = {
  get(name: string): { value: string } | undefined;
};

function getUserIdFromCookieReader(cookieReader: CookieLike): string | null {
  const token = cookieReader.get('veteran_token')?.value;
  if (!token) {
    return null;
  }

  const claims = verifySessionLikeToken(token);
  if (!claims || !claims.userId) {
    return null;
  }

  return claims.userId;
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return getUserIdFromCookieReader(cookieStore);
}

export function getAuthenticatedUserIdFromRequest(request: NextRequest): string | null {
  return getUserIdFromCookieReader(request.cookies);
}

export async function getAuthenticatedProfile(): Promise<VeteranProfilePayload | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return null;
  }

  await dbConnect();
  const profile = await VeteranProfile.findById(userId).lean();
  if (!profile) {
    return null;
  }

  const normalized: VeteranProfilePayload = {
    _id: String(profile._id),
    fullName: profile.fullName ?? '',
    email: profile.email ?? '',
    phoneNumber: profile.phoneNumber ?? '',
    linkedin: profile.linkedin ?? '',
    rank: profile.rank ?? '',
    arm: profile.arm ?? '',
    branch: profile.branch ?? '',
    unitName: profile.unitName ?? '',
    interviewNotes: profile.interviewNotes ?? [],
    interviewPhase: profile.interviewPhase ?? 'FOUNDATION',
    appointmentCount: profile.appointmentCount ?? 0,
    isInterviewComplete: profile.isInterviewComplete ?? false,
    createdAt: profile.createdAt ? new Date(profile.createdAt).toISOString() : undefined,
    updatedAt: profile.updatedAt ? new Date(profile.updatedAt).toISOString() : undefined,
    profileData: {
      professionalSummary: profile.profileData?.professionalSummary ?? EMPTY_PROFILE_DATA.professionalSummary,
      workExperience: profile.profileData?.workExperience ?? EMPTY_PROFILE_DATA.workExperience,
      technicalSkills: profile.profileData?.technicalSkills ?? EMPTY_PROFILE_DATA.technicalSkills,
      softSkills: profile.profileData?.softSkills ?? EMPTY_PROFILE_DATA.softSkills,
      courses: profile.profileData?.courses ?? EMPTY_PROFILE_DATA.courses,
      achievements: profile.profileData?.achievements ?? EMPTY_PROFILE_DATA.achievements,
      education: profile.profileData?.education ?? EMPTY_PROFILE_DATA.education,
    },
  };

  return normalized;
}
