"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useLesson } from '../context/LessonContext';
import Card from '@/components/Institution/shared/Card';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LessonFormModal({ open, onClose }: Props) {
  const { setLesson } = useLesson();
  
  const [subject, setSubject] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [specification, setSpecification] = useState<string>('');

  if (!open) return null;

  const createLesson = () => {
    if (!subject.trim() || !topic.trim()) {
      alert('Please provide both a subject and topic.');
      return;
    }
    
    setLesson({
      id: Date.now().toString(),
      subject,
      topic,
      specification,
      content: 'Generated lesson content will appear here based on your selections. You can interact with the AI tutor to get guidance.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-lg rounded-2xl bg-[#111113]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Lesson</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white"></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Subject</label>
            <input type="text" className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2" placeholder="e.g., Mathematics, Science, History" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Topic</label>
            <input type="text" className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2" placeholder="e.g., Algebra, Cell Biology, World War II" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Additional Details (Optional)</label>
            <textarea className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2 min-h-24 resize-y" placeholder="Describe specifics: focus area, difficulty level, learning goals, or any other details..." value={specification} onChange={(e) => setSpecification(e.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button onClick={onClose} className="bg-transparent border border-white/10 hover:bg-white/5">Cancel</Button>
          <Button onClick={createLesson} className="bg-[#A855F7] hover:bg-[#9333EA] text-white shadow-[0_0_10px_rgba(168,85,247,0.15)]">Create Lesson</Button>
        </div>
      </Card>
    </div>
  );
}
