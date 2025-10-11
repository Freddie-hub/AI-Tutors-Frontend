'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser, useAuthActions, useFormState } from '@/lib/hooks';
import { userService, institutionService } from '@/lib/auth';

type InstitutionType = 'School' | 'NGO';

interface InstitutionFormData {
  name: string;
  type: InstitutionType | '';
  region: string;
  numberOfStudents: string;
}

const institutionTypes = [
  { 
    value: 'School' as InstitutionType, 
    label: 'School', 
    description: 'Primary schools, secondary schools, colleges, and universities'
  },
  { 
    value: 'NGO' as InstitutionType, 
    label: 'NGO', 
    description: 'Non-governmental organizations focused on education and training'
  }
];

const kenyanRegions = [
  'Nairobi', 'Central', 'Coast', 'Eastern', 'North Eastern', 
  'Nyanza', 'Rift Valley', 'Western'
];

const benefits = [
  {
    icon: '👥',
    title: 'Manage Students',
    description: 'Easily enroll students, track their progress, and manage class assignments with our intuitive dashboard.'
  },
  {
    icon: '📊',
    title: 'Track Progress',
    description: 'Get detailed analytics on student performance, learning patterns, and areas that need attention.'
  },
  {
    icon: '🎓',
    title: 'Generate Lessons',
    description: 'Create AI-powered lessons tailored to your curriculum and student needs in minutes, not hours.'
  },
  {
    icon: '🤖',
    title: 'AI Teaching Assistant',
    description: 'Deploy virtual tutors that provide 24/7 support to your students across all subjects.'
  },
  {
    icon: '📈',
    title: 'Performance Analytics',
    description: 'Monitor institutional performance with comprehensive reports and insights for better decision making.'
  },
  {
    icon: '🌍',
    title: 'Curriculum Alignment',
    description: 'Seamlessly align with CBC, British, or create adaptive learning paths for diverse student needs.'
  }
];

export default function InstitutionOnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const { withErrorHandling, loading: actionLoading, error } = useAuthActions();
  
  const form = useFormState<InstitutionFormData>({
    name: '',
    type: '',
    region: '',
    numberOfStudents: ''
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-border"></div>
          <div className="absolute inset-0 rounded-full border-2 border-slate-700"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  const validateForm = (): boolean => {
    form.clearErrors();
    let isValid = true;

    if (!form.values.name.trim()) {
      form.setError('name', 'Institution name is required');
      isValid = false;
    }

    if (!form.values.type) {
      form.setError('type', 'Please select institution type');
      isValid = false;
    }

    if (!form.values.region) {
      form.setError('region', 'Please select your region');
      isValid = false;
    }

    if (form.values.numberOfStudents && 
        (isNaN(Number(form.values.numberOfStudents)) || Number(form.values.numberOfStudents) < 1)) {
      form.setError('numberOfStudents', 'Please enter a valid number of students');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await withErrorHandling(async () => {
      // Extract email domain for institution domain
      const emailDomain = user.email?.split('@')[1] || '';
      
      // Create institution document
      const institutionData = {
        name: form.values.name.trim(),
        type: form.values.type as 'university' | 'school' | 'college' | 'training_center',
        domain: emailDomain,
        adminEmails: [user.email!],
        isActive: true,
        region: form.values.region,
        numberOfStudents: form.values.numberOfStudents ? Number(form.values.numberOfStudents) : undefined,
        settings: {
          allowSelfRegistration: true,
          requireEmailVerification: false
        }
      };

      const institutionId = await institutionService.createInstitution(institutionData);

      // Update user profile
      await userService.updateUserProfile(user.uid, {
        role: 'institution-admin',
        institutionId: institutionId,
        isIndependent: false,
        onboarded: true
      });

      // Redirect to institution dashboard
      router.push('/dashboard/institution');
    });

    if (!result) {
      console.error('Failed to complete institution onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left Side Panel - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6">
              <span className="text-2xl">🏫</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Empower Your Institution with AI
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Transform education with personalized AI tutors, comprehensive analytics, 
              and automated lesson generation.
            </p>
          </div>

          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.title}
                className="flex items-start space-x-4 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                  <span className="text-xl">{benefit.icon}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <h3 className="text-white font-semibold mb-2">Trusted by Educational Leaders</h3>
            <p className="text-slate-300 text-sm">
              Join forward-thinking institutions already using Learning.ai to enhance 
              student outcomes and reduce teacher workload.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
              <span className="text-2xl">🏫</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Institution Setup</h1>
            <p className="text-slate-300">Configure your institution's AI learning environment</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="hidden lg:block text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Institution Registration</h2>
              <p className="text-slate-300">Let's set up your educational institution</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Institution Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                  Institution Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.values.name}
                  onChange={(e) => form.setValue('name', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    form.errors.name ? 'border-red-400' : 'border-white/20'
                  }`}
                  placeholder="Enter your institution name"
                />
                {form.errors.name && (
                  <p className="mt-1 text-sm text-red-400">{form.errors.name}</p>
                )}
              </div>

              {/* Institution Type */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Institution Type <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {institutionTypes.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => form.setValue('type', option.value)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-purple-400 ${
                        form.values.type === option.value
                          ? 'border-purple-400 bg-purple-500/10'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 mr-3 ${
                          form.values.type === option.value
                            ? 'border-purple-400 bg-purple-400'
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
                {form.errors.type && (
                  <p className="mt-2 text-sm text-red-400">{form.errors.type}</p>
                )}
              </div>

              {/* Region */}
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-slate-200 mb-2">
                  Region <span className="text-red-400">*</span>
                </label>
                <select
                  id="region"
                  value={form.values.region}
                  onChange={(e) => form.setValue('region', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    form.errors.region ? 'border-red-400' : 'border-white/20'
                  }`}
                >
                  <option value="" className="bg-slate-800">Select your region</option>
                  {kenyanRegions.map((region) => (
                    <option key={region} value={region} className="bg-slate-800">
                      {region}
                    </option>
                  ))}
                </select>
                {form.errors.region && (
                  <p className="mt-1 text-sm text-red-400">{form.errors.region}</p>
                )}
              </div>

              {/* Number of Students */}
              <div>
                <label htmlFor="numberOfStudents" className="block text-sm font-medium text-slate-200 mb-2">
                  Number of Students <span className="text-slate-400">(Optional)</span>
                </label>
                <input
                  id="numberOfStudents"
                  type="number"
                  min="1"
                  value={form.values.numberOfStudents}
                  onChange={(e) => form.setValue('numberOfStudents', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    form.errors.numberOfStudents ? 'border-red-400' : 'border-white/20'
                  }`}
                  placeholder="Approximate number of students"
                />
                {form.errors.numberOfStudents && (
                  <p className="mt-1 text-sm text-red-400">{form.errors.numberOfStudents}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  This helps us recommend the right plan for your institution
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-400/20">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-transparent bg-gradient-to-r from-white to-transparent bg-clip-border mr-2"></div>
                    Setting up institution...
                  </div>
                ) : (
                  'Complete Institution Setup'
                )}
              </button>
            </form>

            {/* Back Button */}
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
    </div>
  );
}