import React from 'react';
import Card from '../shared/Card';
import Tag from '../shared/Tag';

interface Lesson {
  id: number;
  title: string;
  subject: string;
  tags: Array<{ label: string; variant: 'purple' | 'cyan' | 'green' | 'orange' | 'blue' }>;
  time: string;
  teacher: {
    name: string;
    avatar: string;
  };
  color: string;
}

export default function UpcomingLessons() {
  const lessons: Lesson[] = [
    {
      id: 1,
      title: 'Algebra: Quadratic Equations',
      subject: 'Mathematics',
      tags: [
        { label: 'Math', variant: 'purple' },
        { label: 'Live', variant: 'green' }
      ],
      time: '11:30 AM - 12:30 PM',
      teacher: {
        name: 'Mr. Johnson',
        avatar: 'https://i.pravatar.cc/150?img=12'
      },
      color: '#7c3aed'
    },
    {
      id: 2,
      title: 'Essay Writing Techniques',
      subject: 'English',
      tags: [
        { label: 'English', variant: 'cyan' },
        { label: 'Workshop', variant: 'orange' }
      ],
      time: '02:00 PM - 03:00 PM',
      teacher: {
        name: 'Ms. Williams',
        avatar: 'https://i.pravatar.cc/150?img=45'
      },
      color: '#06b6d4'
    },
    {
      id: 3,
      title: 'Photosynthesis & Energy',
      subject: 'Science',
      tags: [
        { label: 'Biology', variant: 'green' },
        { label: 'Exam Prep', variant: 'orange' }
      ],
      time: '04:00 PM - 05:00 PM',
      teacher: {
        name: 'Dr. Brown',
        avatar: 'https://i.pravatar.cc/150?img=33'
      },
      color: '#10b981'
    }
  ];

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white/95">Schedule</h2>
          <p className="text-sm text-[#9aa6b2] mt-1">Today&apos;s lessons</p>
        </div>
        <button
          className="text-xs text-[#7c3aed] hover:text-[#a855f7] font-medium focus:outline-none"
          aria-label="View full schedule"
        >
          View All
        </button>
      </div>

      {/* Lesson Cards */}
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="rounded-lg bg-[#0d1113] p-4 border border-white/6 hover:border-white/12 transition-all cursor-pointer group"
          >
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {lesson.tags.map((tag, index) => (
                <Tag key={index} variant={tag.variant}>
                  {tag.label}
                </Tag>
              ))}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-white/95 mb-2 line-clamp-1 group-hover:text-[#7c3aed] transition-colors">
              {lesson.title}
            </h3>

            {/* Time */}
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[#9aa6b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-[#9aa6b2]">{lesson.time}</span>
            </div>

            {/* Teacher */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/6">
              <img
                src={lesson.teacher.avatar}
                alt={lesson.teacher.name}
                className="w-6 h-6 rounded-full border border-white/6"
              />
              <span className="text-xs text-[#9aa6b2]">{lesson.teacher.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add to Calendar CTA */}
      <button
        className="w-full mt-4 py-2.5 rounded-lg border border-white/10 text-sm font-medium text-[#9aa6b2] hover:bg-white/5 hover:border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
        aria-label="Add to calendar"
      >
        + Add to Calendar
      </button>
    </Card>
  );
}
