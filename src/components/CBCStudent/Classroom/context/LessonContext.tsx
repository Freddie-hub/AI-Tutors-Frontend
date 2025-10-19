"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks';

export type Lesson = {
  id: string;
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  content?: string;
  createdAt?: Date;
  userId?: string;
} | null;

type LessonContextType = {
  lesson: Lesson;
  setLesson: React.Dispatch<React.SetStateAction<Lesson>>;
  savedLessons: Lesson[];
  saveLesson: (lesson: Lesson) => Promise<void>;
  loadLesson: (lesson: Lesson) => void;
  loadSavedLessons: () => Promise<void>;
  isLoading: boolean;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
};

const LessonContext = createContext<LessonContextType | null>(null);

export function LessonProvider({ children }: { children: React.ReactNode }) {
  const [lesson, setLesson] = useState<Lesson>(null);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  // Load saved lessons when user is available
  useEffect(() => {
    if (user?.uid) {
      loadSavedLessons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadSavedLessons = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const { fetchLessons } = await import('@/lib/api');
      const response = await fetchLessons();
      const lessons = response.lessons.map(lesson => ({
        ...lesson,
        createdAt: lesson.createdAt ? new Date(lesson.createdAt) : undefined,
      })) as Lesson[];
      setSavedLessons(lessons);
    } catch (error) {
      console.error('Error loading saved lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLesson = async (lessonToSave: Lesson) => {
    if (!lessonToSave || !user?.uid) return;

    try {
      const { saveLessonToServer } = await import('@/lib/api');
      const response = await saveLessonToServer({
        grade: lessonToSave.grade,
        subject: lessonToSave.subject,
        topic: lessonToSave.topic,
        specification: lessonToSave.specification || '',
        content: lessonToSave.content || '',
      });
      
      if (response.success) {
        // Add to local state
        const newLesson = {
          ...response.lesson,
          createdAt: response.lesson.createdAt ? new Date(response.lesson.createdAt) : new Date(),
          userId: user.uid,
        };
        setSavedLessons(prev => [newLesson, ...prev]);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      throw error;
    }
  };

  const loadLesson = (lessonToLoad: Lesson) => {
    setLesson(lessonToLoad);
  };

  return (
    <LessonContext.Provider 
      value={{ 
        lesson, 
        setLesson, 
        savedLessons, 
        saveLesson, 
        loadLesson,
        loadSavedLessons,
        isLoading,
        isGenerating,
        setIsGenerating,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
}

export const useLesson = () => {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error('useLesson must be used within a LessonProvider');
  return ctx;
};
