'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { createInstitution } from '@/lib/api';
import { useAuthActions, useAuthUser, useFormState } from '@/lib/hooks';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';
import { useOnboarding } from '@/lib/context/OnboardingContext';
import type { InstitutionAdminOnboardingData } from '@/lib/types';

type InstitutionFormValues = {
  name: string;
  type: InstitutionAdminOnboardingData['type'] | '';
  region: string;
  numberOfStudents: string;
};

const INSTITUTION_TYPES: { value: InstitutionAdminOnboardingData['type']; label: string; description: string }[] = [
  { value: 'university', label: 'University', description: 'Higher education institutions offering degree programmes.' },
  { value: 'school', label: 'School', description: 'Primary and secondary schools.' },
  { value: 'college', label: 'College', description: 'Diploma and certificate awarding colleges.' },
  { value: 'training_center', label: 'Training Centre', description: 'Vocational and technical training centres.' },
  { value: 'ngo', label: 'NGO', description: 'Non-governmental organisations focused on education and training.' },
];

const KENYAN_REGIONS = ['Nairobi', 'Central', 'Coast', 'Eastern', 'North Eastern', 'Nyanza', 'Rift Valley', 'Western'];

const BENEFITS = [
  { icon: '👥', title: 'Manage students', description: 'Enrol learners, track progress, and manage classes from one dashboard.' },
  { icon: '📊', title: 'Actionable analytics', description: 'Spot learning gaps early with real-time performance insights.' },
  { icon: '📚', title: 'Generate lessons', description: 'Create AI-powered lessons aligned to your curriculum in minutes.' },
  { icon: '🤖', title: 'AI teaching assistant', description: 'Deploy 24/7 virtual tutors that support your students in every subject.' },
  { icon: '🌍', title: 'Curriculum alignment', description: 'Support CBC, British, or create adaptive learning paths for diverse needs.' },
  { icon: '🛠️', title: 'Reduce admin overhead', description: 'Automate reporting, parent updates, and compliance paperwork.' },
];

export default function InstitutionOnboardingPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuthUser();
  const { isLoading: guardLoading } = useOnboardingProtection();
  const { loading: actionLoading, setError } = useAuthActions();
  const { setIsLoading } = useOnboarding();

  const form = useFormState<InstitutionFormValues>({ name: '', type: '', region: '', numberOfStudents: '' });

  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

  if (authLoading || guardLoading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-border" />
          <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
        </div>
      </div>
    );
  }

  const validate = () => {
    form.clearErrors();
    let valid = true;

    if (!form.values.name.trim()) {
      form.setError('name', 'Institution name is required');
      valid = false;
    }
    if (!form.values.type) {
      form.setError('type', 'Select an institution type');
      valid = false;
    }
    if (!form.values.region) {
      form.setError('region', 'Select your region');
      valid = false;
    }

    if (form.values.numberOfStudents) {
      const parsed = Number(form.values.numberOfStudents);
      if (!Number.isFinite(parsed) || parsed < 1) {
        form.setError('numberOfStudents', 'Enter a positive number');
        valid = false;
      }
    }

    return valid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await createInstitution({
        name: form.values.name.trim(),
        type: form.values.type as InstitutionAdminOnboardingData['type'],
        region: form.values.region,
        numberOfStudents: form.values.numberOfStudents ? Number(form.values.numberOfStudents) : undefined,
      });

      if (!response.success) {
        throw new Error(response.message ?? 'Failed to complete onboarding');
      }

      router.replace(response.redirectUrl ?? '/dashboard/institution');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create institution. Please try again.';
      setError(message);
      form.setError('api', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <aside className="relative hidden w-1/2 overflow-hidden lg:flex">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="mb-8">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-2xl">
              🏫
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white">Empower your institution with AI</h1>
            <p className="text-xl text-slate-300">
              Transform teaching and learning with personalised AI tutors, real-time analytics, and automated content generation.
            </p>
          </div>
          <div className="space-y-6">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="flex items-start space-x-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-xl">{benefit.icon}</div>
                <div>
                  <h3 className="text-white font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-slate-300">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
            Join leading institutions using Learning.ai to boost learner outcomes and reduce administrative workload.
          </div>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-2xl">
              🏫
            </div>
            <h1 className="text-3xl font-bold text-white">Institution setup</h1>
            <p className="text-slate-300">Configure your AI learning environment</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="mb-2 hidden text-center text-2xl font-bold text-white lg:block">Institution registration</h2>
            <p className="mb-6 hidden text-center text-slate-300 lg:block">Tell us a little about your organisation.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                  Institution name<span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  value={form.values.name}
                  onChange={(event) => form.setValue('name', event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    form.errors.name ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-white/10'
                  }`}
                  placeholder="Enter institution name"
                />
                {form.errors.name && <p className="mt-1 text-sm text-red-400">{form.errors.name}</p>}
              </div>

              <div>
                <span className="mb-3 block text-sm font-medium text-slate-200">
                  Institution type<span className="text-red-400">*</span>
                </span>
                <div className="space-y-3">
                  {INSTITUTION_TYPES.map((option) => {
                    const isActive = form.values.type === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => form.setValue('type', option.value)}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          isActive ? 'border-purple-400 bg-purple-500/10' : 'border-white/20 bg-white/5 hover:border-purple-400'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`mr-3 mt-1 h-4 w-4 rounded-full border-2 ${
                            isActive ? 'border-purple-400 bg-purple-400' : 'border-white/40'
                          }`} />
                          <div>
                            <h3 className="text-white font-medium">{option.label}</h3>
                            <p className="text-sm text-slate-300">{option.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {form.errors.type && <p className="mt-2 text-sm text-red-400">{form.errors.type}</p>}
              </div>

              <div>
                <label htmlFor="region" className="mb-2 block text-sm font-medium text-slate-200">
                  Region<span className="text-red-400">*</span>
                </label>
                <select
                  id="region"
                  value={form.values.region}
                  onChange={(event) => form.setValue('region', event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    form.errors.region ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-white/10'
                  }`}
                >
                  <option value="" className="bg-slate-900">Select your region</option>
                  {KENYAN_REGIONS.map((region) => (
                    <option key={region} value={region} className="bg-slate-900">
                      {region}
                    </option>
                  ))}
                </select>
                {form.errors.region && <p className="mt-1 text-sm text-red-400">{form.errors.region}</p>}
              </div>

              <div>
                <label htmlFor="students" className="mb-2 block text-sm font-medium text-slate-200">
                  Number of students<span className="text-slate-400"> (optional)</span>
                </label>
                <input
                  id="students"
                  type="number"
                  min={1}
                  value={form.values.numberOfStudents}
                  onChange={(event) => form.setValue('numberOfStudents', event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    form.errors.numberOfStudents ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-white/10'
                  }`}
                  placeholder="Approximate number of learners"
                />
                {form.errors.numberOfStudents && (
                  <p className="mt-1 text-sm text-red-400">{form.errors.numberOfStudents}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">Helps us recommend the best onboarding plan for you.</p>
              </div>

              {form.errors.api && (
                <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                  {form.errors.api}
                </div>
              )}

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-white transition hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-white to-transparent bg-clip-border" />
                    Setting up institution…
                  </div>
                ) : (
                  'Complete institution setup'
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => router.push('/onboarding/choose-role')}
              className="mt-4 flex w-full items-center justify-center text-sm text-slate-400 transition hover:text-white"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to role selection
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}