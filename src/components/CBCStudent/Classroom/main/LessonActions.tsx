"use client";

import React from 'react';
import Button from '@/components/ui/Button';

export default function LessonActions() {
  return (
    <div className="border-t border-white/10 pt-4 mt-auto">
      <div className="flex items-center justify-between gap-4">
        <p className="text-white/50 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Need help? Ask your AI tutor
        </p>
        <div className="flex items-center gap-3">
          <Button className="bg-transparent border border-white/20 hover:bg-white/5 hover:border-white/30 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200">
            Save Notes
          </Button>
          <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200">
            Mark Complete
          </Button>
        </div>
      </div>
    </div>
  );
}
