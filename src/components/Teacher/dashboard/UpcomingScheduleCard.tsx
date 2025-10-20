'use client';

import React from 'react';
import Card from '../shared/Card';

interface ScheduleItem {
  id: string;
  class: string;
  subject: string;
  time: string;
  grade: string;
  room?: string;
}

export default function UpcomingScheduleCard() {
  // Mock data - will be replaced with real data
  const schedule: ScheduleItem[] = [
    {
      id: '1',
      class: 'Mathematics A',
      subject: 'Algebra',
      time: '09:00 AM - 10:00 AM',
      grade: 'Grade 10',
      room: 'Room 204',
    },
    {
      id: '2',
      class: 'Mathematics B',
      subject: 'Geometry',
      time: '11:00 AM - 12:00 PM',
      grade: 'Grade 9',
      room: 'Room 204',
    },
    {
      id: '3',
      class: 'Mathematics C',
      subject: 'Calculus',
      time: '02:00 PM - 03:00 PM',
      grade: 'Grade 11',
      room: 'Room 305',
    },
  ];

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white/95">Today's Schedule</h2>
          <p className="text-sm text-[#9aa6b2] mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="text-xs text-[#7c3aed] hover:text-[#9333ea] font-medium transition-colors">
          Full Schedule →
        </button>
      </div>

      <div className="space-y-3">
        {schedule.map((item, index) => (
          <div
            key={item.id}
            className="group rounded-xl bg-[#0b0f12] p-4 border border-white/8 ring-1 ring-white/5 hover:border-white/15 hover:bg-[#0d1318] transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            {/* Timeline indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7c3aed] to-[#06b6d4]" />
            
            <div className="pl-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white/95 group-hover:text-[#7c3aed] transition-colors duration-300 mb-1">
                    {item.class}
                  </h3>
                  <p className="text-xs text-[#9aa6b2]">{item.subject}</p>
                </div>
                {item.room && (
                  <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-[#9aa6b2] shrink-0">
                    {item.room}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-[#9aa6b2]">
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{item.time}</span>
                </div>
                <span>•</span>
                <span>{item.grade}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {schedule.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-sm text-[#9aa6b2]">No classes scheduled for today</p>
        </div>
      )}
    </Card>
  );
}
