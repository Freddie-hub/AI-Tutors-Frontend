"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type OnboardingContextValue = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isLoading, setLoading] = useState(false);

  const setIsLoading = useCallback((loading: boolean) => {
    setLoading(loading);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      setIsLoading,
    }),
    [isLoading, setIsLoading],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
