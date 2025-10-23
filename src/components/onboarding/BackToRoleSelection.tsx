"use client";

import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  step?: number;
  onPrev?: () => void;
  className?: string;
  labelWhenPrev?: string;
};

/**
 * BackToRoleSelection
 * - If step > 1 and onPrev provided, calls onPrev (go to previous step)
 * - Otherwise navigates to /onboarding/choose-role
 */
export default function BackToRoleSelection({
  step,
  onPrev,
  className = "flex items-center text-sm text-slate-500 transition-colors hover:text-blue-600",
  labelWhenPrev = "Previous",
}: Props) {
  const router = useRouter();
  const isFirstStep = !step || step === 1;

  const handleClick = () => {
    if (!isFirstStep && onPrev) {
      onPrev();
      return;
    }
    router.push("/onboarding/choose-role");
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {isFirstStep ? "Back to role selection" : labelWhenPrev}
    </button>
  );
}
