'use client';

import React, { useState } from 'react';
import Card from '../shared/Card';

interface ExamGeneratorModalProps {
  onGenerate: (formData: any) => void;
  isGenerating: boolean;
}

export default function ExamGeneratorModal({ onGenerate, isGenerating }: ExamGeneratorModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    topics: [''],
    timeLimit: '60',
    totalMarks: '100',
    sections: {
      mcq: { enabled: true, count: '10', marks: '20' },
      shortAnswer: { enabled: true, count: '5', marks: '30' },
      essay: { enabled: false, count: '2', marks: '50' },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTopic = () => {
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, '']
    }));
  };

  const updateTopic = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map((t, i) => i === index ? value : t)
    }));
  };

  const removeTopic = (index: number) => {
    if (formData.topics.length > 1) {
      setFormData(prev => ({
        ...prev,
        topics: prev.topics.filter((_, i) => i !== index)
      }));
    }
  };

  const toggleSection = (section: keyof typeof formData.sections) => {
    setFormData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: {
          ...prev.sections[section],
          enabled: !prev.sections[section].enabled
        }
      }
    }));
  };

  const updateSectionField = (section: keyof typeof formData.sections, field: 'count' | 'marks', value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: {
          ...prev.sections[section],
          [field]: value
        }
      }
    }));
  };

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white/95 mb-1">Exam Generator</h2>
        <p className="text-sm text-[#9aa6b2]">Create comprehensive exams with answer keys</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Exam Title */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Exam Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white placeholder-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
            placeholder="e.g., Mid-Term Mathematics Exam"
            required
          />
        </div>

        {/* Topics */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Topics to Cover <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {formData.topics.map((topic, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => updateTopic(index, e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white placeholder-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                  placeholder={`Topic ${index + 1}`}
                  required
                />
                {formData.topics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTopic(index)}
                    className="px-3 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTopic}
              className="w-full px-4 py-2 rounded-xl bg-[#0b0f12] border border-white/8 border-dashed text-[#9aa6b2] hover:border-white/15 hover:text-white/90 transition-all text-sm"
            >
              + Add Another Topic
            </button>
          </div>
        </div>

        {/* Time Limit and Total Marks */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              value={formData.timeLimit}
              onChange={(e) => handleChange('timeLimit', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
              min="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Total Marks
            </label>
            <input
              type="number"
              value={formData.totalMarks}
              onChange={(e) => handleChange('totalMarks', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
              min="10"
            />
          </div>
        </div>

        {/* Exam Sections */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-3">
            Exam Sections
          </label>
          <div className="space-y-3">
            {/* MCQ Section */}
            <div className="p-4 rounded-xl bg-[#0b0f12] border border-white/8">
              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sections.mcq.enabled}
                  onChange={() => toggleSection('mcq')}
                  className="w-5 h-5 rounded border-white/20 text-[#10b981] focus:ring-2 focus:ring-[#10b981] focus:ring-offset-0 bg-[#0a0f14]"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white/90">Multiple Choice Questions</div>
                </div>
              </label>
              {formData.sections.mcq.enabled && (
                <div className="grid grid-cols-2 gap-3 mt-3 pl-8">
                  <div>
                    <label className="block text-xs text-[#9aa6b2] mb-1">Questions</label>
                    <input
                      type="number"
                      value={formData.sections.mcq.count}
                      onChange={(e) => updateSectionField('mcq', 'count', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0f14] border border-white/8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9aa6b2] mb-1">Marks</label>
                    <input
                      type="number"
                      value={formData.sections.mcq.marks}
                      onChange={(e) => updateSectionField('mcq', 'marks', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0f14] border border-white/8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Short Answer Section */}
            <div className="p-4 rounded-xl bg-[#0b0f12] border border-white/8">
              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sections.shortAnswer.enabled}
                  onChange={() => toggleSection('shortAnswer')}
                  className="w-5 h-5 rounded border-white/20 text-[#10b981] focus:ring-2 focus:ring-[#10b981] focus:ring-offset-0 bg-[#0a0f14]"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white/90">Short Answer Questions</div>
                </div>
              </label>
              {formData.sections.shortAnswer.enabled && (
                <div className="grid grid-cols-2 gap-3 mt-3 pl-8">
                  <div>
                    <label className="block text-xs text-[#9aa6b2] mb-1">Questions</label>
                    <input
                      type="number"
                      value={formData.sections.shortAnswer.count}
                      onChange={(e) => updateSectionField('shortAnswer', 'count', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0f14] border border-white/8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9aa6b2] mb-1">Marks</label>
                    <input
                      type="number"
                      value={formData.sections.shortAnswer.marks}
                      onChange={(e) => updateSectionField('shortAnswer', 'marks', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0f14] border border-white/8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Essay Section */}
            <div className="p-4 rounded-xl bg-[#0b0f12] border border-white/8">
              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sections.essay.enabled}
                  onChange={() => toggleSection('essay')}
                  className="w-5 h-5 rounded border-white/20 text-[#10b981] focus:ring-2 focus:ring-[#10b981] focus:ring-offset-0 bg-[#0a0f14]"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white/90">Essay Questions</div>
                </div>
              </label>
              {formData.sections.essay.enabled && (
                <div className="grid grid-cols-2 gap-3 mt-3 pl-8">
                  <div>
                    <label className="block text-xs text-[#9aa6b2] mb-1">Questions</label>
                    <input
                      type="number"
                      value={formData.sections.essay.count}
                      onChange={(e) => updateSectionField('essay', 'count', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0f14] border border-white/8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9aa6b2] mb-1">Marks</label>
                    <input
                      type="number"
                      value={formData.sections.essay.marks}
                      onChange={(e) => updateSectionField('essay', 'marks', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0f14] border border-white/8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating || !formData.title || !formData.topics[0]}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold hover:from-[#059669] hover:to-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Exam...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Exam
            </>
          )}
        </button>
      </form>
    </Card>
  );
}
