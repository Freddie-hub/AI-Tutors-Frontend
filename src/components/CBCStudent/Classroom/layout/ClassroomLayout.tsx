"use client";

import React from 'react';
import LessonCanvas from '../main/LessonCanvas';
import TutorPanel from '../tutor/TutorPanel';
import { LessonProvider } from '../context/LessonContext';

export default function ClassroomLayout() {
  return (
    <LessonProvider>
      <div className="flex h-[70vh] md:h-[72vh] lg:h-[74vh] w-full bg-[#0E0E10] text-white overflow-hidden rounded-2xl shadow-md shadow-black/20 border border-white/10">
        {/* Left: Lesson Content Area */}
        <div className="w-[60%] border-r border-white/10 p-6 overflow-y-auto">
          <LessonCanvas />
        </div>

        {/* Right: AI Tutor Panel */}
        <div className="w-[40%] bg-[#111113] p-6 overflow-y-auto">
          <TutorPanel />
        </div>
      </div>
    </LessonProvider>
  );
}
