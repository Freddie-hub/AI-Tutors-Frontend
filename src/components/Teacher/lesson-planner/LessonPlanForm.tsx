'use client';

import React, { useState } from 'react';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import Card from '../shared/Card';

interface LessonPlanFormProps {
  onGenerate: (formData: any) => void;
  isGenerating: boolean;
}

export default function LessonPlanForm({ onGenerate, isGenerating }: LessonPlanFormProps) {
  const { teacherProfile, isCurriculumBased } = useTeacherProfile();
  const [showCurriculumBrowser, setShowCurriculumBrowser] = useState(false);
  
  const [formData, setFormData] = useState({
    topic: '',
    grade: '',
    subject: teacherProfile.subject,
    specifications: '',
    duration: '60',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white/95 mb-1">Lesson Details</h2>
        <p className="text-sm text-[#9aa6b2]">Provide information to generate your lesson plan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Topic / Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => handleChange('topic', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white placeholder-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
            placeholder="e.g., Introduction to Photosynthesis"
            required
          />
        </div>

        {/* Grade */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Grade Level <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.grade}
            onChange={(e) => handleChange('grade', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white placeholder-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
            placeholder="e.g., Grade 10"
            required
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Subject <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white placeholder-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
            placeholder="e.g., Biology"
            required
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Lesson Duration (minutes)
          </label>
          <select
            value={formData.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
          >
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
            <option value="120">120 minutes</option>
          </select>
        </div>

        {/* Curriculum Browser (conditional) */}
        {isCurriculumBased && (
          <div>
            <button
              type="button"
              onClick={() => setShowCurriculumBrowser(!showCurriculumBrowser)}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed]/10 to-[#06b6d4]/10 border border-[#7c3aed]/30 text-white/90 hover:border-[#7c3aed]/50 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📚</span>
                <span className="text-sm font-medium">Browse {teacherProfile.curriculum} Curriculum</span>
              </div>
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${showCurriculumBrowser ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showCurriculumBrowser && (
              <div className="mt-3 p-4 rounded-xl bg-[#0b0f12] border border-white/8">
                <p className="text-sm text-[#9aa6b2] text-center py-8">
                  Curriculum browser will be integrated here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Additional Specifications */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Additional Specifications (Optional)
          </label>
          <textarea
            value={formData.specifications}
            onChange={(e) => handleChange('specifications', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white placeholder-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all resize-none"
            placeholder="Any specific requirements, learning outcomes, or teaching approaches you'd like to include..."
            rows={4}
          />
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating || !formData.topic || !formData.grade}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white font-semibold hover:from-[#6b21a8] hover:to-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Lesson Plan
            </>
          )}
        </button>
      </form>
    </Card>
  );
}
