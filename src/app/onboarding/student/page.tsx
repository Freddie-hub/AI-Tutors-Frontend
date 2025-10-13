'use client';

import { useState, useRef, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser, useAuthActions, useFormState } from '@/lib/hooks';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';
import { OnboardingContext } from '@/lib/context/OnboardingContext';
import { onboardIndividualStudent, onboardInstitutionStudent } from '@/lib/api';

type CurriculumType = 'CBC' | 'British' | 'Adaptive';

interface StudentProfile {
  name: string;
  age: string;
  curriculum: CurriculumType | '';
  grade: string;
  goal: string;
  preferredMode: 'AI Autopilot' | '';
  linked_institution?: string;
}

const curriculumOptions = [
  { 
    value: 'CBC' as CurriculumType, 
    label: 'CBC (Competency-Based Curriculum)', 
    description: 'Kenya\'s current curriculum focusing on competency development'
  },
  { 
    value: 'British' as CurriculumType, 
    label: 'British Curriculum', 
    description: 'International curriculum with IGCSE and A-Level pathways'
  },
  { 
    value: 'Adaptive' as CurriculumType, 
    label: 'Adaptive Learning', 
    description: 'AI-powered personalized curriculum that adapts to your pace'
  }
];

const gradeOptions = {
  CBC: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'],
  British: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'],
  Adaptive: ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert']
};

