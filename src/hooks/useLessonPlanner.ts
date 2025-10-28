'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import type { PlannedLesson, CourseLessonSchedule } from '@/lib/types';

interface PlanLessonsParams {
  courseId: string;
  lessonsPerWeek?: number;
  startDate?: string;
}

interface PlanLessonsResponse {
  success: boolean;
  totalLessons: number;
  totalWeeks: number;
  overflow: number;
  recommendations?: string[];
  lessons: PlannedLesson[];
  schedule: CourseLessonSchedule;
}

interface GetLessonsResponse {
  success: boolean;
  courseId: string;
  totalLessons: number;
  lessons: PlannedLesson[];
  schedule: CourseLessonSchedule | null;
}

export function useLessonPlanner() {
  const [isPlanning, setIsPlanning] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plannedLessons, setPlannedLessons] = useState<PlannedLesson[]>([]);
  const [schedule, setSchedule] = useState<CourseLessonSchedule | null>(null);

  const planLessons = async (params: PlanLessonsParams): Promise<PlanLessonsResponse> => {
    setIsPlanning(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/courses/${params.courseId}/plan-lessons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonsPerWeek: params.lessonsPerWeek || 4,
          startDate: params.startDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to plan lessons');
      }

      const data: PlanLessonsResponse = await response.json();
      setPlannedLessons(data.lessons);
      setSchedule(data.schedule);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to plan lessons';
      setError(message);
      throw err;
    } finally {
      setIsPlanning(false);
    }
  };

  const fetchLessons = async (params: {
    courseId: string;
    status?: 'planned' | 'generating' | 'generated' | 'published' | 'completed';
    chapterId?: string;
  }): Promise<GetLessonsResponse> => {
    setIsFetching(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.chapterId) queryParams.append('chapterId', params.chapterId);

      const url = `/api/courses/${params.courseId}/lessons${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch lessons');
      }

      const data: GetLessonsResponse = await response.json();
      setPlannedLessons(data.lessons);
      setSchedule(data.schedule);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch lessons';
      setError(message);
      throw err;
    } finally {
      setIsFetching(false);
    }
  };

  const reset = () => {
    setIsPlanning(false);
    setIsFetching(false);
    setError(null);
    setPlannedLessons([]);
    setSchedule(null);
  };

  return {
    isPlanning,
    isFetching,
    error,
    plannedLessons,
    schedule,
    planLessons,
    fetchLessons,
    reset,
  };
}
