import { useState, useEffect } from 'react';
import type { CourseChapter } from '@/lib/types';

// Lesson type from LessonContext
type Lesson = {
  id: string;
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  content?: string;
  createdAt?: Date;
  userId?: string;
};

export function useChapterLesson(courseId: string, chapterId: string) {
  const [chapter, setChapter] = useState<CourseChapter | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(true);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch chapter info and check if lesson exists
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setIsLoadingChapter(true);
        setError(null);

        const response = await fetch(`/api/courses/${courseId}/chapter/${chapterId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch chapter');
        }

        const data = await response.json();
        setChapter(data.chapter);
        
        // If lesson already exists, load it
        if (data.lesson) {
          setLesson(data.lesson);
        }
      } catch (err) {
        console.error('Error fetching chapter:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chapter');
      } finally {
        setIsLoadingChapter(false);
      }
    };

    if (courseId && chapterId) {
      fetchChapter();
    }
  }, [courseId, chapterId]);

  const generateLesson = async () => {
    if (!chapter) return;

    try {
      setIsGeneratingLesson(true);
      setError(null);

      const response = await fetch(`/api/courses/${courseId}/chapter/${chapterId}/generate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate lesson');
      }

      const data = await response.json();
      setLesson(data.lesson);
    } catch (err) {
      console.error('Error generating lesson:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate lesson');
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const markComplete = async () => {
    if (!chapter || !lesson) return;

    try {
      const response = await fetch(`/api/courses/${courseId}/chapter/${chapterId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark chapter as complete');
      }

      setChapter(prev => prev ? { ...prev, completed: true } : null);
    } catch (err) {
      console.error('Error marking chapter complete:', err);
      throw err;
    }
  };

  return {
    chapter,
    lesson,
    isLoadingChapter,
    isGeneratingLesson,
    error,
    generateLesson,
    markComplete,
  };
}
