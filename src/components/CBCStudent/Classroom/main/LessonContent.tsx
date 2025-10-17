"use client";

import React from 'react';
import Card from '@/components/CBCStudent/shared/Card';
import { useLesson } from '../context/LessonContext';

export default function LessonContent() {
  const { lesson } = useLesson();
  if (!lesson) return null;

  return (
    <Card className="rounded-2xl flex-1 overflow-y-auto scrollbar-hide min-h-0">
      <div className="prose prose-invert max-w-none">
        <h2 className="text-lg font-semibold mb-3">Lesson Content</h2>
        <p className="text-white/80 leading-relaxed">
          {lesson.content ||
            'This is your generated lesson content. Summaries, key points, and interactive elements will appear here.'}
        </p>
      </div>
    </Card>
  );
}
