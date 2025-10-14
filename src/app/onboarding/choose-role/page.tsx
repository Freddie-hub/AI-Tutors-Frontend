'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthUser, useAuthActions } from '@/lib/hooks';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';
import { useOnboarding } from '@/lib/context/OnboardingContext';
import { setRole } from '@/lib/api';
import type { UserRole } from '@/lib/types';

type RoleOption = {
  id: UserRole;
  title: string;
  description: string;
  icon: string;
  fallbackRedirect: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'individual-student',
    title: 'Individual Student',
    description:
      'Learn independently with AI-personalised study plans and real-time feedback.',
    icon: '🎓',
    fallbackRedirect: '/onboarding/student',
  },
  {
    id: 'institution-admin',
    title: 'Institution Admin',
    description:
      'Manage enrolment, performance tracking, and AI tutor deployment for your organisation.',
    icon: '🏫',
    fallbackRedirect: '/onboarding/institution',
  },
  {
    id: 'upskill-individual',
    title: 'Upskill Individual',
    description:
      'Accelerate your career with curated skill paths and adaptive AI learning tools.',
    icon: '💡',
    fallbackRedirect: '/onboarding/upskill',
  },
];

const ROLE_REDIRECT: Record<UserRole, string> = {
  'individual-student': '/onboarding/student',
  'institution-student': '/onboarding/student',
  'institution-admin': '/onboarding/institution',
  'upskill-individual': '/onboarding/upskill',
};

export default function ChooseRolePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, error: profileError, refreshProfile } = useAuthUser();
  const { isLoading: guardLoading } = useOnboardingProtection();
  const { loading: actionLoading, error: actionError, clearError, withErrorHandling } =
    useAuthActions();
  const { setIsLoading } = useOnboarding();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Only redirect to /auth if not authenticated. Let the hook handle other cases.
  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

  const pageLoading = authLoading || guardLoading;

  const helpText = useMemo(() => {
    if (profile?.role && profile?.onboarded) {
      return 'You can change your role by selecting a new one below. This will require completing onboarding again.';
    }
    return 'Choose how you plan to use Learning.ai.';
  }, [profile?.role, profile?.onboarded]);

  const handleRoleSelect = async (role: UserRole) => {
    if (!user || actionLoading) return;

    clearError();
    setSelectedRole(role);
    setIsLoading(true);

    try {
      const response = await withErrorHandling(() => setRole(user.uid, { role }));
      if (!response) {
        setSelectedRole(null);
        return;
      }

      // Refresh profile to get updated role and onboarded status
      await refreshProfile();

      const destination =
        response.redirectUrl ||
        ROLE_REDIRECT[role] ||
        ROLE_OPTIONS.find((option) => option.id === role)?.fallbackRedirect;

      if (destination) {
        // Small delay to ensure profile state is updated
        await new Promise(resolve => setTimeout(resolve, 200));
        router.replace(destination);
      }
    } catch (err) {
      setSelectedRole(null);
      console.error('Role selection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== LOADING STATE =====
  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  // ===== PROFILE ERROR =====
  if (profileError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">We ran into an issue</h1>
          <p className="text-gray-600">
            We couldn’t load your profile information. Please retry in a few moments.
          </p>
        </div>
      </div>
    );
  }

  // ===== MAIN CONTENT =====
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 px-4 py-16">
      <div className="text-center mb-16 max-w-2xl">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-6">
          <span className="text-2xl">🚀</span>
        </div>
        <h1 className="text-4xl font-semibold mb-3">Welcome to Learning.ai</h1>
        <p className="text-lg text-gray-600">{helpText}</p>
      </div>

      {actionError && (
        <div className="mb-8 w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {actionError}
        </div>
      )}

      <div className="grid max-w-4xl gap-6 md:grid-cols-3 w-full">
        {ROLE_OPTIONS.map((option) => {
          const isSelected = selectedRole === option.id;
          const isCurrentRole = profile?.role === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleRoleSelect(option.id)}
              disabled={actionLoading && !isSelected}
              className={`rounded-2xl border p-6 text-left transition-all duration-300 relative
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }
                ${actionLoading && !isSelected ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              {isCurrentRole && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Current
                </div>
              )}
              <div className="text-3xl mb-4">{option.icon}</div>
              <h3 className="text-xl font-medium mb-2">{option.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {option.description}
              </p>
              {isSelected && actionLoading && (
                <div className="mt-4 flex items-center text-sm text-blue-600">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                  Setting up...
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-10 text-sm text-gray-500">
        Need help choosing?{' '}
        <button className="text-blue-600 underline underline-offset-4 hover:text-blue-700">
          Chat with our AI assistant
        </button>
      </div>
    </div>
  );
}
