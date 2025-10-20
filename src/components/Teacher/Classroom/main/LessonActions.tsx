"use client";

import React, { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { useLesson } from '../context/LessonContext';

export default function LessonActions() {
  const { lesson, saveLesson, savedLessons } = useLesson();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Check if current lesson is already saved (by comparing id or content)
  const isLessonSaved = useMemo(() => {
    if (!lesson) return false;
    return savedLessons.some(
      (saved) => 
        saved && 
        saved.id === lesson.id && 
        saved.createdAt !== undefined // Has a createdAt means it's been saved to DB
    );
  }, [lesson, savedLessons]);

  const handleSaveLesson = async () => {
    if (!lesson) return;

    setIsSaving(true);
    setSaveMessage(null);
    try {
      await saveLesson(lesson);
      setSaveMessage('Lesson saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Failed to save lesson');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border-t border-white/10 pt-4 mt-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-white/50 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Need help? Ask your AI tutor
          </p>
          {saveMessage && (
            <span className={`text-xs flex items-center gap-1 ${saveMessage.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
              {saveMessage.includes('success') && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {saveMessage}
            </span>
          )}
          {isLessonSaved && !saveMessage && (
            <span className="text-xs text-emerald-400/70 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Already saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-transparent border border-white/20 hover:bg-white/5 hover:border-white/30 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSaveLesson}
            disabled={isSaving || isLessonSaved}
            title={isLessonSaved ? 'This lesson is already saved' : 'Save this lesson for later'}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isLessonSaved ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="7 3 7 8 15 8" fill="none" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Saved
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Lesson
                  </>
                )}
              </span>
            )}
          </Button>
          <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200">
            Mark Complete
          </Button>
        </div>
      </div>
    </div>
  );
}
