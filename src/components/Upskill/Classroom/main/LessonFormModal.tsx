"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useLesson } from '../context/LessonContext';
import Card from '@/components/Upskill/shared/Card';
import { useUpskillLessonGenerator } from '@/hooks/useUpskillLessonGenerator';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LessonFormModal({ open, onClose }: Props) {
  const { setLesson } = useLesson();
  const { generateLesson, status, error } = useUpskillLessonGenerator({
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
      onClose();
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

  if (!open) return null;

  const start = async () => {
    if (!goal.trim()) {
      alert('Please provide your learning goal.');
      return;
    }
    try {
      await generateLesson({
        goal,
        domain: domain || undefined,
        currentLevel: currentLevel || undefined,
        timeline: timeline || undefined,
        hoursPerWeek: hoursPerWeek === '' ? undefined : Number(hoursPerWeek),
        preferences: preferences || undefined,
        motivation: motivation || undefined,
        totalTokens,
      });
    } catch (e) {
      // error state already handled via hook; keep UI responsive
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-2xl rounded-2xl bg-[#111113]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Upskill Lesson</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white"></button>
        </div>
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
          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button onClick={onClose} className="bg-transparent border border-white/10 hover:bg-white/5">Cancel</Button>
          <Button onClick={start} disabled={status !== 'idle'} className="bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-60 disabled:cursor-not-allowed text-white shadow-[0_0_10px_rgba(168,85,247,0.15)]">
            {status === 'planning' && 'Planning...'}
            {status === 'accepting' && 'Accepting...'}
            {status === 'splitting' && 'Preparing...'}
            {status === 'generating' && 'Generating...'}
            {status === 'error' && 'Retry'}
            {status === 'idle' && 'Create Lesson'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
