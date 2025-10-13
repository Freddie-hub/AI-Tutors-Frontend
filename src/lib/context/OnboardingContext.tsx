"use client";

import React, { createContext, useContext, useState } from 'react';

interface OnboardingContextValue {
  isOnboarding: boolean;
  setIsOnboarding: (v: boolean) => void;
}

export const OnboardingContext = createContext<OnboardingContextValue>({
  isOnboarding: false,
  setIsOnboarding: () => {},
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOnboarding, setIsOnboarding] = useState(false);

  return (
    <OnboardingContext.Provider value={{ isOnboarding, setIsOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}
