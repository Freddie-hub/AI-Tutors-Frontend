"use client";

import React from 'react';
import TutorHeader from '@/components/CBCStudent/Classroom/tutor/TutorHeader';
import TutorChat from '@/components/CBCStudent/Classroom/tutor/TutorChat';
import TutorInput from '@/components/CBCStudent/Classroom/tutor/TutorInput';

export default function TutorPanel() {
  return (
    <div className="flex flex-col h-full">
      <TutorHeader />
      <div className="flex-1 overflow-y-auto scrollbar-hide mt-4 space-y-4 min-h-0">
        <TutorChat />
      </div>
      <TutorInput />
    </div>
  );
}
