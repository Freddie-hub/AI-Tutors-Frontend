import React from 'react';
import Card from '../shared/Card';
import ProgressCircle from '../shared/ProgressCircle';

export default function ProgressSummary() {
  const progressData = [
    {
      value: 75,
      label: 'In Progress',
      count: 34,
      color: '#7c3aed'
    },
    {
      value: 45,
      label: 'Completed',
      count: 72,
      color: '#06b6d4'
    },
    {
      value: 58,
      label: 'Upcoming',
      count: 18,
      color: '#f59e0b'
    }
  ];

  return (
    <Card>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white/95">Progress</h2>
        <p className="text-sm text-[#9aa6b2] mt-1">Your learning journey</p>
      </div>

      {/* Progress Circles */}
      <div className="flex items-center justify-around mb-8">
        {progressData.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <ProgressCircle
              value={item.value}
              size={110}
              strokeWidth={8}
              color={item.color}
            />
            <p className="text-sm font-medium text-white/90 mt-4">{item.label}</p>
            <p className="text-xs text-[#9aa6b2] mt-1">{item.count} courses</p>
          </div>
        ))}
      </div>

      {/* Summary Badges */}
      <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7c3aed]"></div>
          <span className="text-xs text-[#9aa6b2]">34 In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#06b6d4]"></div>
          <span className="text-xs text-[#9aa6b2]">72 Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
          <span className="text-xs text-[#9aa6b2]">18 Upcoming</span>
        </div>
      </div>
    </Card>
  );
}
