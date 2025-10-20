'use client';

import React from 'react';
import Link from 'next/link';
import Card from '../shared/Card';

export default function QuickActionsCard() {
  const actions = [
    {
      id: 'lesson-plan',
      title: 'Generate Lesson Plan',
      description: 'Create comprehensive lesson plans with AI',
      icon: '📝',
      color: '#7c3aed',
      href: '/dashboard/teacher/lesson-planner',
    },
    {
      id: 'quiz',
      title: 'Create Quiz',
      description: 'Generate quizzes and assessments instantly',
      icon: '📋',
      color: '#06b6d4',
      href: '/dashboard/teacher/lesson-planner?mode=quiz',
    },
    {
      id: 'exam',
      title: 'Create Exam',
      description: 'Build comprehensive exams with answer keys',
      icon: '📄',
      color: '#10b981',
      href: '/dashboard/teacher/lesson-planner?mode=exam',
    },
  ];

  return (
    <Card className="h-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white/95">Quick Actions</h2>
        <p className="text-sm text-[#9aa6b2] mt-1">Get started with AI-powered tools</p>
      </div>

      <div className="space-y-4">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="group block rounded-xl bg-[#0b0f12] p-5 border border-white/8 ring-1 ring-white/5 hover:border-white/15 hover:bg-[#0d1318] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${action.color}20` }}
              >
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white/95 mb-1 group-hover:text-[#7c3aed] transition-colors duration-300">
                  {action.title}
                </h3>
                <p className="text-sm text-[#9aa6b2] leading-relaxed">
                  {action.description}
                </p>
              </div>
              <svg 
                className="w-5 h-5 text-[#9aa6b2] group-hover:text-[#7c3aed] group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
