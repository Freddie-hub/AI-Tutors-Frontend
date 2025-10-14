'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser, useAuthActions, useFormState } from '@/lib/hooks';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';
import { OnboardingContext } from '@/lib/context/OnboardingContext';
import { onboardUpskillIndividual } from '../../../lib/api';

interface UpskillProfile {
  name: string;
  goal: string;
  preferredSkills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | '';
}

const learningGoalOptions = [
  'Advance my career with new skills',
  'Switch to a new industry or role',
  'Enhance my current job performance',
  'Learn skills for personal growth',
  'Prepare for certifications or exams',
  'Explore new technologies or tools',
  'Improve leadership and management skills',
  'Build a foundation in a new field'
];

const skillOptions = [
  'Programming',
  'Data Analysis',
  'Graphic Design',
  'Project Management',
  'Web Development',
  'Machine Learning',
  'Digital Marketing',
  'Cybersecurity'
];

const experienceLevels = [
  { value: 'beginner' as const, label: 'Beginner', description: 'New to the field, starting from scratch' },
  { value: 'intermediate' as const, label: 'Intermediate', description: 'Some experience, looking to deepen skills' },
  { value: 'advanced' as const, label: 'Advanced', description: 'Experienced, seeking to master advanced concepts' }
];

export default function UpskillOnboardingPage() {
  const router = useRouter();
  const { profile, loading } = useAuthUser();
  const { setError, loading: actionLoading } = useAuthActions();
  const { setIsOnboarding } = useContext(OnboardingContext);
  const { isLoading: guardLoading } = useOnboardingProtection();

  const form = useFormState<UpskillProfile>({
    name: '',
    goal: '',
    preferredSkills: [],
    experienceLevel: ''
  });

  if (loading || guardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-border"></div>
          <div className="absolute inset-0 rounded-full border-2 border-slate-700"></div>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users efficiently (only in an effect)
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, user, router]);

  if (!user) return null;

  const validateForm = (): boolean => {
    form.clearErrors();
    let isValid = true;

    if (!form.values.name.trim()) {
      form.setError('name', 'Name is required');
      isValid = false;
    }

    if (!form.values.goal) {
      form.setError('goal', 'Please select your learning goal');
      isValid = false;
    }

    if (form.values.preferredSkills.length === 0) {
      form.setError('preferredSkills', 'Please select at least one skill');
      isValid = false;
    }

    if (!form.values.experienceLevel) {
      form.setError('experienceLevel', 'Please select your experience level');
      isValid = false;
    }

    return isValid;
  };

  const handleSkillToggle = (skill: string) => {
    const currentSkills = form.values.preferredSkills;
    if (currentSkills.includes(skill)) {
      form.setValue('preferredSkills', currentSkills.filter(s => s !== skill));
    } else {
      form.setValue('preferredSkills', [...currentSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsOnboarding(true);
    try {
      const payload = {
        name: form.values.name.trim(),
        goal: form.values.goal,
        preferredSkills: form.values.preferredSkills,
        experienceLevel: form.values.experienceLevel as 'beginner' | 'intermediate' | 'advanced'
      };

      console.log('[UpskillOnboarding] calling onboardUpskillIndividual API', { payload });
  const response = await onboardUpskillIndividual(payload, profile.uid);

      if (response.success && response.redirectUrl) {
        console.log('[UpskillOnboarding] API call successful, navigating to', response.redirectUrl);
        router.push(response.redirectUrl);
      } else {
        throw new Error(response.message || 'Failed to complete onboarding');
      }
    } catch (err: any) {
      console.error('[UpskillOnboarding] API call error', err);
      if (err.field && err.message) {
        form.setError(err.field as keyof UpskillProfile, err.message);
      } else {
        form.setError('api', err.message || 'Failed to complete onboarding. Please try again.');
      }
    } finally {
      setIsOnboarding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center mb-16 max-w-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl mb-6">
            <span className="text-2xl">light-bulb</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Upskill Setup
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Let's tailor your AI-powered learning experience to boost your professional or personal growth.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Your Learning Profile</h2>
            <p className="text-slate-300">Tell us about your goals and skills</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                Your Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={form.values.name}
                onChange={(e) => form.setValue('name', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                  form.errors.name ? 'border-red-400' : 'border-white/20'
                }`}
                placeholder="Enter your name"
              />
              {form.errors.name && (
                <p className="mt-1 text-sm text-red-400">{form.errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">
                What's your main learning goal? <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {learningGoalOptions.map((goal) => (
                  <div
                    key={goal}
                    onClick={() => form.setValue('goal', goal)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:border-indigo-400 ${
                      form.values.goal === goal
                        ? 'border-indigo-400 bg-indigo-500/10'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        form.values.goal === goal
                          ? 'border-indigo-400 bg-indigo-400'
                          : 'border-white/40'
                      }`}></div>
                      <span className="text-white text-sm">{goal}</span>
                    </div>
                  </div>
                ))}
              </div>
              {form.errors.goal && (
                <p className="mt-2 text-sm text-red-400">{form.errors.goal}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">
                Which skills do you want to learn? <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {skillOptions.map((skill) => (
                  <div
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:border-indigo-400 ${
                      form.values.preferredSkills.includes(skill)
                        ? 'border-indigo-400 bg-indigo-500/10'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        form.values.preferredSkills.includes(skill)
                          ? 'border-indigo-400 bg-indigo-400'
                          : 'border-white/40'
                      }`}></div>
                      <span className="text-white text-sm">{skill}</span>
                    </div>
                  </div>
                ))}
              </div>
              {form.errors.preferredSkills && (
                <p className="mt-2 text-sm text-red-400">{form.errors.preferredSkills}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">
                What's your experience level? <span className="text-red-400">*</span>
              </label>
              <div className="space-y-3">
                {experienceLevels.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => form.setValue('experienceLevel', option.value)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-indigo-400 ${
                      form.values.experienceLevel === option.value
                        ? 'border-indigo-400 bg-indigo-500/10'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`w-4 h-4 rounded-full border-2 mt-1 mr-3 ${
                        form.values.experienceLevel === option.value
                          ? 'border-indigo-400 bg-indigo-400'
                          : 'border-white/40'
                      }`}></div>
                      <div>
                        <h3 className="text-white font-medium">{option.label}</h3>
                        <p className="text-slate-300 text-sm mt-1">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {form.errors.experienceLevel && (
                <p className="mt-2 text-sm text-red-400">{form.errors.experienceLevel}</p>
              )}
            </div>

            {form.errors.api && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-400/20">
                <p className="text-red-400 text-sm">{form.errors.api}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-transparent bg-gradient-to-r from-white to-transparent bg-clip-border mr-2"></div>
                  Setting up...
                </div>
              ) : (
                'Complete Upskill Setup'
              )}
            </button>
          </form>

          <button
            onClick={() => router.push('/onboarding/choose-role')}
            className="w-full mt-4 text-slate-400 hover:text-white transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to role selection
          </button>
        </div>
      </div>
    </div>
  );
}