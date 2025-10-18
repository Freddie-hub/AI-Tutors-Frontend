"use client";

import React, { createContext, useContext, useState } from 'react';

type Lesson = {
  id: string;
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  content?: string;
} | null;

type LessonContextType = {
  lesson: Lesson;
  setLesson: React.Dispatch<React.SetStateAction<Lesson>>;
};

const LessonContext = createContext<LessonContextType | null>(null);

export function LessonProvider({ children }: { children: React.ReactNode }) {
  const [lesson, setLesson] = useState<Lesson>(null);
  return (
    <LessonContext.Provider value={{ lesson, setLesson }}>
      {children}
    </LessonContext.Provider>
  );
}

export const useLesson = () => {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error('useLesson must be used within a LessonProvider');
  return ctx;
};
