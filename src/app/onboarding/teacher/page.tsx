'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser, useAuthActions, useFormState } from '@/lib/hooks';
import { useOnboarding } from '@/lib/context/OnboardingContext';
import { setTeacherProfile } from '@/lib/api'; // You should implement this API call
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';

type TeacherFormValues = {
  name: string;
  subject: string;
  curriculum: 'CBC' | 'GCSE' | 'Other' | '';
  school: string;
  yearsExperience: string;
  otherCurriculum?: string;
};

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthUser();
  const { setIsLoading } = useOnboarding();
  const { setError: setGlobalError } = useAuthActions();
  const { isLoading: guardLoading } = useOnboardingProtection();

  const form = useFormState<TeacherFormValues>({
    name: '',
    subject: '',
    curriculum: '',
    school: '',
    yearsExperience: '',
    otherCurriculum: '',
  });

  const [step, setStep] = useState(1);
  const [isSlow, setIsSlow] = useState(false);
  const slowTimerRef = useRef<number | null>(null);

  const totalSteps = 2;
  const progress = useMemo(() => Math.round((step / totalSteps) * 100), [step, totalSteps]);

  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

  if (authLoading || guardLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-border" />
      </div>
    );
  }

  const validateStep = (currentStep: number) => {
    form.clearErrors();

    if (currentStep === 1) {
      let valid = true;
      if (!form.values.name.trim()) {
        form.setError('name', 'Please enter your full name');
        valid = false;
      }
      if (!form.values.subject.trim()) {
        form.setError('subject', 'Please enter your subject');
        valid = false;
      }
      if (!form.values.school.trim()) {
        form.setError('school', 'Please enter your school name');
        valid = false;
      }
      return valid;
    }

    if (currentStep === 2) {
      if (!form.values.curriculum) {
        form.setError('curriculum', 'Please select a curriculum');
        return false;
      }
      if (form.values.curriculum === 'Other' && !form.values.otherCurriculum?.trim()) {
        form.setError('otherCurriculum', 'Please specify your curriculum');
        return false;
      }
      if (!form.values.yearsExperience) {
        form.setError('yearsExperience', 'Please enter your years of experience');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleStepChange = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (validateStep(step)) {
        setStep((prev) => Math.min(prev + 1, totalSteps));
      }
    } else {
      setStep((prev) => Math.max(1, prev - 1));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(totalSteps)) {
      return;
    }

    setIsLoading(true);
    form.setSubmitting(true);
    setIsSlow(false);

    if (slowTimerRef.current) {
      clearTimeout(slowTimerRef.current);
    }
    slowTimerRef.current = window.setTimeout(() => {
      setIsSlow(true);
    }, 7000);

    try {
      const response = await setTeacherProfile(user.uid, {
        name: form.values.name.trim(),
        subject: form.values.subject.trim(),
        school: form.values.school.trim(),
        curriculum: form.values.curriculum === 'Other'
          ? (form.values.otherCurriculum || '')
          : form.values.curriculum,
        yearsExperience: form.values.yearsExperience,
      });

      if (!response.success) {
        throw new Error(response.message ?? 'Failed to complete onboarding');
      }

      // Redirect based on selected curriculum
      if (form.values.curriculum === 'CBC') {
        router.replace('/dashboard/teacher/cbc');
      } else if (form.values.curriculum === 'GCSE') {
        router.replace('/dashboard/teacher/gcse');
      } else {
        router.replace('/dashboard/teacher/other');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete onboarding';
      form.setError('api', message);
      setGlobalError(message);
    } finally {
      if (slowTimerRef.current) {
        clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
      setIsSlow(false);
      setIsLoading(false);
      form.setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-2xl font-bold">
            T
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">Welcome, Teacher</h1>
          <p className="text-lg text-slate-300">
            Let’s set up your teaching profile and personalise your AI tools.
          </p>
        </div>

        <div className="mb-8 w-full max-w-2xl">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-700">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white text-center">Basic Information</h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Full Name<span className="text-red-400">*</span>
                </label>
                <input
                  value={form.values.name}
                  onChange={(e) => form.setValue('name', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 ${
                    form.errors.name ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-white/10'
                  }`}
                  placeholder="Enter your full name"
                />
                {form.errors.name && <p className="mt-1 text-sm text-red-400">{form.errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Subject Taught<span className="text-red-400">*</span>
                </label>
                <input
                  value={form.values.subject}
                  onChange={(e) => form.setValue('subject', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 ${
                    form.errors.subject ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-white/10'
                  }`}
                  placeholder="e.g., Mathematics, English, Science"
                />
                {form.errors.subject && <p className="mt-1 text-sm text-red-400">{form.errors.subject}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  School / Institution<span className="text-red-400">*</span>
                </label>
                <input
                  value={form.values.school}
                  onChange={(e) => form.setValue('school', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 ${
                    form.errors.school ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-white/10'
                  }`}
                  placeholder="Enter your school or institution name"
                />
                {form.errors.school && <p className="mt-1 text-sm text-red-400">{form.errors.school}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white text-center">Teaching Details</h2>

              <div>
                <span className="mb-3 block text-sm font-medium text-slate-200">
                  Which curriculum do you teach?<span className="text-red-400">*</span>
                </span>
                <div className="space-y-3">
                  {(['CBC', 'GCSE', 'Other'] as const).map((curriculum) => {
                    const isActive = form.values.curriculum === curriculum;
                    return (
                      <button
                        key={curriculum}
                        type="button"
                        onClick={() => form.setValue('curriculum', curriculum)}
                        className={`w-full rounded-xl border p-4 text-left transition-colors ${
                          isActive
                            ? 'border-blue-400 bg-blue-500/10'
                            : 'border-white/20 bg-white/5 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`mr-3 h-4 w-4 rounded-full border-2 ${
                              isActive ? 'border-blue-400 bg-blue-400' : 'border-white/40'
                            }`}
                          />
                          <span className="text-white">{curriculum}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {form.errors.curriculum && (
                  <p className="mt-2 text-sm text-red-400">{form.errors.curriculum}</p>
                )}
              </div>

              {form.values.curriculum === 'Other' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Specify Curriculum<span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.values.otherCurriculum}
                    onChange={(e) => form.setValue('otherCurriculum', e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 ${
                      form.errors.otherCurriculum
                        ? 'border-red-400 bg-red-500/10'
                        : 'border-white/20 bg-white/10'
                    }`}
                    placeholder="Enter the name of your curriculum"
                  />
                  {form.errors.otherCurriculum && (
                    <p className="mt-1 text-sm text-red-400">{form.errors.otherCurriculum}</p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Years of Teaching Experience<span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.values.yearsExperience}
                  onChange={(e) => form.setValue('yearsExperience', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 ${
                    form.errors.yearsExperience
                      ? 'border-red-400 bg-red-500/10'
                      : 'border-white/20 bg-white/10'
                  }`}
                  placeholder="Enter your years of experience"
                />
                {form.errors.yearsExperience && (
                  <p className="mt-1 text-sm text-red-400">{form.errors.yearsExperience}</p>
                )}
              </div>
            </div>
          )}

          {form.errors.api && (
            <div className="mt-4 rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
              {form.errors.api}
            </div>
          )}

          {isSlow && !form.errors.api && (
            <div className="mt-4 rounded-lg border border-yellow-300/20 bg-yellow-500/10 p-3 text-sm text-yellow-200">
              This is taking longer than expected. Please hold on while we finish setting things up.
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => (step === 1 ? router.push('/onboarding/choose-role') : handleStepChange('prev'))}
              className="flex items-center text-sm text-slate-400 transition-colors hover:text-white"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {step === 1 ? 'Back to role selection' : 'Previous'}
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => handleStepChange('next')}
                className="flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-white transition hover:from-blue-600 hover:to-cyan-600"
              >
                Continue
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                disabled={form.isSubmitting}
                onClick={handleSubmit}
                className="flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-3 text-white transition hover:from-blue-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {form.isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-white to-transparent bg-clip-border" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete setup
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
