"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
};

const LessonContext = createContext<LessonContextType | null>(null);

export function LessonProvider({ children }: { children: React.ReactNode }) {
  const [lesson, setLesson] = useState<Lesson>(null);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      const lessonsRef = collection(db, 'lessons');
      const q = query(
        lessonsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const lessons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
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
      const lessonsRef = collection(db, 'lessons');
      const docRef = await addDoc(lessonsRef, {
        grade: lessonToSave.grade,
        subject: lessonToSave.subject,
        topic: lessonToSave.topic,
        specification: lessonToSave.specification || '',
        content: lessonToSave.content || '',
        userId: user.uid,
        createdAt: Timestamp.now(),
      });
      
      // Add to local state
      const newLesson = {
        ...lessonToSave,
        id: docRef.id,
        createdAt: new Date(),
        userId: user.uid,
      };
      setSavedLessons(prev => [newLesson, ...prev]);
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
        isLoading 
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
