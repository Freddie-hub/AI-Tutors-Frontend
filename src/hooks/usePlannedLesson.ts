'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import type { PlannedLesson, CourseChapter } from '@/lib/types';

/**
 * Hook to fetch a planned lesson for a specific chapter
 * This is for the two-agent course system where lessons are pre-planned
 */
export function usePlannedLesson(courseId: string, chapterId: string) {
  const [chapter, setChapter] = useState<CourseChapter | null>(null);
  const [plannedLesson, setPlannedLesson] = useState<PlannedLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlannedLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        // Fetch course to get chapter info
        const courseResponse = await fetch(`/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course');
        }

        const courseData = await courseResponse.json();
        const foundChapter = courseData.course.chapters.find((ch: CourseChapter) => ch.id === chapterId);
        
        if (!foundChapter) {
          throw new Error('Chapter not found');
        }

        setChapter(foundChapter);

        // Fetch planned lessons for this chapter
        const lessonsResponse = await fetch(
          `/api/courses/${courseId}/lessons?chapterId=${chapterId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!lessonsResponse.ok) {
          throw new Error('Failed to fetch planned lessons');
        }

        const lessonsData = await lessonsResponse.json();
        
        // For now, show the first lesson in the chapter
        // TODO: Add lesson selection UI to choose which lesson to view
        if (lessonsData.lessons && lessonsData.lessons.length > 0) {
          setPlannedLesson(lessonsData.lessons[0]);
        }
      } catch (err) {
        console.error('Error fetching planned lesson:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId && chapterId) {
      fetchPlannedLesson();
    }
  }, [courseId, chapterId]);

  return {
    chapter,
    plannedLesson,
    isLoading,
    error,
  };
}
