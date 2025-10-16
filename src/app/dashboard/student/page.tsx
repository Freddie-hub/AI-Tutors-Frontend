"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import { useAuthUser } from '@/lib/hooks';

export default function StudentDashboardIndexPage() {
  useDashboardProtection(['individual-student', 'institution-student']);
  const router = useRouter();
  const { profile, loading } = useAuthUser();

  useEffect(() => {
    if (loading) return;
    const curriculum = profile?.preferences?.curriculum;
    // Route by curriculum when available
    if (curriculum === 'British') {
      router.replace('/dashboard/student/gcse');
    } else {
      // Default to CBC for now
      router.replace('/dashboard/student/cbc');
    }
  }, [loading, profile?.preferences?.curriculum, router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-slate-600">Preparing your student dashboard…</div>
    </main>
  );
}
