'use client';

import { useRouter } from 'next/navigation';
import { useAuthUser } from '@/lib/hooks';

export default function CorporateOnboardingPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuthUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-border"></div>
          <div className="absolute inset-0 rounded-full border-2 border-slate-700"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-12 px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-6">
            <span className="text-2xl">🏢</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Corporate Setup
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Deploy enterprise-grade AI learning solutions to enhance your workforce capabilities.
          </p>
        </div>

        {/* Onboarding Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Coming Soon</h2>
            <p className="text-slate-300 mb-8">
              We're crafting a sophisticated onboarding experience for corporate learners. 
              This will include workforce assessment, skill gap analysis, and ROI tracking setup.
            </p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                <span>Company profile and workforce assessment</span>
              </div>
              <div className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                <span>Skill gap analysis and learning path creation</span>
              </div>
              <div className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                <span>Employee onboarding and training programs</span>
              </div>
              <div className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                <span>AI coach deployment and customization</span>
              </div>
              <div className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                <span>ROI analytics and performance tracking</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/corporate')}
              className="mt-8 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-medium"
            >
              Skip to Dashboard
            </button>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push('/onboarding/choose-role')}
          className="mt-8 text-slate-400 hover:text-white transition-colors duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to role selection
        </button>
      </div>
    </div>
  );
}