"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useLesson } from '../context/LessonContext';
import Card from '@/components/Upskill/shared/Card';
import { useUpskillLessonGenerator } from '@/hooks/useUpskillLessonGenerator';
import AgentWorking from './AgentWorking';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LessonFormModal({ open, onClose }: Props) {
  const { setLesson, setGenerationStatus, setCurrentAgent: setCtxAgent, setGenerationProgress } = useLesson();
  const { 
    generatePlan,
    acceptPlan,
    splitWorkload,
    startGeneration,
    status, 
    error, 
    progress,
    currentAgent,
    toc,
    final,
    lessonId,
    cancelGeneration,
  } = useUpskillLessonGenerator({
    onProgress: (evt) => {
      if (evt.agent) setCtxAgent(evt.agent);
      if (evt.type === 'subtask_complete') {
        setGenerationProgress({ current: evt.data?.order || 0, total: evt.data?.totalSubtasks || 0 });
      }
    },
    onComplete: (final) => {
      // Update context with the generated lesson for rendering in canvas
      setLesson({
        id: Date.now().toString(),
        grade: 'Upskill',
        subject: domain || 'General',
        topic: goal,
        specification: [currentLevel && `Level: ${currentLevel}`, timeline && `Timeline: ${timeline}`, typeof hoursPerWeek === 'number' && `~${hoursPerWeek} h/wk`, preferences && `Prefs: ${preferences}`]
          .filter(Boolean)
          .join(' | '),
        content: final?.content,
      });
      setCtxAgent(null);
      setGenerationStatus('completed');
      onClose();
    },
    onError: () => {
      setGenerationStatus('error');
      setCtxAgent(null);
      setHasStarted(false); // Reset on error so user can retry
    },
  });
  
  const [goal, setGoal] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [currentLevel, setCurrentLevel] = useState<string>('');
  const [timeline, setTimeline] = useState<string>('');
  const [hoursPerWeek, setHoursPerWeek] = useState<number | ''>('');
  const [preferences, setPreferences] = useState<string>('');
  const [motivation, setMotivation] = useState<string>('');
  const [totalTokens, setTotalTokens] = useState<number>(15000);
  const [hasStarted, setHasStarted] = useState(false);
  const [editableTOC, setEditableTOC] = useState<any[] | null>(null);
  const [replanNotes, setReplanNotes] = useState<string>('');

  // Mirror status/agent to context so other components can react
  useEffect(() => {
    setGenerationStatus(status);
  }, [status, setGenerationStatus]);
  
  useEffect(() => {
    setCtxAgent(currentAgent ?? null);
  }, [currentAgent, setCtxAgent]);

  // Reset hasStarted when modal closes
  useEffect(() => {
    if (!open) {
      setHasStarted(false);
      setEditableTOC(null);
      setReplanNotes('');
    }
  }, [open]);

  // When generation completes, persist lesson into context and close
  useEffect(() => {
    if (status === 'completed' && final && lessonId) {
      setLesson({
        id: lessonId,
        grade: 'Upskill',
        subject: domain || 'General',
        topic: goal,
        specification: [currentLevel && `Level: ${currentLevel}`, timeline && `Timeline: ${timeline}`, typeof hoursPerWeek === 'number' && `~${hoursPerWeek} h/wk`, preferences && `Prefs: ${preferences}`]
          .filter(Boolean)
          .join(' | '),
        content: final?.content,
      });
      onClose();
    }
  }, [status, final, lessonId, setLesson, goal, domain, currentLevel, timeline, hoursPerWeek, preferences, onClose]);

  if (!open) return null;

  const handleGenerateTOC = async () => {
    if (!goal.trim()) {
      alert('Please provide your learning goal.');
      return;
    }
    setHasStarted(true);
    try {
      const data = await generatePlan({
        goal,
        domain: domain || undefined,
        currentLevel: currentLevel || undefined,
        timeline: timeline || undefined,
        hoursPerWeek: hoursPerWeek === '' ? undefined : Number(hoursPerWeek),
        preferences: preferences || undefined,
        motivation: motivation || undefined,
        totalTokens,
      });
      setEditableTOC(data.toc);
    } catch (e) {
      console.error('[LessonFormModal] Generate TOC error:', e);
    }
  };

  const handleAcceptAndGenerate = async () => {
    try {
      // Accept TOC directly (creates plan and lesson)
      const token = await (await import('@/lib/firebase')).auth.currentUser?.getIdToken();
      const response = await fetch('/api/upskill/plan/accept', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal,
          domain: domain || undefined,
          currentLevel: currentLevel || undefined,
          timeline: timeline || undefined,
          hoursPerWeek: hoursPerWeek === '' ? undefined : Number(hoursPerWeek),
          preferences: preferences || undefined,
          motivation: motivation || undefined,
          toc: editableTOC,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Accept failed');
      }
      
      const res = await response.json();
      const newLessonId = res.lessonId;
      
      if (!newLessonId) {
        throw new Error('Failed to create lesson');
      }
      
      // Now proceed with split and generation using the new lessonId directly
      await splitWorkload(totalTokens, newLessonId);
      await startGeneration(newLessonId);
    } catch (e) {
      console.error('[LessonFormModal] Accept and generate error:', e);
    }
  };

  const handleReplan = async () => {
    try {
      setHasStarted(true);
      const data = await generatePlan({
        goal,
        domain: domain || undefined,
        currentLevel: currentLevel || undefined,
        timeline: timeline || undefined,
        hoursPerWeek: hoursPerWeek === '' ? undefined : Number(hoursPerWeek),
        preferences: replanNotes || preferences || undefined,
        motivation: motivation || undefined,
        totalTokens,
      });
      setEditableTOC(data.toc);
      setReplanNotes(''); // Clear replan notes after replanning
    } catch (e) {
      console.error('[LessonFormModal] Replan error:', e);
    }
  };

  const safeClose = async () => {
    // If generation is active, cancel it before closing
    if (status === 'generating') {
      try { await cancelGeneration(); } catch { /* ignore */ }
    }
    setHasStarted(false);
    setEditableTOC(null);
    setReplanNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-2xl rounded-2xl bg-[#111113]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Upskill Lesson</h3>
          <button onClick={safeClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        {/* Step 1: Input Form */}
        {status === 'idle' && !toc && !hasStarted && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">What do you want to learn?</label>
              <input type="text" className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2" placeholder="e.g., Learn machine learning in 3 months, Prepare for a React interview this weekend" value={goal} onChange={(e) => setGoal(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Domain (optional)</label>
                <input type="text" className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2" placeholder="e.g., Machine Learning, Web Development, Finance" value={domain} onChange={(e) => setDomain(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Current level (optional)</label>
                <input type="text" className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2" placeholder="e.g., Know Python basics; new to ML" value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Timeline (optional)</label>
                <input type="text" className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2" placeholder="e.g., 3 months, 1 week, one night" value={timeline} onChange={(e) => setTimeline(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Hours/week (optional)</label>
                <input type="number" min={1} className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2" placeholder="e.g., 10" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Target size (tokens)</label>
                <input type="number" min={3000} step={1000} className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2" placeholder="e.g., 15000" value={totalTokens} onChange={(e) => setTotalTokens(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Preferences (optional)</label>
                <input type="text" className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2" placeholder="e.g., Project-first, short sessions, more code" value={preferences} onChange={(e) => setPreferences(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Motivation (optional)</label>
                <input type="text" className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2" placeholder="e.g., Career switch, interview prep, personal project" value={motivation} onChange={(e) => setMotivation(e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button onClick={onClose} className="bg-transparent border border-white/10 hover:bg-white/5">Cancel</Button>
              <Button onClick={handleGenerateTOC} className="bg-[#A855F7] hover:bg-[#9333EA] text-white shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                Generate Learning Plan
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Planning / Accepting / Splitting indicators */}
        {(status === 'planning' || status === 'accepting' || status === 'splitting') && (
          <div className="space-y-3">
            <AgentWorking agent={currentAgent ?? undefined} />
            <p className="text-center text-white/70 text-sm capitalize">{status}...</p>
            <div className="flex items-center justify-end gap-3">
              <Button onClick={safeClose} className="bg-transparent border border-white/10 hover:bg-white/5">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: TOC Review */}
        {editableTOC && toc && status === 'idle' && !final && (
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Review Your Learning Path</h4>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {editableTOC.map((chapter: any, idx: number) => (
                <div key={chapter.chapterId || idx} className="border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm">Chapter {idx + 1}:</span>
                    <input
                      className="flex-1 bg-[#0E0E10] border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
                      value={chapter.title}
                      onChange={(e) => {
                        const next = [...editableTOC];
                        next[idx] = { ...chapter, title: e.target.value };
                        setEditableTOC(next);
                      }}
                      autoFocus={idx === 0}
                    />
                  </div>
                  {chapter.subtopics && chapter.subtopics.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-white/70 mt-1">
                      {chapter.subtopics.map((s: string, i: number) => (
                        <li key={i}>
                          <input
                            className="w-full bg-transparent border-b border-white/10 focus:outline-none focus:border-white/20 text-white/80 cursor-text"
                            value={s}
                            onChange={(e) => {
                              const next = [...editableTOC];
                              const subs = [...chapter.subtopics];
                              subs[i] = e.target.value;
                              next[idx] = { ...chapter, subtopics: subs };
                              setEditableTOC(next);
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Replan notes (optional)</label>
              <input
                type="text"
                value={replanNotes}
                onChange={(e) => setReplanNotes(e.target.value)}
                placeholder="e.g., Make it more concise, add more examples, focus on practical projects"
                className="w-full bg-[#0E0E10] border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button onClick={handleReplan} className="bg-transparent border border-white/10 hover:bg-white/5">
                Replan
              </Button>
              <Button onClick={handleAcceptAndGenerate} className="bg-green-600 hover:bg-green-700 text-white">
                Accept & Generate
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Generation */}
        {status === 'generating' && (
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Generating Your Learning Plan</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>Progress</span>
                <span>{progress.current} / {progress.total} sections</span>
              </div>
              <div className="w-full bg-[#0E0E10] rounded-full h-2">
                <div
                  className="bg-[#A855F7] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="text-sm text-white/80">
              Active agent: <span className="font-medium">{currentAgent ?? '...'}</span>
            </div>
            <AgentWorking agent={currentAgent ?? undefined} />
            <div className="flex items-center justify-end gap-3">
              <Button onClick={async () => { await cancelGeneration(); onClose(); }} className="bg-red-600 hover:bg-red-700 text-white">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Errors */}
        {error && status === 'error' && (
          <div className="mt-4 space-y-3">
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button onClick={safeClose} className="bg-transparent border border-white/10 hover:bg-white/5">
                Close
              </Button>
              <Button onClick={() => { setHasStarted(false); }} className="bg-[#A855F7] hover:bg-[#9333EA] text-white">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

