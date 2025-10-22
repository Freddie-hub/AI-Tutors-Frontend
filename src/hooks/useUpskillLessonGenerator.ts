'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import type { PlanResponsePayload, ProgressEvent, AgentType } from '@/lib/ai/types';

interface UseUpskillLessonGeneratorOptions {
  onProgress?: (event: ProgressEvent) => void;
  onComplete?: (final: { outline: string[]; sections: any[]; content: string; hash: string }) => void;
  onError?: (error: string) => void;
}

interface GenerateUpskillParams {
  goal: string;
  domain?: string;
  currentLevel?: string;
  timeline?: string;
  hoursPerWeek?: number;
  preferences?: string;
  motivation?: string;
  totalTokens?: number;
}

export function useUpskillLessonGenerator(options: UseUpskillLessonGeneratorOptions = {}) {
  const [status, setStatus] = useState<'idle' | 'planning' | 'accepting' | 'splitting' | 'generating' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [currentAgent, setCurrentAgent] = useState<AgentType | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [toc, setToc] = useState<PlanResponsePayload['toc'] | null>(null);
  const [final, setFinal] = useState<any>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const generationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    return user.getIdToken();
  };

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (generationIntervalRef.current) {
      clearInterval(generationIntervalRef.current);
      generationIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const generatePlan = useCallback(async (params: GenerateUpskillParams) => {
    try {
      setStatus('planning');
      setError(null);
      setCurrentAgent('planner');

      const token = await getAuthToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60s client timeout (aligns with server)
      const response = await fetch('/api/upskill/plan/goal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ ...params, persist: false }),
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate plan');
      }

      const data: PlanResponsePayload = await response.json();
      console.log('[useUpskillLessonGenerator] Plan generated:', { tocLength: data.toc?.length });
      setToc(data.toc);
      // Set status back to idle so TOC review can be shown
      setStatus('idle');
      setCurrentAgent(null);
      return data;
    } catch (err: any) {
      const msg = err.name === 'AbortError' ? 'Planner timed out. Please try again.' : err.message;
      setError(msg);
      setStatus('error');
      setCurrentAgent(null);
      options.onError?.(msg);
      throw err;
    }
  }, [options]);

  const acceptPlan = useCallback(async () => {
    console.log('[useUpskillLessonGenerator] acceptPlan called with planId:', planId);
    if (!planId) throw new Error('No plan to accept');
    try {
      setStatus('accepting');
      setError(null);
      const token = await getAuthToken();
      const response = await fetch(`/api/upskill/plan/${planId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept plan');
      }
      const data = await response.json();
      console.log('[useUpskillLessonGenerator] Plan accepted:', { lessonId: data.lessonId });
      setLessonId(data.lessonId);
      return data.lessonId as string;
    } catch (err: any) {
      console.error('[useUpskillLessonGenerator] Accept plan error:', err);
      setError(err.message);
      setStatus('error');
      options.onError?.(err.message);
      throw err;
    }
  }, [planId, options]);

  const splitWorkload = useCallback(async (totalTokens?: number, specificLessonId?: string) => {
    const targetLessonId = specificLessonId || lessonId;
    if (!targetLessonId) throw new Error('No lesson to split');
    try {
      setStatus('splitting');
      setError(null);
      setCurrentAgent('splitter');
      const token = await getAuthToken();
      const response = await fetch(`/api/upskill/lesson/${targetLessonId}/split`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalTokens }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to split workload');
      }
      const data = await response.json();
      setProgress({ current: 0, total: data.totalSubtasks });
      setCurrentAgent(null);
      return data;
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
      setCurrentAgent(null);
      options.onError?.(err.message);
      throw err;
    }
  }, [lessonId, options]);

  const startGeneration = useCallback(async (specificLessonId?: string) => {
    const targetLessonId = specificLessonId || lessonId;
    if (!targetLessonId) throw new Error('No lesson to generate');
    try {
      setStatus('generating');
      setError(null);
      setCurrentAgent('writer');
      const token = await getAuthToken();

      const initialResponse = await fetch(`/api/upskill/lesson/${targetLessonId}/run`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: false }),
      });
      if (!initialResponse.ok) {
        const errorData = await initialResponse.json();
        throw new Error(errorData.message || 'Failed to start generation');
      }
      const initialData = await initialResponse.json();
      setRunId(initialData.runId);
      if (initialData.status === 'completed') {
        setFinal(initialData.final);
        setStatus('completed');
        setCurrentAgent(null);
        options.onComplete?.(initialData.final);
        return initialData.final;
      }

      const eventSource = new EventSource(`/api/upskill/lesson/${targetLessonId}/progress?runId=${initialData.runId}&token=${encodeURIComponent(token)}`);
      eventSourceRef.current = eventSource;
      eventSource.onmessage = (event) => {
        try {
          const progressEvent: ProgressEvent = JSON.parse(event.data);
          if (progressEvent.agent) setCurrentAgent(progressEvent.agent);
          if (progressEvent.type === 'subtask_complete') {
            setProgress({ current: progressEvent.data?.order || 0, total: progressEvent.data?.totalSubtasks || 0 });
            options.onProgress?.(progressEvent);
          } else if (progressEvent.type === 'assembled') {
            setCurrentAgent('assembler');
          } else if (progressEvent.type === 'completed') {
            setStatus('completed');
            eventSource.close();
            if (generationIntervalRef.current) clearInterval(generationIntervalRef.current);
            setCurrentAgent(null);
            options.onProgress?.(progressEvent);
          } else if (progressEvent.type === 'error') {
            setError(progressEvent.data?.error || 'Generation failed');
            setStatus('error');
            setCurrentAgent(null);
            eventSource.close();
            if (generationIntervalRef.current) clearInterval(generationIntervalRef.current);
            options.onError?.(progressEvent.data?.error || 'Generation failed');
          }
        } catch (err) {
          console.error('Failed to parse progress event:', err);
        }
      };
      eventSource.onerror = (err) => { console.error('SSE error:', err); eventSource.close(); };

      let currentRunId = initialData.runId;
      generationIntervalRef.current = setInterval(async () => {
        try {
          const continueResponse = await fetch(`/api/upskill/lesson/${targetLessonId}/run`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume: true, runId: currentRunId }),
          });
          if (continueResponse.status === 409) { return; }
          if (!continueResponse.ok) {
            const errorData = await continueResponse.json().catch(() => ({ message: 'Unknown error' }));
            if (continueResponse.status === 401) {
              setError('Session expired. Please refresh the page.');
              setStatus('error');
              if (generationIntervalRef.current) clearInterval(generationIntervalRef.current);
              if (eventSourceRef.current) eventSourceRef.current.close();
              options.onError?.('Session expired');
              return;
            }
            console.warn('[polling] Non-success:', { status: continueResponse.status, message: errorData.message });
            return;
          }
          const continueData = await continueResponse.json();
          if (continueData.status === 'completed') {
            setFinal(continueData.final);
            setStatus('completed');
            setCurrentAgent(null);
            if (generationIntervalRef.current) clearInterval(generationIntervalRef.current);
            if (eventSourceRef.current) eventSourceRef.current.close();
            options.onComplete?.(continueData.final);
          }
        } catch (err) { console.error('Polling error:', err); }
      }, 5000);
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
      setCurrentAgent(null);
      cleanup();
      options.onError?.(err.message);
      throw err;
    }
  }, [lessonId, options, cleanup]);

  const cancelGeneration = useCallback(async () => {
    if (!lessonId || !runId) return;
    try {
      const token = await getAuthToken();
      await fetch(`/api/upskill/lesson/${lessonId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId }),
      });
      cleanup();
      setStatus('idle');
    } catch (err) { console.error('Cancel failed:', err); }
  }, [lessonId, runId, cleanup]);

  const generateLesson = useCallback(async (params: GenerateUpskillParams) => {
    try {
      // Step 1: Generate Plan (TOC)
      const plan = await generatePlan(params);
      console.log('[useUpskillLessonGenerator] generateLesson - plan returned:', { tocLength: plan.toc?.length });
      
      // Validate TOC
      if (!plan.toc || !Array.isArray(plan.toc) || plan.toc.length === 0) {
        throw new Error('Invalid TOC returned from planner');
      }
      
      // Step 2: Accept TOC directly (creates plan and lesson in one step)
      setStatus('accepting');
      setError(null);
      const token = await getAuthToken();
      const acceptResponse = await fetch('/api/upskill/plan/accept', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: params.goal,
          domain: params.domain,
          currentLevel: params.currentLevel,
          timeline: params.timeline,
          hoursPerWeek: params.hoursPerWeek,
          preferences: params.preferences,
          motivation: params.motivation,
          toc: plan.toc,
        }),
      });
      
      if (!acceptResponse.ok) {
        const errorData = await acceptResponse.json();
        throw new Error(errorData.message || 'Failed to accept plan');
      }
      
      const acceptData = await acceptResponse.json();
      const newLessonId = acceptData.lessonId;
      console.log('[useUpskillLessonGenerator] generateLesson - plan accepted:', { lessonId: newLessonId });
      setLessonId(newLessonId);
      
      // Step 3: Split workload
      await splitWorkload(params.totalTokens, newLessonId);
      
      // Step 4: Start generation
      return await startGeneration(newLessonId);
    } catch (err: any) {
      console.error('[useUpskillLessonGenerator] generateLesson error:', err);
      setError(err.message);
      setStatus('error');
      options.onError?.(err.message);
      throw err;
    }
  }, [generatePlan, splitWorkload, startGeneration, options]);

  return {
    status,
    error,
    progress,
    currentAgent,
    toc,
    final,
    planId,
    lessonId,
    runId,
    generatePlan,
    acceptPlan,
    splitWorkload,
    startGeneration,
    cancelGeneration,
    generateLesson,
  };
}
