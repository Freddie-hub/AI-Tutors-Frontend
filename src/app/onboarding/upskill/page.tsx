'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { onboardUpskillIndividual } from '@/lib/api';
import { useAuthActions, useAuthUser } from '@/lib/hooks';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';
import { useOnboarding } from '@/lib/context/OnboardingContext';
import BackToRoleSelection from '@/components/onboarding/BackToRoleSelection';

const QUICK_GUIDE_ITEMS = [
  'Explore diverse learning paths tailored to your goals',
  'Prepare for your exams with AI-powered study plans',
  'Learn about technology, business, and emerging trends',
  'Master money management and financial literacy',
  'Learn about anything that interests you',
  'Use our immersive classroom enhanced with AI',
  'Track your progress with real-time analytics',
  'Get personalized recommendations based on your pace',
];

export default function UpskillOnboardingPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuthUser();
  const { isLoading: guardLoading } = useOnboardingProtection();
  const { loading: actionLoading, setError } = useAuthActions();
  const { setIsLoading } = useOnboarding();

  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

  if (authLoading || guardLoading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      const response = await onboardUpskillIndividual(user.uid, {
        name: profile.displayName || user.displayName || 'User',
        goal: 'Upskill and grow professionally',
        preferredSkills: [],
        experienceLevel: 'intermediate',
      });

      if (!response.success) {
        throw new Error(response.message ?? 'Failed to complete onboarding');
      }

      router.replace(response.redirectUrl ?? '/dashboard/upskill');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-between bg-white px-8 lg:px-16 py-8">
      {/* Left Section - Content */}
      <div className="w-full max-w-2xl">
        
        <p className="text-lg text-gray-600 mb-10">
          Accelerate your career with AI-powered learning tools designed for professionals and lifelong learners.
        </p>

        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What you can do:
          </h2>
          <ul className="space-y-3">
            {QUICK_GUIDE_ITEMS.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-500 font-bold mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleGetStarted}
          disabled={actionLoading}
          className={`
            px-8 py-3 rounded-lg font-medium text-white transition-all duration-200
            flex items-center gap-2
            ${
              actionLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-900 hover:bg-indigo-800'
            }
          `}
        >
          {actionLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Preparing your upskill dashboard…
            </>
          ) : (
            <>
              Get Started
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </>
          )}
        </button>

        <div className="mt-6">
          <BackToRoleSelection />
        </div>
      </div>

      {/* Right Section - Illustration */}
      <div className="hidden lg:flex items-center justify-center w-full max-w-xl">
        <img
          src="/upskill quick guide.svg"
          alt="Upskill learning illustration"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}