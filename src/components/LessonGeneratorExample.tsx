'use client';

import React, { useState } from 'react';
import { useLessonGenerator } from '@/hooks/useLessonGenerator';
import AgentWorking from '@/components/CBCStudent/Classroom/main/AgentWorking';

/**
 * Example component demonstrating the multi-agent lesson generation system.
 * 
 * This shows a complete user flow:
 * 1. User inputs topic details
 * 2. System generates TOC
 * 3. User reviews and accepts (or replans)
 * 4. System generates lesson with progress tracking
 * 5. User views final lesson
 */
export default function LessonGeneratorExample() {
  const [formData, setFormData] = useState({
    grade: 'Grade 5',
    subject: 'Mathematics',
    topic: '',
    specification: '',
    totalTokens: 12000,
  });
  
  const {
    status,
    error,
    progress,
    currentAgent,
    toc,
    final,
    generateTOC,
    acceptTOC,
    splitWorkload,
    startGeneration,
    cancelGeneration,
    replanTOC,
  } = useLessonGenerator({
    onProgress: (event) => {
      console.log('Progress:', event);
    },
    onComplete: (finalLesson) => {
      console.log('Lesson complete!', finalLesson);
    },
    onError: (error) => {
      console.error('Error:', error);
    },
  });
  
  const handleGenerateTOC = async () => {
    try {
      await generateTOC(formData);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleAcceptAndGenerate = async () => {
    try {
      await acceptTOC();
      await splitWorkload(formData.totalTokens);
      await startGeneration();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleReplan = async () => {
    try {
      await replanTOC('Make it more concise', 'Add more examples');
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Multi-Agent Lesson Generator</h1>
      
      {/* Step 1: Input Form */}
      {status === 'idle' && !toc && (
        <div className="bg-[#1A1A1D] rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Create a Lesson</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-white/70 mb-1">Grade</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 bg-[#0E0E10] border border-white/10 rounded-lg text-white"
              >
                <option>Grade 4</option>
                <option>Grade 5</option>
                <option>Grade 6</option>
                <option>Grade 7</option>
                <option>Grade 8</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-white/70 mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 bg-[#0E0E10] border border-white/10 rounded-lg text-white"
                placeholder="e.g., Mathematics"
              />
            </div>
            
            <div>
              <label className="block text-sm text-white/70 mb-1">Topic</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3 py-2 bg-[#0E0E10] border border-white/10 rounded-lg text-white"
                placeholder="e.g., Fractions"
              />
            </div>
            
            <div>
              <label className="block text-sm text-white/70 mb-1">Specification (Optional)</label>
              <textarea
                value={formData.specification}
                onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                className="w-full px-3 py-2 bg-[#0E0E10] border border-white/10 rounded-lg text-white"
                placeholder="e.g., Focus on proper and improper fractions"
                rows={3}
              />
            </div>
            
            <button
              onClick={handleGenerateTOC}
              disabled={!formData.topic}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition"
            >
              Generate Table of Contents
            </button>
          </div>
        </div>
      )}
      
      {/* Step 2: TOC Review */}
      {toc && status === 'idle' && !final && (
        <div className="bg-[#1A1A1D] rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Review Table of Contents</h2>
          
          <div className="space-y-4">
            {toc.map((chapter, idx) => (
              <div key={chapter.chapterId} className="border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">
                  Chapter {idx + 1}: {chapter.title}
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-white/70">
                  {chapter.subtopics.map((subtopic, subIdx) => (
                    <li key={subIdx}>{subtopic}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleAcceptAndGenerate}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition"
            >
              Accept & Generate Lesson
            </button>
            <button
              onClick={handleReplan}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition"
            >
              Replan
            </button>
          </div>
        </div>
      )}
      
      {/* Step 3: Generation in Progress */}
      {(status === 'planning' || status === 'accepting' || status === 'splitting') && (
        <div className="bg-[#1A1A1D] rounded-lg p-6">
          <AgentWorking agent={currentAgent ?? undefined} />
          <p className="text-center text-white/70 mt-4 capitalize">{status}...</p>
        </div>
      )}
      
      {status === 'generating' && (
        <div className="bg-[#1A1A1D] rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Generating Lesson</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/70">
              <span>Progress</span>
              <span>{progress.current} / {progress.total} sections</span>
            </div>
            <div className="w-full bg-[#0E0E10] rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          
          {/* Agent indicator */}
          <div className="text-sm text-white/80">
            Active agent: <span className="font-medium">{currentAgent ?? '...'}</span>
          </div>
          
          <AgentWorking agent={currentAgent ?? undefined} />
          
          <button
            onClick={cancelGeneration}
            className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition"
          >
            Cancel
          </button>
        </div>
      )}
      
      {/* Step 4: Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {/* Step 5: Final Lesson */}
      {final && status === 'completed' && (
        <div className="bg-[#1A1A1D] rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-white">Lesson Complete! 🎉</h2>
          
          <div className="space-y-4">
            {/* Outline */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Outline</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-white/70">
                {final.outline.map((point: string, idx: number) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
            
            {/* Sections */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Sections ({final.sections.length})
              </h3>
              <div className="space-y-2">
                {final.sections.map((section: any, idx: number) => (
                  <div key={section.id} className="border border-white/10 rounded-lg p-3">
                    <p className="text-sm font-medium text-white">{section.title}</p>
                    <p className="text-xs text-white/50 mt-1">ID: {section.id}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Preview */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Content Preview</h3>
              <div
                className="bg-[#0E0E10] rounded-lg p-4 max-h-96 overflow-y-auto prose prose-invert prose-sm"
                dangerouslySetInnerHTML={{ __html: final.content }}
              />
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
            >
              Generate Another Lesson
            </button>
          </div>
        </div>
      )}
      
      {/* Status Indicator */}
      <div className="text-center text-xs text-white/50">
        Status: <span className="font-mono">{status}</span>
      </div>
    </div>
  );
}
