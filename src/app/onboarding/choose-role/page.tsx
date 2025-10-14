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
  gradient: string;
  fallbackRedirect: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'individual-student',
    title: 'Individual Student',
    description:
      'Learn independently with AI-personalised study plans, real-time feedback, and adaptive lesson recommendations.',
    icon: '🎓',
    gradient: 'from-blue-500 to-cyan-500',
    fallbackRedirect: '/onboarding/student',
  },
  {
    id: 'institution-admin',
    title: 'Institution Admin',
    description:
      'Streamline enrolment, track performance, and deploy AI tutors at scale for your organisation.',
    icon: '🏫',
    gradient: 'from-purple-500 to-pink-500',
    fallbackRedirect: '/onboarding/institution',
  },
  {
    id: 'upskill-individual',
    title: 'Upskill Individual',
    description:
      'Accelerate your career with AI-curated skills, progress tracking, and smart practice sessions.',
    icon: '💡',
    gradient: 'from-indigo-500 to-blue-500',
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
  const { user, profile, loading: authLoading, error: profileError } = useAuthUser();
  const { isLoading: guardLoading } = useOnboardingProtection();
  const { loading: actionLoading, error: actionError, clearError, withErrorHandling } = useAuthActions();
  const { setIsLoading } = useOnboarding();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

  const pageLoading = authLoading || guardLoading;

  const helpText = useMemo(() => {
    if (profile?.role && profile?.onboarded) {
      return 'You can switch roles later in settings.';
    }
    return 'Pick the option that best matches how you plan to use Learning.ai.';
  }, [profile?.role, profile?.onboarded]);

  const handleRoleSelect = async (role: UserRole) => {
    if (!user || actionLoading) {
      return;
    }

    clearError();
    setSelectedRole(role);
    setIsLoading(true);

    try {
      const response = await withErrorHandling(() => setRole(user.uid, { role }));
      if (!response) {
        return;
      }

      const destination =
        response.redirectUrl || ROLE_REDIRECT[role] || ROLE_OPTIONS.find((option) => option.id === role)?.fallbackRedirect;

      if (destination) {
        router.replace(destination);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-border" />
          <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-red-500/10 border border-red-400/20 rounded-3xl p-8 max-w-xl text-center text-white">
          <h1 className="text-2xl font-semibold mb-4">We ran into an issue</h1>
          <p className="text-slate-200">
            We couldn’t load your profile information yet, so role selection is temporarily disabled. Please retry in a few moments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center mb-16 max-w-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Welcome to Learning.ai</h1>
          <p className="text-xl text-slate-300 leading-relaxed">{helpText}</p>
        </div>

        {actionError && (
          <div className="mb-8 w-full max-w-xl rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {actionError}
          </div>
        )}

        <div className="grid max-w-5xl gap-8 md:grid-cols-3 w-full">
          {ROLE_OPTIONS.map((option) => {
            const isSelected = selectedRole === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleRoleSelect(option.id)}
                disabled={actionLoading && !isSelected}
                className={`group relative rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30 ${
                  isSelected ? 'ring-2 ring-white/40 bg-white/15' : ''
                } ${actionLoading && !isSelected ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${option.gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`} />
                <div className="relative z-10">
                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${option.gradient} text-3xl shadow-lg shadow-black/30`}>{option.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{option.title}</h3>
                  <p className="text-slate-300 leading-relaxed text-sm">{option.description}</p>
                  <div className="mt-6 flex items-center text-slate-400 transition-all duration-300 group-hover:text-white group-hover:translate-x-2">
                    <span className="text-sm font-medium mr-2">Get started</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                {actionLoading && isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/30 backdrop-blur-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-white to-transparent bg-clip-border" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-16 text-center text-sm text-slate-400">
          Need help choosing?{' '}
          <button type="button" className="text-blue-400 underline underline-offset-4 hover:text-blue-300">
            Chat with our AI assistant
          </button>
        </div>
      </div>
    </div>
  );
}