"use client";

import { createContext, useState, ReactNode } from 'react';

interface OnboardingContextType {
  isOnboarding: boolean;
  setIsOnboarding: (value: boolean) => void;
}

export const OnboardingContext = createContext<OnboardingContextType>({
  isOnboarding: false,
  setIsOnboarding: () => {},
});

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboarding, setIsOnboarding] = useState(false);

  return (
    <OnboardingContext.Provider value={{ isOnboarding, setIsOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}