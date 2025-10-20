'use client';

import React, { useState } from 'react';
import Card from '../shared/Card';

interface QuizGeneratorModalProps {
  onGenerate: (formData: any) => void;
  isGenerating: boolean;
}

export default function QuizGeneratorModal({ onGenerate, isGenerating }: QuizGeneratorModalProps) {
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'medium',
    questionCount: '10',
    questionTypes: {
      mcq: true,
      truefalse: false,
      shortAnswer: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleQuestionType = (type: keyof typeof formData.questionTypes) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [type]: !prev.questionTypes[type]
      }
    }));
  };

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white/95 mb-1">Quiz Generator</h2>
        <p className="text-sm text-[#9aa6b2]">Create custom quizzes with AI</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Topic <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => handleChange('topic', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white placeholder-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all"
            placeholder="e.g., Algebraic Equations"
            required
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-3">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleChange('difficulty', level)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 capitalize ${
                  formData.difficulty === level
                    ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white shadow-lg'
                    : 'bg-[#0b0f12] text-[#9aa6b2] border border-white/8 hover:border-white/15'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Number of Questions
          </label>
          <select
            value={formData.questionCount}
            onChange={(e) => handleChange('questionCount', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all"
          >
            <option value="5">5 questions</option>
            <option value="10">10 questions</option>
            <option value="15">15 questions</option>
            <option value="20">20 questions</option>
          </select>
        </div>

        {/* Question Types */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-3">
            Question Types
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0b0f12] border border-white/8 cursor-pointer hover:border-white/15 transition-all">
              <input
                type="checkbox"
                checked={formData.questionTypes.mcq}
                onChange={() => toggleQuestionType('mcq')}
                className="w-5 h-5 rounded border-white/20 text-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4] focus:ring-offset-0 bg-[#0a0f14]"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white/90">Multiple Choice</div>
                <div className="text-xs text-[#9aa6b2]">Questions with 4 answer options</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0b0f12] border border-white/8 cursor-pointer hover:border-white/15 transition-all">
              <input
                type="checkbox"
                checked={formData.questionTypes.truefalse}
                onChange={() => toggleQuestionType('truefalse')}
                className="w-5 h-5 rounded border-white/20 text-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4] focus:ring-offset-0 bg-[#0a0f14]"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white/90">True/False</div>
                <div className="text-xs text-[#9aa6b2]">Simple true or false statements</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0b0f12] border border-white/8 cursor-pointer hover:border-white/15 transition-all">
              <input
                type="checkbox"
                checked={formData.questionTypes.shortAnswer}
                onChange={() => toggleQuestionType('shortAnswer')}
                className="w-5 h-5 rounded border-white/20 text-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4] focus:ring-offset-0 bg-[#0a0f14]"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white/90">Short Answer</div>
                <div className="text-xs text-[#9aa6b2]">Questions requiring brief written responses</div>
              </div>
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating || !formData.topic}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white font-semibold hover:from-[#0891b2] hover:to-[#06b6d4] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Quiz
            </>
          )}
        </button>
      </form>
    </Card>
  );
}
