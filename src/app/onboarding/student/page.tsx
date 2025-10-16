'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { onboardIndividualStudent, onboardInstitutionStudent } from '@/lib/api';
import { useAuthActions, useAuthUser, useFormState } from '@/lib/hooks';
import { useOnboarding } from '@/lib/context/OnboardingContext';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';
import type { CurriculumType } from '@/lib/types';

type StudentFormValues = {
  name: string;
  age: string;
  curriculum: CurriculumType | '';
  grade: string;
  goal: string;
  preferredMode: 'AI Autopilot' | '';
  linkedInstitution?: string;
};

const CURRICULA: { value: CurriculumType; label: string; description: string }[] = [
  {
    value: 'CBC',
    label: 'CBC (Competency-Based Curriculum)',
    description: "Kenya's current curriculum focusing on competency development",
  },
  {
    value: 'British',
    label: 'British Curriculum',
    description: 'International curriculum with IGCSE and A-Level pathways',
  },
  {
    value: 'Adaptive',
    label: 'Adaptive Learning',
    description: 'AI-powered personalised curriculum that adapts to your pace',
  },
];

const GRADE_BY_CURRICULUM: Record<CurriculumType, string[]> = {
  CBC: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'],
  British: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'],
  Adaptive: ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'],
};

const LEARNING_GOALS = [
  'Improve my grades and academic performance',
  'Prepare for important exams (KCPE, KCSE, IGCSE, A-Levels)',
  'Learn new skills and explore different subjects',
  'Get personalised tutoring in challenging subjects',
  'Build confidence and study habits',
  'Accelerate my learning beyond grade level',
  'Catch up on missed concepts and topics',
  'Explore career paths and university preparation',
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { user, profile, institution, loading: authLoading } = useAuthUser();
  const { setIsLoading } = useOnboarding();
  const { setError: setGlobalError } = useAuthActions();
  // Redirect away if already onboarded, and gate unauthenticated
  const { isLoading: guardLoading } = useOnboardingProtection();

  const isInstitutionStudent = profile?.role === 'institution-student';

  const form = useFormState<StudentFormValues>({
    name: '',
    age: '',
    curriculum: '',
    grade: '',
    goal: '',
    preferredMode: isInstitutionStudent ? '' : 'AI Autopilot',
    linkedInstitution: institution?.name ?? '',
  });

  const [step, setStep] = useState(1);
  const [isSlow, setIsSlow] = useState(false);
  const slowTimerRef = useRef<number | null>(null);

  const totalSteps = isInstitutionStudent ? 2 : 3;
  const progress = useMemo(() => Math.round((step / totalSteps) * 100), [step, totalSteps]);

  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

  if (authLoading || guardLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-border" />
          <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
        </div>
      </div>
    );
  }

  const availableGrades = form.values.curriculum ? GRADE_BY_CURRICULUM[form.values.curriculum] ?? [] : [];

  const validateStep = (currentStep: number) => {
    form.clearErrors();

    if (currentStep === 1) {
      let valid = true;
      if (!form.values.name.trim()) {
        form.setError('name', 'Please enter your name');
        valid = false;
      }
      if (!isInstitutionStudent) {
        const age = Number(form.values.age);
        if (!Number.isInteger(age) || age < 5 || age > 25) {
          form.setError('age', 'Enter an age between 5 and 25');
          valid = false;
        }
      }
      return valid;
    }

    if (currentStep === 2) {
      if (!form.values.curriculum) {
        form.setError('curriculum', 'Select your curriculum');
        return false;
      }
      if (!form.values.grade) {
        form.setError('grade', 'Select your grade or level');
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (!form.values.goal) {
        form.setError('goal', 'Select a learning goal');
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
      let response;
      if (isInstitutionStudent) {
        response = await onboardInstitutionStudent(user.uid, {
          name: form.values.name.trim(),
          curriculum: form.values.curriculum as CurriculumType,
          grade: form.values.grade,
          goal: form.values.goal,
        });
      } else {
        response = await onboardIndividualStudent(user.uid, {
          name: form.values.name.trim(),
          age: Number(form.values.age),
          curriculum: form.values.curriculum as CurriculumType,
          grade: form.values.grade,
          goal: form.values.goal,
          preferredMode: 'AI Autopilot',
        });
      }

      if (!response.success) {
        throw new Error(response.message ?? 'Failed to complete onboarding');
      }

      if (response.redirectUrl) {
        router.replace(response.redirectUrl);
      } else {
        router.replace('/dashboard/student');
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
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-2xl">
            🎓
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white tracking-tight">Let’s set up your learning journey!</h1>
          <p className="text-lg text-slate-300">
            Tell us about yourself so we can personalise your AI-powered learning experience.
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
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Tell us about yourself</h2>
                <p className="text-slate-300">We’ll start with the basics</p>
              </div>

              {isInstitutionStudent && form.values.linkedInstitution && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Institution</label>
                  <input
                    value={form.values.linkedInstitution}
                    disabled
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white"
                  />
                </div>
              )}

              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                  Your name<span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  value={form.values.name}
                  onChange={(event) => form.setValue('name', event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    form.errors.name ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-white/10'
                  }`}
                  placeholder="Enter your name"
                />
                {form.errors.name && <p className="mt-1 text-sm text-red-400">{form.errors.name}</p>}
              </div>

              {!isInstitutionStudent && (
                <div>
                  <label htmlFor="age" className="mb-2 block text-sm font-medium text-slate-200">
                    Your age<span className="text-red-400">*</span>
                  </label>
                  <input
                    id="age"
                    type="number"
                    min={5}
                    max={25}
                    value={form.values.age}
                    onChange={(event) => form.setValue('age', event.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      form.errors.age ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-white/10'
                    }`}
                    placeholder="Enter your age"
                  />
                  {form.errors.age && <p className="mt-1 text-sm text-red-400">{form.errors.age}</p>}
                  <p className="mt-1 text-xs text-slate-400">We currently support learners aged 5-25</p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Your academic background</h2>
                <p className="text-slate-300">Help us understand your current learning context</p>
              </div>

              <div>
                <span className="mb-3 block text-sm font-medium text-slate-200">
                  Which curriculum do you follow?<span className="text-red-400">*</span>
                </span>
                <div className="space-y-3">
                  {CURRICULA.map((curriculum) => {
                    const isActive = form.values.curriculum === curriculum.value;
                    return (
                      <button
                        key={curriculum.value}
                        type="button"
                        onClick={() => {
                          form.setValue('curriculum', curriculum.value);
                          form.setValue('grade', '');
                        }}
                        className={`w-full rounded-xl border p-4 text-left transition-colors ${
                          isActive
                            ? 'border-blue-400 bg-blue-500/10'
                            : 'border-white/20 bg-white/5 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`mr-3 mt-1 h-4 w-4 rounded-full border-2 ${
                            isActive ? 'border-blue-400 bg-blue-400' : 'border-white/40'
                          }`} />
                          <div>
                            <h3 className="text-white font-medium">{curriculum.label}</h3>
                            <p className="text-sm text-slate-300">{curriculum.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {form.errors.curriculum && <p className="mt-2 text-sm text-red-400">{form.errors.curriculum}</p>}
              </div>

              {form.values.curriculum && (
                <div>
                  <label htmlFor="grade" className="mb-2 block text-sm font-medium text-slate-200">
                    Your grade or level<span className="text-red-400">*</span>
                  </label>
                  <select
                    id="grade"
                    value={form.values.grade}
                    onChange={(event) => form.setValue('grade', event.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      form.errors.grade ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-white/10'
                    }`}
                  >
                    <option value="" className="bg-slate-900">
                      Select your grade or level
                    </option>
                    {availableGrades.map((grade) => (
                      <option key={grade} value={grade} className="bg-slate-900">
                        {grade}
                      </option>
                    ))}
                  </select>
                  {form.errors.grade && <p className="mt-1 text-sm text-red-400">{form.errors.grade}</p>}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Your learning goals</h2>
                <p className="text-slate-300">We’ll tailor your experience based on your goals</p>
              </div>

              <div>
                <span className="mb-3 block text-sm font-medium text-slate-200">
                  What’s your main learning goal?<span className="text-red-400">*</span>
                </span>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {LEARNING_GOALS.map((goal) => {
                    const isActive = form.values.goal === goal;
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => form.setValue('goal', goal)}
                        className={`w-full rounded-xl border p-3 text-left transition-colors ${
                          isActive
                            ? 'border-blue-400 bg-blue-500/10'
                            : 'border-white/20 bg-white/5 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`mr-3 h-4 w-4 rounded-full border-2 ${
                            isActive ? 'border-blue-400 bg-blue-400' : 'border-white/40'
                          }`} />
                          <span className="text-sm text-white">{goal}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {form.errors.goal && <p className="mt-2 text-sm text-red-400">{form.errors.goal}</p>}
              </div>

              {!isInstitutionStudent && (
                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-200">Learning mode</label>
                  <div className="rounded-xl border border-blue-400 bg-blue-500/10 p-4">
                    <div className="flex items-start">
                      <div className="mr-3 h-4 w-4 rounded-full border-2 border-blue-400 bg-blue-400" />
                      <div>
                        <h3 className="text-white font-medium">AI Autopilot</h3>
                        <p className="text-sm text-slate-300">
                          Let our AI create a personalised learning path and adapt to your progress automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">More learning modes are coming soon!</p>
                </div>
              )}
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
                    Setting up…
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