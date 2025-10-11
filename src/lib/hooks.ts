// React hooks for Firebase authentication and Firestore
// Provides easy-to-use hooks for managing auth state and data

'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, UserProfile, Institution } from './firebase';
import { userService, institutionService } from './auth';

// Hook for authentication state
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}

// Hook for user profile data
export function useUserProfile(uid?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching user profile:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]);

  return { profile, loading, error };
}

// Hook for institution data
export function useInstitution(institutionId?: string) {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!institutionId) {
      setInstitution(null);
      setLoading(false);
      return;
    }

    const institutionRef = doc(db, 'institutions', institutionId);
    const unsubscribe = onSnapshot(
      institutionRef,
      (doc) => {
        if (doc.exists()) {
          setInstitution(doc.data() as Institution);
        } else {
          setInstitution(null);
        }
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching institution:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [institutionId]);

  return { institution, loading, error };
}

// Combined hook for authenticated user with profile
export function useAuthUser() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error } = useUserProfile(user?.uid);
  const { institution, loading: institutionLoading } = useInstitution(profile?.institutionId);

  const loading = authLoading || profileLoading || institutionLoading;

  // Create user profile if it doesn't exist
  useEffect(() => {
    if (user && !profileLoading && !profile && !error) {
      userService.createUserProfile(user).catch(console.error);
    }
  }, [user, profile, profileLoading, error]);

  return {
    user,
    profile,
    institution,
    loading,
    error,
    isAuthenticated: !!user,
    isIndependent: profile?.isIndependent ?? false,
    isInstitutionLinked: !!(profile?.institutionId && institution)
  };
}

// Hook for managing authentication actions
export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const withErrorHandling = async <T,>(action: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await action();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    clearError,
    withErrorHandling
  };
}

// Hook for form state management
export function useFormState<T>(initialState: T) {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const setValue = (field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setError = (field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearErrors = () => setErrors({});

  const reset = () => {
    setValues(initialState);
    clearErrors();
  };

  const hasErrors = Object.values(errors).some(error => !!error);

  return {
    values,
    errors,
    setValue,
    setError,
    clearErrors,
    reset,
    hasErrors
  };
}