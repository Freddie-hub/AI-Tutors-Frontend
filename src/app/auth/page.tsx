'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { authService, userService } from '@/lib/auth';
import { useAuthUser, useAuthActions, useFormState } from '@/lib/hooks';

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export default function AuthPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuthUser();
  const { withErrorHandling, loading: actionLoading, error, clearError } = useAuthActions();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state management
  const loginForm = useFormState<LoginFormData>({
    email: '',
    password: ''
  });

  const signupForm = useFormState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  // Redirect logic when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      if (!profile) {
        // No profile found, redirect to onboarding
        router.push('/onboarding/choose-role');
        return;
      }

      // Check if user has completed onboarding
      if (profile.onboarded) {
        // Redirect based on role
        switch (profile.role) {
          case 'individual-student':
            router.push('/dashboard/student');
            break;
          case 'institution-admin':
            router.push('/dashboard/institution');
            break;
          case 'corporate-user':
            router.push('/dashboard/corporate');
            break;
          default:
            router.push('/onboarding/choose-role');
        }
      } else {
        // Profile exists but onboarding not complete
        router.push('/onboarding/choose-role');
      }
    }
  }, [user, profile, authLoading, router]);

  // Validation functions
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateSignupForm = (): boolean => {
    let isValid = true;

    // Validate email
    const emailError = validateEmail(signupForm.values.email);
    if (emailError) {
      signupForm.setError('email', emailError);
      isValid = false;
    }

    // Validate display name
    if (!signupForm.values.displayName.trim()) {
      signupForm.setError('displayName', 'Display name is required');
      isValid = false;
    }

    // Validate password
    const passwordError = validatePassword(signupForm.values.password);
    if (passwordError) {
      signupForm.setError('password', passwordError);
      isValid = false;
    }

    // Validate confirm password
    if (signupForm.values.password !== signupForm.values.confirmPassword) {
      signupForm.setError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const validateLoginForm = (): boolean => {
    let isValid = true;

    const emailError = validateEmail(loginForm.values.email);
    if (emailError) {
      loginForm.setError('email', emailError);
      isValid = false;
    }

    const passwordError = validatePassword(loginForm.values.password);
    if (passwordError) {
      loginForm.setError('password', passwordError);
      isValid = false;
    }

    return isValid;
  };

  // Authentication handlers
  const handleGoogleSignIn = async () => {
    clearError();
    const result = await withErrorHandling(async () => {
      return await authService.signInWithGoogle();
    });

    if (result) {
      // Profile creation and redirection will be handled by useEffect
      console.log('Google sign-in successful');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateLoginForm()) return;

    const result = await withErrorHandling(async () => {
      return await authService.signInWithEmail(
        loginForm.values.email,
        loginForm.values.password
      );
    });

    if (result) {
      console.log('Email login successful');
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateSignupForm()) return;

    const result = await withErrorHandling(async () => {
      const userCredential = await authService.createAccountWithEmail(
        signupForm.values.email,
        signupForm.values.password
      );

      // Update display name
      await authService.updateUserProfile({
        displayName: signupForm.values.displayName
      });

      return userCredential;
    });

    if (result) {
      console.log('Email signup successful');
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    clearError();
    loginForm.reset();
    signupForm.reset();
  };

  // Loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Learning.ai
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Learn anything, anytime, anywhere.
          </p>
          <h2 className="text-2xl font-semibold text-gray-800">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isSignup 
              ? 'Start your learning journey today' 
              : 'Sign in to continue your learning'
            }
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={actionLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle className="h-5 w-5 mr-3" />
            {isSignup ? 'Sign up with Google' : 'Sign in with Google'}
          </button>

          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={isSignup ? handleEmailSignup : handleEmailLogin} className="space-y-4">
            {/* Display Name (Signup only) */}
            {isSignup && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={signupForm.values.displayName}
                  onChange={(e) => signupForm.setValue('displayName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    signupForm.errors.displayName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {signupForm.errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{signupForm.errors.displayName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={isSignup ? signupForm.values.email : loginForm.values.email}
                onChange={(e) => {
                  if (isSignup) {
                    signupForm.setValue('email', e.target.value);
                  } else {
                    loginForm.setValue('email', e.target.value);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  (isSignup ? signupForm.errors.email : loginForm.errors.email) ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {(isSignup ? signupForm.errors.email : loginForm.errors.email) && (
                <p className="mt-1 text-sm text-red-600">
                  {isSignup ? signupForm.errors.email : loginForm.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={isSignup ? signupForm.values.password : loginForm.values.password}
                  onChange={(e) => {
                    if (isSignup) {
                      signupForm.setValue('password', e.target.value);
                    } else {
                      loginForm.setValue('password', e.target.value);
                    }
                  }}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    (isSignup ? signupForm.errors.password : loginForm.errors.password) ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400" />
                  ) : (
                    <AiOutlineEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {(isSignup ? signupForm.errors.password : loginForm.errors.password) && (
                <p className="mt-1 text-sm text-red-600">
                  {isSignup ? signupForm.errors.password : loginForm.errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password (Signup only) */}
            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupForm.values.confirmPassword}
                    onChange={(e) => signupForm.setValue('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      signupForm.errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400" />
                    ) : (
                      <AiOutlineEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {signupForm.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{signupForm.errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {actionLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignup ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={toggleAuthMode}
                className="text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:underline"
              >
                {isSignup ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          {/* Forgot Password (Login only) */}
          {!isSignup && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  // TODO: Implement forgot password functionality
                  console.log('Forgot password clicked');
                }}
                className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        {/* Terms and Privacy */}
        <div className="text-center text-sm text-gray-500">
          By continuing, you agree to Learning.ai's{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}