"use client";

import React from 'react';
import { useLesson } from '../context/LessonContext';

type Props = {
  onCreateNewLesson?: () => void;
};

export default function LessonHeader({ onCreateNewLesson }: Props) {
  const { lesson } = useLesson();
  if (!lesson) return null;

  return (
    <div className="border-b border-white/10 pb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#7c3aed] animate-pulse"></div>
            <span className="text-xs font-medium text-[#c4b5fd] uppercase tracking-wider">
              {lesson.grade} • {lesson.subject}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">{lesson.topic}</h1>
          {lesson.specification && (
            <p className="text-white/60 text-sm">{lesson.specification}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCreateNewLesson && (
            <button
              onClick={onCreateNewLesson}
              className="px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#c4b5fd] text-xs font-semibold hover:bg-[#7c3aed]/20 transition-colors"
            >
              New Lesson
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
            <span className="text-emerald-400 text-xs font-semibold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
