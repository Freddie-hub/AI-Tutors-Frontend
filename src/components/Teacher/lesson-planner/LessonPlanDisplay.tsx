'use client';

import React, { useState } from 'react';
import Card from '../shared/Card';

interface LessonPlanDisplayProps {
  content: any;
}

export default function LessonPlanDisplay({ content }: LessonPlanDisplayProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'export'>('view');

  const handleCopy = () => {
    const textContent = generateTextContent();
    navigator.clipboard.writeText(textContent);
    alert('Copied to clipboard!');
  };

  const generateTextContent = () => {
    if (!content || content.type !== 'lesson') return '';
    
    return `
LESSON PLAN: ${content.topic}

Grade Level: ${content.grade}
Subject: ${content.subject}
Duration: ${content.duration}

LEARNING OBJECTIVES:
${content.objectives.map((obj: string, i: number) => `${i + 1}. ${obj}`).join('\n')}

MATERIALS NEEDED:
${content.materials.map((mat: string) => `• ${mat}`).join('\n')}

LESSON ACTIVITIES:

${content.activities.map((activity: any) => `
${activity.title} (${activity.duration})
${activity.description}
`).join('\n')}

ASSESSMENT:
${content.assessment}

HOMEWORK/EXTENSION:
${content.homework}

${content.differentiation ? `DIFFERENTIATION:\n${content.differentiation}` : ''}
    `.trim();
  };

  if (!content) return null;

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl bg-[#0b0f12] border border-white/8 text-white/90 hover:border-white/15 hover:bg-[#0d1318] transition-all flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
        <button
          className="px-4 py-2 rounded-xl bg-[#0b0f12] border border-white/8 text-white/90 hover:border-white/15 hover:bg-[#0d1318] transition-all flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
        <button
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white hover:from-[#6b21a8] hover:to-[#7c3aed] transition-all flex items-center gap-2 text-sm font-semibold shadow-lg shadow-purple-500/25"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save to Library
        </button>
      </div>

      {/* Content Display */}
      <Card>
        <div className="space-y-6">
          {/* Header */}
          <div className="pb-6 border-b border-white/8">
            <h1 className="text-2xl font-bold text-white/95 mb-3">{content.topic}</h1>
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                <span className="text-[#9aa6b2]">Grade:</span>
                <span className="text-white/90 font-medium">{content.grade}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20">
                <span className="text-[#9aa6b2]">Subject:</span>
                <span className="text-white/90 font-medium">{content.subject}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20">
                <span className="text-[#9aa6b2]">Duration:</span>
                <span className="text-white/90 font-medium">{content.duration}</span>
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <h2 className="text-lg font-semibold text-white/95 mb-3 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              Learning Objectives
            </h2>
            <ul className="space-y-2">
              {content.objectives.map((obj: string, index: number) => (
                <li key={index} className="flex items-start gap-3 text-[#9aa6b2]">
                  <span className="text-[#7c3aed] font-semibold mt-0.5">{index + 1}.</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Materials Needed */}
          <div>
            <h2 className="text-lg font-semibold text-white/95 mb-3 flex items-center gap-2">
              <span className="text-xl">📦</span>
              Materials Needed
            </h2>
            <ul className="space-y-2">
              {content.materials.map((material: string, index: number) => (
                <li key={index} className="flex items-start gap-3 text-[#9aa6b2]">
                  <span className="text-[#06b6d4] mt-1">•</span>
                  <span>{material}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lesson Activities */}
          <div>
            <h2 className="text-lg font-semibold text-white/95 mb-4 flex items-center gap-2">
              <span className="text-xl">📚</span>
              Lesson Activities
            </h2>
            <div className="space-y-4">
              {content.activities.map((activity: any, index: number) => (
                <div key={index} className="p-4 rounded-xl bg-[#0b0f12] border border-white/8">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-semibold text-white/95">{activity.title}</h3>
                    <span className="px-3 py-1 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-xs font-medium text-[#7c3aed] whitespace-nowrap">
                      {activity.duration}
                    </span>
                  </div>
                  <p className="text-sm text-[#9aa6b2] leading-relaxed">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment */}
          <div>
            <h2 className="text-lg font-semibold text-white/95 mb-3 flex items-center gap-2">
              <span className="text-xl">✅</span>
              Assessment
            </h2>
            <p className="text-[#9aa6b2] leading-relaxed">{content.assessment}</p>
          </div>

          {/* Homework */}
          <div>
            <h2 className="text-lg font-semibold text-white/95 mb-3 flex items-center gap-2">
              <span className="text-xl">📝</span>
              Homework & Extension Activities
            </h2>
            <p className="text-[#9aa6b2] leading-relaxed">{content.homework}</p>
          </div>

          {/* Differentiation (if provided) */}
          {content.differentiation && (
            <div>
              <h2 className="text-lg font-semibold text-white/95 mb-3 flex items-center gap-2">
                <span className="text-xl">🔄</span>
                Differentiation Strategies
              </h2>
              <p className="text-[#9aa6b2] leading-relaxed">{content.differentiation}</p>
            </div>
          )}

          {/* Generated timestamp */}
          <div className="pt-6 border-t border-white/8">
            <p className="text-xs text-[#9aa6b2]">
              Generated on {new Date(content.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
