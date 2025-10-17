"use client";

import React from 'react';
import { useLesson } from '../context/LessonContext';
import Card from '@/components/CBCStudent/shared/Card';

export default function LessonHeader() {
  const { lesson } = useLesson();
  if (!lesson) return null;

  return (
    <Card className="rounded-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{lesson.topic}</h1>
          <p className="text-white/60 mt-1">
            {lesson.grade} • {lesson.subject}
            {lesson.subtopic ? ` • ${lesson.subtopic}` : ''}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-[#A855F7]/10 text-[#A855F7] text-xs font-medium">
          Active
        </div>
      </div>
    </Card>
  );
}
