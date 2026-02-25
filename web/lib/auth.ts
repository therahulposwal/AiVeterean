import 'server-only';

import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import { verifySessionLikeToken } from '@/lib/session';
import {
  EMPTY_PROFILE_DATA,
  type EducationItem,
  type ProfileData,
  type VeteranProfilePayload,
  type WorkExperienceItem,
} from '@/types/profile';

type CookieLike = {
  get(name: string): { value: string } | undefined;
};

type LooseRecord = Record<string, unknown>;

function isRecord(value: unknown): value is LooseRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

function stringifyStructuredItem(item: LooseRecord): string {
  const name = toText(item.name ?? item.title ?? item.degree ?? item.role ?? item.course ?? item.achievement);
  const institution = toText(item.institution ?? item.organization ?? item.unit);
  const year = toText(item.year ?? item.startDate);
  const duration = toText(item.duration ?? item.endDate);

  const segments: string[] = [];
  if (name) {
    segments.push(name);
  }
  if (institution) {
    segments.push(institution);
  }

  const period = [year, duration].filter(Boolean).join(' - ');
  if (period) {
    segments.push(period);
  }

  return segments.join(' | ');
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
        return String(item).trim();
      }

      if (isRecord(item)) {
        return stringifyStructuredItem(item);
      }

      return '';
    })
    .filter((item): item is string => item.length > 0);
}

function normalizeEducation(value: unknown): EducationItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const degree = toText(item.degree ?? item.name ?? item.title);
      const institution = toText(item.institution);
      const year = toText(item.year ?? item.passOutYear ?? item.startDate);
      const marks = toText(item.marks ?? item.grade ?? item.cgpa ?? item.duration);

      if (!degree && !institution && !year && !marks) {
        return null;
      }

      return { degree, institution, year, marks };
    })
    .filter((item): item is EducationItem => item !== null);
}

function normalizeWorkExperience(value: unknown): WorkExperienceItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const role = toText(item.role ?? item.name ?? item.title);
      const unit = toText(item.unit ?? item.institution ?? item.organization);
      const location = toText(item.location);
      const startDate = toText(item.startDate ?? item.year);
      const endDate = toText(item.endDate ?? item.duration);
      const responsibilities = normalizeStringArray(item.responsibilities);

      if (!role && !unit && !location && !startDate && !endDate && responsibilities.length === 0) {
        return null;
      }

      return { role, unit, location, startDate, endDate, responsibilities };
    })
    .filter((item): item is WorkExperienceItem => item !== null);
}

function normalizeProfileData(value: unknown): ProfileData {
  const profileData = isRecord(value) ? value : {};

  return {
    professionalSummary: toText(profileData.professionalSummary) || EMPTY_PROFILE_DATA.professionalSummary,
    workExperience: normalizeWorkExperience(profileData.workExperience),
    technicalSkills: normalizeStringArray(profileData.technicalSkills),
    softSkills: normalizeStringArray(profileData.softSkills),
    courses: normalizeStringArray(profileData.courses),
    achievements: normalizeStringArray(profileData.achievements),
    education: normalizeEducation(profileData.education),
  };
}

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
    fullName: toText(profile.fullName),
    email: toText(profile.email),
    phoneNumber: toText(profile.phoneNumber),
    linkedin: toText(profile.linkedin),
    rank: toText(profile.rank),
    arm: toText(profile.arm),
    branch: toText(profile.branch),
    unitName: toText(profile.unitName),
    interviewNotes: normalizeStringArray(profile.interviewNotes),
    interviewPhase: toText(profile.interviewPhase) || 'FOUNDATION',
    appointmentCount: typeof profile.appointmentCount === 'number' ? profile.appointmentCount : 0,
    isInterviewComplete: Boolean(profile.isInterviewComplete),
    createdAt: profile.createdAt ? new Date(profile.createdAt).toISOString() : undefined,
    updatedAt: profile.updatedAt ? new Date(profile.updatedAt).toISOString() : undefined,
    profileData: normalizeProfileData(profile.profileData),
  };

  return normalized;
}