const learningGoalOptions = [
  'Improve my grades and academic performance',
  'Prepare for important exams (KCPE, KCSE, IGCSE, A-Levels)',
  'Learn new skills and explore different subjects',
  'Get personalized tutoring in challenging subjects',
  'Build confidence and study habits',
  'Accelerate my learning beyond grade level',
  'Catch up on missed concepts and topics',
  'Explore career paths and university preparation'
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { user, profile, institution, loading } = useAuthUser();
  const { setError } = useAuthActions();
  const { setIsOnboarding } = useContext(OnboardingContext);
  const { isLoading: guardLoading } = useOnboardingProtection();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSlow, setIsSlow] = useState(false);
  const slowTimerRef = useRef<number | null>(null);

  const isInstitutionStudent = profile?.role === 'institution-student';

  const form = useFormState<StudentProfile>({
    name: '',
    age: '',
    curriculum: '',
    grade: '',
    goal: '',
    preferredMode: isInstitutionStudent ? '' : 'AI Autopilot',
    linked_institution: institution?.name || ''
  });

  if (loading || guardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-border"></div>
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

  const validateStep = (step: number): boolean => {
    form.clearErrors();
    
    switch (step) {
      case 1:
        let isValid = true;
        if (!form.values.name.trim()) {
          form.setError('name', 'Please enter your name');
          isValid = false;
        }
        if (!isInstitutionStudent && (!form.values.age || parseInt(form.values.age) < 5 || parseInt(form.values.age) > 25)) {
          form.setError('age', 'Please enter a valid age between 5 and 25');
          isValid = false;
        }
        return isValid;
      
      case 2:
        if (!form.values.curriculum) {
          form.setError('curriculum', 'Please select a curriculum');
          return false;
        }
        if (!form.values.grade) {
          form.setError('grade', 'Please select your grade/year');
          return false;
        }
        return true;
      
      case 3:
        if (!form.values.goal) {
          form.setError('goal', 'Please select your learning goal');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    console.log('[StudentOnboarding] submit clicked');
    if (!validateStep(3)) return;

    setIsOnboarding(true);
    form.setSubmitting(true);
    if (slowTimerRef.current) {
      clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
    slowTimerRef.current = window.setTimeout(() => {
      console.warn('[StudentOnboarding] API call taking longer than expected (7s)');
      setIsSlow(true);
    }, 7000);

    try {
      console.log('[StudentOnboarding] preparing API call', { uid: user.uid, values: form.values });
      const token = await user.getIdToken();
      let response;

      if (isInstitutionStudent) {
        const payload = {
          name: form.values.name,
          curriculum: form.values.curriculum as CurriculumType,
          grade: form.values.grade,
          goal: form.values.goal
        };
        response = await onboardInstitutionStudent(user.uid, payload, token);
      } else {
        const payload = {
          name: form.values.name,
          age: parseInt(form.values.age),
          curriculum: form.values.curriculum as CurriculumType,
          grade: form.values.grade,
          goal: form.values.goal,
          preferredMode: form.values.preferredMode as 'AI Autopilot'
        };
        response = await onboardIndividualStudent(user.uid, payload, token);
      }

      if (response.success && response.redirectUrl) {
        console.log('[StudentOnboarding] API call successful, navigating to', response.redirectUrl);
        router.push(response.redirectUrl);
      } else {
        throw new Error(response.message || 'Failed to complete onboarding');
      }
    } catch (err: any) {
      console.error('[StudentOnboarding] API call error', err);
      if (err.field && err.message) {
        form.setError(err.field as keyof StudentProfile, err.message);
      } else {
        form.setError('api', err.message || 'Failed to complete onboarding. Please try again.');
      }
    } finally {
      if (slowTimerRef.current) {
        clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
      setIsSlow(false);
      setIsOnboarding(false);
      form.setSubmitting(false);
    }
  };

  const getAvailableGrades = () => {
    if (!form.values.curriculum) return [];
    return gradeOptions[form.values.curriculum as CurriculumType] || [];
  };

  const progressPercentage = isInstitutionStudent ? (currentStep / 2) * 100 : (currentStep / 3) * 100;
  const totalSteps = isInstitutionStudent ? 2 : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center mb-8 max-w-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6">
            <span className="text-2xl">graduation-cap</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Let's set up your learning journey!
          </h1>
          <p className="text-lg text-slate-300">
            Tell us about yourself so we can create the perfect AI-powered learning experience just for you.
          </p>
        </div>

        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-slate-400">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl w-full">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
                <p className="text-slate-300">Let's start with some basic information</p>
              </div>

              {isInstitutionStudent && form.values.linked_institution && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={form.values.linked_institution}
                    disabled
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400"
                  />
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                  What's your name? <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.values.name}
                  onChange={(e) => form.setValue('name', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    form.errors.name ? 'border-red-400' : 'border-white/20'
                  }`}
                  placeholder="Enter your name"
                />
                {form.errors.name && (
                  <p className="mt-1 text-sm text-red-400">{form.errors.name}</p>
                )}
              </div>

              {!isInstitutionStudent && (
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-slate-200 mb-2">
                    How old are you? <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="age"
                    type="number"
                    min="5"
                    max="25"
                    value={form.values.age}
                    onChange={(e) => form.setValue('age', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      form.errors.age ? 'border-red-400' : 'border-white/20'
                    }`}
                    placeholder="Enter your age"
                  />
                  {form.errors.age && (
                    <p className="mt-1 text-sm text-red-400">{form.errors.age}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">Ages 5-25 are supported</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Your academic background</h2>
                <p className="text-slate-300">Help us understand your learning context</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Which curriculum do you follow? <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {curriculumOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        form.setValue('curriculum', option.value);
                        form.setValue('grade', '');
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-blue-400 ${
                        form.values.curriculum === option.value
                          ? 'border-blue-400 bg-blue-500/10'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 mr-3 ${
                          form.values.curriculum === option.value
                            ? 'border-blue-400 bg-blue-400'
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
                {form.errors.curriculum && (
                  <p className="mt-2 text-sm text-red-400">{form.errors.curriculum}</p>
                )}
              </div>

              {form.values.curriculum && (
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-slate-200 mb-2">
                    What's your current grade/year? <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="grade"
                    value={form.values.grade}
                    onChange={(e) => form.setValue('grade', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      form.errors.grade ? 'border-red-400' : 'border-white/20'
                    }`}
                  >
                    <option value="" className="bg-slate-800">Select your grade/year</option>
                    {getAvailableGrades().map((grade) => (
                      <option key={grade} value={grade} className="bg-slate-800">
                        {grade}
                      </option>
                    ))}
                  </select>
                  {form.errors.grade && (
                    <p className="mt-1 text-sm text-red-400">{form.errors.grade}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === totalSteps && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Your learning goals</h2>
                <p className="text-slate-300">Let's personalize your AI learning experience</p>
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
                      className={`p-3 rounded-xl border cursor-pointer transition-all hover:border-blue-400 ${
                        form.values.goal === goal
                          ? 'border-blue-400 bg-blue-500/10'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          form.values.goal === goal
                            ? 'border-blue-400 bg-blue-400'
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

              {!isInstitutionStudent && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Learning Mode
                  </label>
                  <div className="p-4 rounded-xl border border-blue-400 bg-blue-500/10">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-400 bg-blue-400 mr-3"></div>
                      <div>
                        <h3 className="text-white font-medium">AI Autopilot</h3>
                        <p className="text-slate-300 text-sm mt-1">
                          Let our AI create a personalized learning path and adapt to your progress automatically
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    More learning modes coming soon! For now, enjoy the power of AI Autopilot.
                  </p>
                </div>
              )}
            </div>
          )}

          {form.errors.api && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-400/20">
              <p className="text-red-400 text-sm">{form.errors.api}</p>
            </div>
          )}

          {isSlow && !form.errors.api && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/20">
              <p className="text-yellow-300 text-sm">
                This is taking longer than expected. Please check your internet connection or try an incognito window. We'll continue trying in the background.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
            <button
              onClick={currentStep === 1 ? () => router.push('/onboarding/choose-role') : handleBack}
              className="flex items-center text-slate-400 hover:text-white transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {currentStep === 1 ? 'Back to role selection' : 'Previous'}
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-medium flex items-center"
              >
                Continue
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={form.isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-8 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {form.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-transparent bg-gradient-to-r from-white to-transparent bg-clip-border mr-2"></div>
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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