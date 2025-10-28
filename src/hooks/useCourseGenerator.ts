'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import type { Course, CourseChapter, CourseSubject } from '@/lib/types';

interface GenerateCBCParams {
  grade: string;
  subjects: string[];
  curriculumContext: {
    grade: string;
    subjects: CourseSubject[];
  };
}

interface GenerateCustomParams {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goals?: string;
  duration?: string;
}

interface CourseTOCResponse {
  courseName: string;
  description: string;
  estimatedDuration: string;
  difficulty?: string;
  chapters: CourseChapter[];
}

export function useCourseGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTOC, setGeneratedTOC] = useState<CourseTOCResponse | null>(null);

  const generateCBCCourse = async (params: GenerateCBCParams): Promise<CourseTOCResponse> => {
    setIsGenerating(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/courses/generate/cbc', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate course');
      }

      const data = await response.json();
      const toc: CourseTOCResponse = {
        courseName: data.courseName,
        description: data.description,
        estimatedDuration: data.estimatedDuration,
        chapters: data.chapters,
      };

      setGeneratedTOC(toc);
      return toc;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate course';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomCourse = async (params: GenerateCustomParams): Promise<CourseTOCResponse> => {
    setIsGenerating(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/courses/generate/custom', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate course');
      }

      const data = await response.json();
      const toc: CourseTOCResponse = {
        courseName: data.courseName,
        description: data.description,
        estimatedDuration: data.estimatedDuration,
        difficulty: data.difficulty,
        chapters: data.chapters,
      };

      setGeneratedTOC(toc);
      return toc;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate course';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCourse = async (courseData: {
    name: string;
    grade: string;
    subjects: CourseSubject[];
    description: string;
    courseType: 'cbc' | 'custom';
    chapters: CourseChapter[];
    estimatedDuration?: string;
    difficulty?: string;
    thumbnail?: string;
  }): Promise<{ courseId: string; course: Course }> => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save course');
      }

      const data = await response.json();
      return { courseId: data.courseId, course: data.course };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save course';
      setError(message);
      throw err;
    }
  };

  const reset = () => {
    setIsGenerating(false);
    setError(null);
    setGeneratedTOC(null);
  };

  return {
    isGenerating,
    error,
    generatedTOC,
    generateCBCCourse,
    generateCustomCourse,
    saveCourse,
    reset,
  };
}
