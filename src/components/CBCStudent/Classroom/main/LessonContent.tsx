"use client";

import React from 'react';
import { useLesson } from '../context/LessonContext';

export default function LessonContent() {
  const { lesson } = useLesson();
  if (!lesson) return null;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 py-6">
      <div className="prose prose-invert max-w-none">
        {/* Content Section Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-white m-0">Lesson Content</h2>
        </div>
        
        {/* Main Content Area */}
        <div className="text-white/80 leading-relaxed space-y-4 pl-5">
          <p className="text-base">
            {lesson.content ||
              'This is your generated lesson content. Summaries, key points, and interactive elements will appear here.'}
          </p>
          
          {/* Example placeholder sections - remove when real content loads */}
          {!lesson.content && (
            <>
              <div className="border-l-2 border-purple-500/30 pl-4 py-2">
                <p className="text-white/60 italic">
                  "Key concepts and explanations will be displayed in an easy-to-read format."
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-purple-400 text-sm font-semibold mb-2">Key Point 1</div>
                  <div className="text-white/70 text-sm">Important concepts highlighted</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-blue-400 text-sm font-semibold mb-2">Key Point 2</div>
                  <div className="text-white/70 text-sm">Easy to understand format</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
