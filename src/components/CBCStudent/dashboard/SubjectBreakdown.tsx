import React from 'react';
import Card from '../shared/Card';

interface Subject {
  name: string;
  icon: string;
  hours: number;
  lessons: number;
  color: string;
  completion: number;
}

export default function SubjectBreakdown() {
  const subjects: Subject[] = [
    {
      name: 'Mathematics',
      icon: '📐',
      hours: 18,
      lessons: 24,
      color: '#7c3aed',
      completion: 75
    },
    {
      name: 'English',
      icon: '📖',
      hours: 12,
      lessons: 18,
      color: '#06b6d4',
      completion: 60
    },
    {
      name: 'Science',
      icon: '🔬',
      hours: 9,
      lessons: 15,
      color: '#10b981',
      completion: 45
    },
    {
      name: 'Social Studies',
      icon: '🌍',
      hours: 7,
      lessons: 12,
      color: '#f59e0b',
      completion: 35
    },
    {
      name: 'Kiswahili',
      icon: '📚',
      hours: 6,
      lessons: 10,
      color: '#ec4899',
      completion: 50
    }
  ];

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white/95">Subject Breakdown</h2>
        <button
          className="text-xs text-[#7c3aed] hover:text-[#a855f7] font-medium focus:outline-none"
          aria-label="View all subjects"
        >
          View All
        </button>
      </div>

      {/* Subject List */}
      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 flex-1">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${subject.color}20` }}
                >
                  {subject.icon}
                </div>
                
                {/* Subject Info */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90">{subject.name}</p>
                  <p className="text-xs text-[#9aa6b2]">{subject.lessons} lessons</p>
                </div>
              </div>
              
              {/* Hours */}
              <div className="text-right">
                <p className="text-sm font-semibold text-white/90">{subject.hours}h</p>
                <p className="text-xs text-[#9aa6b2]">{subject.completion}%</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#0b0f12] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${subject.completion}%`,
                  backgroundColor: subject.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
