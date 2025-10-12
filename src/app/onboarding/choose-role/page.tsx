'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser, useAuthActions } from '@/lib/hooks';
import { OnboardingContext } from '@/lib/context/OnboardingContext';
import { setRole } from '@/lib/api';

type UserRole = 'individual-student' | 'institution-admin' | 'upskill-individual' | 'institution-student';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  redirect: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'individual-student',
    title: 'Individual Student',
    description: 'Learn independently with AI-powered personalized content and adaptive learning paths.',
    icon: 'graduation-cap',
    gradient: 'from-blue-500 to-cyan-500',
    redirect: '/onboarding/student'
  },
  {
    id: 'institution-admin',
    title: 'Institution Admin',
    description: 'Manage learning programs, track student progress, and deploy AI tutors at scale.',
    icon: 'school',
    gradient: 'from-purple-500 to-pink-500',
    redirect: '/onboarding/institution'
  },
  {
    id: 'upskill-individual',
    title: 'Upskill Individual',
    description: 'Upskill with AI-powered personalized learning for professional or personal growth.',
    icon: 'light-bulb',
    gradient: 'from-indigo-500 to-blue-500',
    redirect: '/onboarding/upskill'
  }
];

export default function ChooseRolePage() {
  const router = useRouter();
  const { user } = useAuthUser();
  const { loading: actionLoading, setError } = useAuthActions();
  const { setIsOnboarding } = useContext(OnboardingContext);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for institution-student and redirect
  useEffect(() => {
    if (!user) {
      console.log('[ChooseRole] no user detected, redirecting to /auth');
      router.push('/auth');
      return;
    }

    if (user.userData?.role === 'institution-student' && !user.userData?.onboarded) {
      console.log('[ChooseRole] institution-student detected, redirecting to /onboarding/student');
      router.push('/onboarding/student');
      return;
    }

    setIsLoading(false);
  }, [user, router]);

  // Debug: component lifecycle
  useEffect(() => {
    console.log('[ChooseRole] mounted');
    return () => console.log('[ChooseRole] unmounted');
  }, []);

  // Debug: key state changes
  useEffect(() => {
    console.log('[ChooseRole] state update', {
      isLoading,
      actionLoading,
      selectedRole,
      userUid: user?.uid ?? null,
    });
  }, [isLoading, actionLoading, selectedRole, user]);

  if (isLoading) {
    console.log('[ChooseRole] showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-border"></div>
          <div className="absolute inset-0 rounded-full border-2 border-slate-700"></div>
        </div>
      </div>
    );
  }

  const handleRoleSelect = async (role: UserRole) => {
    console.log('[ChooseRole] role clicked', { role, actionLoading });
    if (actionLoading || !user) return;

    setSelectedRole(role);
    console.log('[ChooseRole] selectedRole set', role);

    setIsOnboarding(true);
    try {
      console.log('[ChooseRole] calling setRole API', { uid: user.uid, role });
      const token = await user.getIdToken();
      const response = await setRole(user.uid, { role }, token);

      if (response.success && response.redirectUrl) {
        console.log('[ChooseRole] setRole successful, navigating to', response.redirectUrl);
        router.push(response.redirectUrl);
      } else {
        throw new Error(response.message || 'Failed to set role');
      }
    } catch (err: any) {
      console.error('[ChooseRole] setRole error', err);
      setError(err.message || 'Failed to set role. Please try again.');
    } finally {
      setIsOnboarding(false);
    }

    const selectedOption = roleOptions.find(option => option.id === role);
    if (selectedOption) {
      console.log('[ChooseRole] navigating to', selectedOption.redirect);
      router.push(selectedOption.redirect);
    } else {
      console.warn('[ChooseRole] no redirect option found for role', role);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center mb-16 max-w-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6">
            <span className="text-2xl">rocket</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Welcome to Learning.ai
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Choose your path and unlock personalized AI-powered learning experiences
            tailored to your unique goals and learning style.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
          {roleOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleRoleSelect(option.id)}
              className={`
                group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8
                cursor-pointer transition-all duration-500 hover:scale-105 hover:bg-white/10
                ${selectedRole === option.id ? 'ring-2 ring-white/30 bg-white/15' : ''}
                ${actionLoading && selectedRole !== option.id ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {actionLoading && selectedRole === option.id && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent bg-gradient-to-r from-white to-transparent bg-clip-border"></div>
                </div>
              )}

              <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>

              <div className="relative z-10">
                <div className={`
                  inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6
                  bg-gradient-to-r ${option.gradient} group-hover:scale-110 transition-transform duration-300
                `}>
                  <span className="text-2xl">{option.icon}</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  {option.title}
                </h3>

                <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                  {option.description}
                </p>

                <div className="mt-6 flex items-center text-slate-400 group-hover:text-white transition-all duration-300 group-hover:translate-x-2">
                  <span className="text-sm font-medium mr-2">Get Started</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`}></div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm">
            Need help choosing?{' '}
            <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200 underline underline-offset-4">
              Contact our AI assistant
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}