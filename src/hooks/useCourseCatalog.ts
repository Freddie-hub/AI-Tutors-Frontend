'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';

export interface CatalogCourse {
  id: string;
  name: string;
  grade: string;
  subjects: Array<{
    subject: string;
    strands: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  }>;
  description: string;
  courseType: 'cbc' | 'custom';
  chapters: Array<{
    id: string;
    order: number;
    title: string;
    subject: string;
  }>;
  totalChapters: number;
  thumbnail?: string;
  estimatedDuration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  enrollmentCount: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export function useCourseCatalog() {
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/courses/catalog', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch catalog');
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch catalog';
      setError(message);
      console.error('Error fetching catalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const enrollInCourse = async (catalogCourseId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ catalogCourseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to enroll in course');
      }

      return { success: true, courseId: data.courseId };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enroll in course';
      throw new Error(message);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchCatalog();
    }
  }, [auth.currentUser]);

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCatalog,
    enrollInCourse,
  };
}
