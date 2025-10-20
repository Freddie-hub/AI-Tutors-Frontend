'use client';

import React from 'react';
import Card from '../shared/Card';

interface LessonPlan {
  id: string;
  topic: string;
  subject: string;
  grade: string;
  date: string;
  type: 'lesson' | 'quiz' | 'exam';
}

export default function RecentLessonsCard() {
  // Mock data - will be replaced with real data
  const recentLessons: LessonPlan[] = [
    {
      id: '1',
      topic: 'Quadratic Equations',
      subject: 'Mathematics',
      grade: 'Grade 10',
      date: '2 days ago',
      type: 'lesson',
    },
    {
      id: '2',
      topic: 'Cell Structure',
      subject: 'Biology',
      grade: 'Grade 9',
      date: '3 days ago',
      type: 'quiz',
    },
    {
      id: '3',
      topic: 'Shakespeare Analysis',
      subject: 'English',
      grade: 'Grade 11',
      date: '1 week ago',
      type: 'lesson',
    },
    {
      id: '4',
      topic: 'World War II',
      subject: 'History',
      grade: 'Grade 10',
      date: '1 week ago',
      type: 'exam',
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return '📝';
      case 'quiz':
        return '📋';
      case 'exam':
        return '📄';
      default:
        return '📚';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lesson':
        return '#7c3aed';
      case 'quiz':
        return '#06b6d4';
      case 'exam':
        return '#10b981';
      default:
        return '#9aa6b2';
    }
  };

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white/95">Recent Lessons</h2>
          <p className="text-sm text-[#9aa6b2] mt-1">Your latest creations</p>
        </div>
        <button className="text-xs text-[#7c3aed] hover:text-[#9333ea] font-medium transition-colors">
          View All →
        </button>
      </div>

      <div className="space-y-3">
        {recentLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="group rounded-xl bg-[#0b0f12] p-4 border border-white/8 ring-1 ring-white/5 hover:border-white/15 hover:bg-[#0d1318] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: `${getTypeColor(lesson.type)}20` }}
              >
                {getTypeIcon(lesson.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white/95 group-hover:text-[#7c3aed] transition-colors duration-300 line-clamp-1">
                    {lesson.topic}
                  </h3>
                  <span className="text-xs text-[#9aa6b2] shrink-0">{lesson.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#9aa6b2]">
                  <span>{lesson.subject}</span>
                  <span>•</span>
                  <span>{lesson.grade}</span>
                </div>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg border border-[#7c3aed] text-[#7c3aed] text-xs font-medium hover:bg-[#7c3aed] hover:text-white transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Reuse lesson:', lesson.id);
                }}
              >
                Reuse
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
