"use client";

import React, { useState } from 'react';
import LessonCanvas from '../main/LessonCanvas';
import TutorPanel from '../tutor/TutorPanel';
import { LessonProvider } from '../context/LessonContext';

export default function ClassroomLayout() {
  const [isContentCollapsed, setIsContentCollapsed] = useState(false);

  return (
    <LessonProvider>
      <div className="flex h-[70vh] md:h-[72vh] lg:h-[74vh] w-full bg-[#0E0E10] text-white overflow-hidden rounded-2xl shadow-md shadow-black/20 border border-white/10">
        {/* Left: Lesson Content Area */}
        <div 
          className={`transition-all duration-300 ease-in-out border-r-2 border-purple-500/30 relative ${
            isContentCollapsed ? 'w-0 overflow-hidden' : 'w-[60%]'
          }`}
        >
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsContentCollapsed(!isContentCollapsed)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 shadow-lg border-2 border-[#0E0E10] transition-all duration-200"
            title={isContentCollapsed ? "Expand Content" : "Collapse Content"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform duration-300 ${isContentCollapsed ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="h-full p-6 overflow-y-auto scrollbar-hide bg-gradient-to-br from-[#0E0E10] to-[#1a1a1c]">
            <LessonCanvas />
          </div>
        </div>

        {/* Right: AI Tutor Panel */}
        <div 
          className={`transition-all duration-300 ease-in-out bg-gradient-to-br from-[#111113] to-[#1a1a1f] relative ${
            isContentCollapsed ? 'w-full' : 'w-[40%]'
          }`}
        >
          {/* Visual Separator Bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-blue-500 to-purple-500 opacity-50"></div>
          
          {/* AI Agent Badge */}
          <div className="absolute top-4 left-4 bg-purple-600/20 border border-purple-500/50 rounded-full px-4 py-1.5 flex items-center gap-2 z-10">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs font-medium text-purple-300">AI Tutor Active</span>
          </div>

          <div className="h-full p-6 pt-16 overflow-y-auto scrollbar-hide">
            <TutorPanel />
          </div>
        </div>
      </div>
    </LessonProvider>
  );
}
