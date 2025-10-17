"use client";

import React from 'react';
import { useLesson } from '../context/LessonContext';
import LessonPlaceholder from './LessonPlaceholder';
import LessonHeader from './LessonHeader';
import LessonContent from './LessonContent';
import LessonActions from './LessonActions';

export default function LessonCanvas() {
  const { lesson } = useLesson();

  if (!lesson) return <LessonPlaceholder />;

  return (
    <div className="flex flex-col space-y-6 h-full">
      <LessonHeader />
      <LessonContent />
      <LessonActions />
    </div>
  );
}
