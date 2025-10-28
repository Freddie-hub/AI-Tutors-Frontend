import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import type { Course } from '@/lib/types';

export function useCourseDetail(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}` , {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.message || 'Failed to fetch course');
        }

        const data = await response.json();
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setIsLoading(false);
      }
    };

    // Wait for both a valid courseId and an authenticated user
    if (courseId && auth.currentUser) {
      fetchCourse();
    }
  }, [courseId, auth.currentUser]);

  return { course, isLoading, error };
}
