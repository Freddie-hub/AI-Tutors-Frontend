"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser } from '@/lib/hooks';

export function useAuthPageRedirect() {
  const router = useRouter();
  const { profile, loading } = useAuthUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    // If already onboarded, go to proper dashboard
    if (profile?.onboarded) {
      if (profile.role === 'institution-admin') router.push('/dashboard/institution');
      else if (profile.role === 'individual-student') router.push('/dashboard/student');
      else router.push('/dashboard/student');
    }
    setIsLoading(false);
  }, [loading, profile, router]);

  return { isLoading };
}

export function useDashboardProtection(allowedRoles?: string[]) {
  const router = useRouter();
  const { profile, loading } = useAuthUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.push('/auth');
      return;
    }
    if (!profile.onboarded) {
      router.push('/onboarding/choose-role');
      return;
    }
    if (allowedRoles && profile.role && !allowedRoles.includes(profile.role)) {
      router.push('/');
      return;
    }
    setIsLoading(false);
  }, [loading, profile, router, allowedRoles]);

  return { isLoading };
}
