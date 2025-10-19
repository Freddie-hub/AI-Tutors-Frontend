'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import type { 
  PlanResponsePayload, 
  ProgressEvent,
  AgentType,
} from '@/lib/ai/types';

interface UseLessonGeneratorOptions {
  onProgress?: (event: ProgressEvent) => void;
  onComplete?: (final: { outline: string[]; sections: any[]; content: string; hash: string }) => void;
  onError?: (error: string) => void;
}

interface GenerateLessonParams {
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  preferences?: string;
  totalTokens?: number;
}

export function useLessonGenerator(options: UseLessonGeneratorOptions = {}) {
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
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  const generateTOC = useCallback(async (params: GenerateLessonParams) => {
    try {
      setStatus('planning');
      setError(null);
      setCurrentAgent('planner');
      
      const token = await getAuthToken();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // 25s client timeout
      const response = await fetch('/api/tutor/plan/toc', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          grade: params.grade,
          subject: params.subject,
          topic: params.topic,
          specification: params.specification,
          preferences: params.preferences,
          persist: false,
        }),
      });
      clearTimeout(timeout);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate TOC');
      }
      
  const data: PlanResponsePayload = await response.json();
  if (data.planId) setPlanId(data.planId as string);
      setToc(data.toc);
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
  
  const replanTOC = useCallback(async (constraints?: string, preferences?: string) => {
    if (!planId) throw new Error('No plan to replan');
    
    try {
      setStatus('planning');
      setError(null);
      
      const token = await getAuthToken();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // 25s client timeout
      const response = await fetch(`/api/tutor/plan/toc/${planId}/replan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({ constraints, preferences }),
      });
      clearTimeout(timeout);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to replan TOC');
      }
      
  const data: PlanResponsePayload = await response.json();
  if (data.planId) setPlanId(data.planId);
      setToc(data.toc);
      setStatus('idle');
      
      return data;
    } catch (err: any) {
      const msg = err.name === 'AbortError' ? 'Planner timed out. Please try again.' : err.message;
      setError(msg);
      setStatus('error');
      options.onError?.(msg);
      throw err;
    }
  }, [planId, options]);
  
  const acceptTOC = useCallback(async () => {
    if (!planId) throw new Error('No plan to accept');
    
    try {
      setStatus('accepting');
      setError(null);
      
      const token = await getAuthToken();
      const response = await fetch(`/api/tutor/plan/toc/${planId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept TOC');
      }
      
      const data = await response.json();
      setLessonId(data.lessonId);
      
      return data.lessonId;
    } catch (err: any) {
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
      const response = await fetch(`/api/tutor/lesson/${targetLessonId}/split`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
      
      // Start progress stream
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      // Trigger first run call
      const initialResponse = await fetch(`/api/tutor/lesson/${targetLessonId}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
      
      // Set up SSE for progress
      const eventSource = new EventSource(
        `/api/tutor/lesson/${targetLessonId}/progress?runId=${initialData.runId}&token=${encodeURIComponent(token)}`
      );
      
      eventSourceRef.current = eventSource;
      
      eventSource.onmessage = (event) => {
        try {
          const progressEvent: ProgressEvent = JSON.parse(event.data);
          if (progressEvent.agent) {
            setCurrentAgent(progressEvent.agent);
          }
          
          if (progressEvent.type === 'subtask_complete') {
            setProgress({
              current: progressEvent.data?.order || 0,
              total: progressEvent.data?.totalSubtasks || 0,
            });
            options.onProgress?.(progressEvent);
          } else if (progressEvent.type === 'assembled') {
            setCurrentAgent('assembler');
          } else if (progressEvent.type === 'completed') {
            setStatus('completed');
            eventSource.close();
            if (generationIntervalRef.current) {
              clearInterval(generationIntervalRef.current);
            }
            setCurrentAgent(null);
            // Fetch final result
            // (In production, you might want to store final in progress event data)
            options.onProgress?.(progressEvent);
          } else if (progressEvent.type === 'error') {
            setError(progressEvent.data?.error || 'Generation failed');
            setStatus('error');
            setCurrentAgent(null);
            eventSource.close();
            if (generationIntervalRef.current) {
              clearInterval(generationIntervalRef.current);
            }
            options.onError?.(progressEvent.data?.error || 'Generation failed');
          }
          
          options.onProgress?.(progressEvent);
        } catch (err) {
          console.error('Failed to parse progress event:', err);
        }
      };
      
      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        eventSource.close();
      };
      
      // Set up polling to continue generation
      let currentRunId = initialData.runId;
      generationIntervalRef.current = setInterval(async () => {
        try {
          const continueResponse = await fetch(`/api/tutor/lesson/${targetLessonId}/run`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ resume: true, runId: currentRunId }),
          });
          
          // Handle 409 Conflict (already processing) - this is expected
          if (continueResponse.status === 409) {
            console.log('[polling] Run already in progress, waiting...');
            return;
          }
          
          if (!continueResponse.ok) {
            const errorData = await continueResponse.json().catch(() => ({ message: 'Unknown error' }));
            
            // 401 means auth token expired - this is a real error
            if (continueResponse.status === 401) {
              console.error('[polling] Authentication expired');
              setError('Session expired. Please refresh the page.');
              setStatus('error');
              if (generationIntervalRef.current) {
                clearInterval(generationIntervalRef.current);
              }
              if (eventSourceRef.current) {
                eventSourceRef.current.close();
              }
              options.onError?.('Session expired');
              return;
            }
            
            console.warn('[polling] Non-success response (will retry):', {
              status: continueResponse.status,
              message: errorData.message,
            });
            // Don't treat other errors as fatal - polling will retry
            return;
          }
          
          const continueData = await continueResponse.json();
          
          if (continueData.status === 'completed') {
            setFinal(continueData.final);
            setStatus('completed');
            setCurrentAgent(null);
            if (generationIntervalRef.current) {
              clearInterval(generationIntervalRef.current);
            }
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
            }
            options.onComplete?.(continueData.final);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 5000); // Increased from 3s to 5s to reduce pressure
      
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
      setCurrentAgent(null);
      cleanup();
      options.onError?.(err.message);
      throw err;
    }
  }, [lessonId, options, cleanup]);

  // Allow external adoption of a lesson created outside of planId accept flow
  const adoptLesson = useCallback((id: string) => {
    setLessonId(id);
    // Reset run/progress state for a fresh generation cycle
    setRunId(null);
    setProgress({ current: 0, total: 0 });
  }, []);
  
  const cancelGeneration = useCallback(async () => {
    if (!lessonId || !runId) return;
    
    try {
      const token = await getAuthToken();
      await fetch(`/api/tutor/lesson/${lessonId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ runId }),
      });
      
      cleanup();
      setStatus('idle');
    } catch (err: any) {
      console.error('Cancel failed:', err);
    }
  }, [lessonId, runId, cleanup]);
  
  const generateLesson = useCallback(async (params: GenerateLessonParams) => {
    try {
      // Step 1: Generate TOC
      const tocData = await generateTOC(params);
      
      // Step 2: Auto-accept (or return TOC for user review)
      const newLessonId = await acceptTOC();
      
      // Step 3: Split workload
      await splitWorkload(params.totalTokens);
      
      // Step 4: Start generation
      return await startGeneration();
    } catch (err: any) {
      throw err;
    }
  }, [generateTOC, acceptTOC, splitWorkload, startGeneration]);
  
  return {
    // State
    status,
    error,
    progress,
    currentAgent,
    toc,
    final,
    planId,
    lessonId,
    runId,
    
    // Actions
    generateTOC,
    replanTOC,
    acceptTOC,
    splitWorkload,
    startGeneration,
    cancelGeneration,
    generateLesson, // One-shot function
    adoptLesson,
  };
}
