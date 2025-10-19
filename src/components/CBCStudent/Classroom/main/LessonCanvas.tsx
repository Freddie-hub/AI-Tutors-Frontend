"use client";

import React, { useState } from 'react';
import { useLesson } from '../context/LessonContext';
import LessonPlaceholder from './LessonPlaceholder';
import LessonHeader from './LessonHeader';
import LessonContent from './LessonContent';
import LessonActions from './LessonActions';
import LessonFormModal from './LessonFormModal';
import AgentWorking from './AgentWorking';

export default function LessonCanvas() {
  const { lesson, isGenerating } = useLesson();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (isGenerating) {
    return <AgentWorking />;
  }

  if (!lesson) return <LessonPlaceholder />;

  return (
    <div className="flex flex-col space-y-6 h-full">
      <LessonHeader onCreateNewLesson={() => setIsCreateOpen(true)} />
      <LessonContent />
      <LessonActions />
      <LessonFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
