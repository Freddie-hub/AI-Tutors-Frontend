"use client";

import React, { useMemo, useState } from 'react';
import LessonCanvas from '../main/LessonCanvas';
import TutorPanel from '../tutor/TutorPanel';
import { LessonProvider } from '../context/LessonContext';
import Button from '@/components/ui/Button';

export default function ClassroomLayout() {
  // view: both panels | left only (lesson) | right only (tutor)
  const [view, setView] = useState<'both' | 'left' | 'right'>('both');

  const leftClasses = useMemo(() => {
    const base =
      'transition-all duration-300 ease-in-out relative overflow-hidden min-w-0';
    const width =
      view === 'left'
        ? 'w-full'
        : view === 'both'
        ? 'w-[60%]'
        : 'w-0';
    const border = view === 'right' ? '' : 'border-r border-black';
    return `${base} ${width} ${border}`;
  }, [view]);

  const rightClasses = useMemo(() => {
    const base =
      'transition-all duration-300 ease-in-out relative overflow-hidden min-w-0 bg-gradient-to-br from-[#111113] to-[#1a1a1f]';
    const width =
      view === 'right'
        ? 'w-full'
        : view === 'both'
        ? 'w-[40%]'
        : 'w-0';
    return `${base} ${width}`;
  }, [view]);

  return (
    <LessonProvider>
      <div className="relative flex flex-col h-[85vh] md:h-[87vh] lg:h-[90vh] w-full bg-[#0E0E10] text-white overflow-hidden rounded-2xl shadow-md shadow-black/20 border border-white/10">
        {/* Top controls bar (prevents overlapping content) */}
        <div className="flex items-center justify-center gap-2 p-2 border-b border-white/10 bg-[#0E0E10]">
          <Button
            className={`px-3 py-1 text-xs border border-white/10 ${view === 'left' ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-white/10 hover:bg-white/20'} `}
            onClick={() => setView('left')}
            aria-label="Show main content only"
          >
            Main Only
          </Button>
          <Button
            className={`px-3 py-1 text-xs border border-white/10 ${view === 'both' ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-white/10 hover:bg-white/20'} `}
            onClick={() => setView('both')}
            aria-label="Show split view"
          >
            Split View
          </Button>
          <Button
            className={`px-3 py-1 text-xs border border-white/10 ${view === 'right' ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-white/10 hover:bg-white/20'} `}
            onClick={() => setView('right')}
            aria-label="Show tutor only"
          >
            Tutor Only
          </Button>
        </div>

        {/* Content row */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Lesson Content Area */}
          <div className={leftClasses}>
            <div className="h-full p-6 overflow-y-auto scrollbar-hide bg-gradient-to-br from-[#0E0E10] to-[#1a1a1c]">
              {/* Hide content visually when fully collapsed to avoid focus traps */}
              <div className={view === 'right' ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'}>
                <LessonCanvas />
              </div>
            </div>
          </div>

          {/* Right: AI Tutor Panel */}
          <div className={rightClasses}>
            {/* Visual Separator Bar (only when tutor visible and not full-width left only) */}
            {view !== 'right' && view !== 'left' && (
              <div className="absolute left-0 top-0 bottom-0 w-px bg-black"></div>
            )}
            <div className="h-full p-6 overflow-hidden">
              <div className={(view === 'left' ? 'opacity-0 pointer-events-none select-none' : 'opacity-100') + ' h-full flex flex-col min-h-0'}>
                <TutorPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LessonProvider>
  );
}
