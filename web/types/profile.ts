export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  marks: string;
}

export interface WorkExperienceItem {
  role: string;
  unit: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export interface ProfileData {
  professionalSummary: string;
  workExperience: WorkExperienceItem[];
  technicalSkills: string[];
  softSkills: string[];
  courses: string[];
  achievements: string[];
  education: EducationItem[];
}

export interface VeteranProfilePayload {
  _id?: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  linkedin?: string;
  rank: string;
  arm: string;
  branch: string;
  unitName: string;
  interviewNotes?: string[];
  interviewPhase?: string;
  appointmentCount?: number;
  isInterviewComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  profileData: ProfileData;
}

export const EMPTY_PROFILE_DATA: ProfileData = {
  professionalSummary: '',
  workExperience: [],
  technicalSkills: [],
  softSkills: [],
  courses: [],
  achievements: [],
  education: [],
};
