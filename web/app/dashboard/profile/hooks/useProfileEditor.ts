"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  EMPTY_PROFILE_DATA,
  type EducationItem,
  type ProfileData,
  type VeteranProfilePayload,
  type WorkExperienceItem,
} from '@/types/profile';

type EditableRootField = 'fullName' | 'email' | 'phoneNumber' | 'linkedin' | 'rank' | 'branch' | 'arm' | 'unitName';
type EditableArrayField = 'technicalSkills' | 'softSkills' | 'courses' | 'achievements';

function normalizeProfile(profile: VeteranProfilePayload): VeteranProfilePayload {
  return {
    ...profile,
    fullName: profile.fullName ?? '',
    email: profile.email ?? '',
    phoneNumber: profile.phoneNumber ?? '',
    linkedin: profile.linkedin ?? '',
    rank: profile.rank ?? '',
    branch: profile.branch ?? '',
    arm: profile.arm ?? '',
    unitName: profile.unitName ?? '',
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
}

function cleanProfileData(profileData: ProfileData): ProfileData {
  const arrayKeys: EditableArrayField[] = ['technicalSkills', 'softSkills', 'courses', 'achievements'];
  const cleaned = { ...profileData };

  arrayKeys.forEach((key) => {
    cleaned[key] = (cleaned[key] ?? []).filter((line) => line.trim() !== '');
  });

  cleaned.workExperience = (cleaned.workExperience ?? []).map((job) => ({
    ...job,
    responsibilities: (job.responsibilities ?? []).filter((line) => line.trim() !== ''),
  }));

  return cleaned;
}

export function useProfileEditor(initialProfile: VeteranProfilePayload, onRetake?: () => void) {
  const router = useRouter();
  const normalizedInitialProfile = normalizeProfile(initialProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<VeteranProfilePayload>(normalizedInitialProfile);

  useEffect(() => {
    setFormData(normalizeProfile(initialProfile));
  }, [initialProfile]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const cleanData: VeteranProfilePayload = {
        ...formData,
        profileData: cleanProfileData(formData.profileData),
      };

      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: cleanData }),
      });
      if (!res.ok) throw new Error('Failed');

      setFormData(cleanData);
      setIsEditing(false);
      router.refresh();
    } catch {
      alert('Save failed.');
    } finally {
      setIsSaving(false);
    }
  }, [formData, router]);

  const handleCancel = useCallback(() => {
    setFormData(normalizeProfile(initialProfile));
    setIsEditing(false);
  }, [initialProfile]);

  const handleRetake = useCallback(async () => {
    if (onRetake) {
      onRetake();
      return;
    }

    const confirmed = window.confirm('Retake interview? This will reset your current generated profile.');
    if (!confirmed) return;

    try {
      const res = await fetch('/api/reset-interview', {
        method: 'POST',
      });
      const data = (await res.json()) as { success: boolean; error?: string };
      if (!data.success) {
        alert(`Failed to reset: ${data.error || 'Unknown error'}`);
        return;
      }

      router.push('/interview');
      router.refresh();
    } catch {
      alert('Connection failed.');
    }
  }, [onRetake, router]);

  const handleChange = useCallback((field: EditableRootField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSummaryChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      profileData: { ...prev.profileData, professionalSummary: value },
    }));
  }, []);

  const handleArrayChange = useCallback((category: EditableArrayField, value: string) => {
    setFormData((prev) => ({
      ...prev,
      profileData: {
        ...prev.profileData,
        [category]: value.split('\n'),
      },
    }));
  }, []);

  const handleExperienceChange = useCallback(
    (index: number, field: keyof WorkExperienceItem, value: string | string[]) => {
      const updatedExperience = [...(formData.profileData?.workExperience || [])];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value,
      } as WorkExperienceItem;

      setFormData((prev) => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          workExperience: updatedExperience,
        },
      }));
    },
    [formData.profileData]
  );

  const handleResponsibilitiesChange = useCallback(
    (index: number, textBlock: string) => {
      handleExperienceChange(index, 'responsibilities', textBlock.split('\n'));
    },
    [handleExperienceChange]
  );

  const handleEducationChange = useCallback(
    (index: number, field: keyof EducationItem, value: string) => {
      const updatedEducation = [...(formData.profileData?.education || [])];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value,
      };

      setFormData((prev) => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          education: updatedEducation,
        },
      }));
    },
    [formData.profileData]
  );

  const addEducation = useCallback(() => {
    const updatedEducation = [
      ...(formData.profileData?.education || []),
      { degree: '', institution: '', year: '', marks: '' },
    ];
    setFormData((prev) => ({
      ...prev,
      profileData: {
        ...prev.profileData,
        education: updatedEducation,
      },
    }));
  }, [formData.profileData]);

  const removeEducation = useCallback(
    (index: number) => {
      const updatedEducation = [...(formData.profileData?.education || [])];
      updatedEducation.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          education: updatedEducation,
        },
      }));
    },
    [formData.profileData]
  );

  return {
    isEditing,
    isSaving,
    formData,
    setFormData,
    setIsEditing,
    handleSave,
    handleCancel,
    handleRetake,
    handleChange,
    handleSummaryChange,
    handleArrayChange,
    handleExperienceChange,
    handleResponsibilitiesChange,
    handleEducationChange,
    addEducation,
    removeEducation,
  };
}
