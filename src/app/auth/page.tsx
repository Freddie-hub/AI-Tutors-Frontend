'use client';

import { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import { useFormState } from '@/lib/hooks';
import { loginWithEmail, signupWithEmail } from '@/lib/api';
import { useAuthPageRedirect } from '@/hooks/useRoleRedirect';

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
  const { isLoading: redirectLoading } = useAuthPageRedirect();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useFormState<LoginFormData>({ email: '', password: '' });
  const signupForm = useFormState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

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

    const emailError = validateEmail(signupForm.values.email);
    if (emailError) {
      signupForm.setError('email', emailError);
      isValid = false;
    }

    if (!signupForm.values.displayName.trim()) {
      signupForm.setError('displayName', 'Display name is required');
      isValid = false;
    }

    const passwordError = validatePassword(signupForm.values.password);
    if (passwordError) {
      signupForm.setError('password', passwordError);
      isValid = false;
    }

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const res = await loginWithEmail(loginForm.values.email, loginForm.values.password);
      if (!res.success) throw new Error(res.message || 'Login failed');
      router.push(res.redirectUrl || '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateSignupForm()) return;

    setLoading(true);
    try {
      const res = await signupWithEmail(
        signupForm.values.email,
        signupForm.values.password,
        signupForm.values.displayName
      );
      if (!res.success) throw new Error(res.message || 'Signup failed');
      router.push(res.redirectUrl || '/dashboard'); // auto-login redirect
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setError(null);
    loginForm.reset();
    signupForm.reset();
  };

  if (redirectLoading) {
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
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning.ai</h1>
          <p className="text-lg text-gray-600 mb-8">Learn anything, anytime, anywhere.</p>
          <h2 className="text-2xl font-semibold text-gray-800">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="mt-2 text-gray-600">{isSignup ? 'Start your learning journey today' : 'Sign in to continue your learning'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={isSignup ? handleEmailSignup : handleEmailLogin} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={signupForm.values.displayName}
                  onChange={(e) => signupForm.setValue('displayName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${signupForm.errors.displayName ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Enter your full name"
                />
                {signupForm.errors.displayName && <p className="mt-1 text-sm text-red-600">{signupForm.errors.displayName}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={isSignup ? signupForm.values.email : loginForm.values.email}
                onChange={(e) => isSignup ? signupForm.setValue('email', e.target.value) : loginForm.setValue('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${(isSignup ? signupForm.errors.email : loginForm.errors.email) ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Enter your email"
              />
              {(isSignup ? signupForm.errors.email : loginForm.errors.email) && (
                <p className="mt-1 text-sm text-red-600">{isSignup ? signupForm.errors.email : loginForm.errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={isSignup ? signupForm.values.password : loginForm.values.password}
                  onChange={(e) => isSignup ? signupForm.setValue('password', e.target.value) : loginForm.setValue('password', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${(isSignup ? signupForm.errors.password : loginForm.errors.password) ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400" /> : <AiOutlineEye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {(isSignup ? signupForm.errors.password : loginForm.errors.password) && <p className="mt-1 text-sm text-red-600">{isSignup ? signupForm.errors.password : loginForm.errors.password}</p>}
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupForm.values.confirmPassword}
                    onChange={(e) => signupForm.setValue('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${signupForm.errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Confirm your password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showConfirmPassword ? <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400" /> : <AiOutlineEye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                {signupForm.errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{signupForm.errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (isSignup ? 'Creating Account...' : 'Signing In...') : (isSignup ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={toggleAuthMode} className="text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:underline">
                {isSignup ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          By continuing, you agree to Learning.ai's{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">Terms of Service</a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
