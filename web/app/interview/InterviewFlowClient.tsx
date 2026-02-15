"use client";

import { useRouter } from 'next/navigation';
import InterviewClient from './InterviewClient';

export default function InterviewFlowClient() {
  const router = useRouter();

  const handleFinishInterview = async () => {
    try {
      const res = await fetch('/api/build-profile', {
        method: 'POST',
      });
      const raw = await res.text();
      let data: { success?: boolean; message?: string } | null = null;
      if (raw) {
        try {
          data = JSON.parse(raw) as { success?: boolean; message?: string };
        } catch {
          data = null;
        }
      }

      if (!res.ok || !data?.success) {
        alert(`Analysis failed: ${data?.message || 'Unknown error'}`);
        return;
      }

      router.push('/dashboard/profile');
      router.refresh();
    } catch {
      alert('Server error');
    }
  };

  return <InterviewClient onFinish={handleFinishInterview} />;
}
