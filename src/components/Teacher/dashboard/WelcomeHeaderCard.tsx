'use client';

import React from 'react';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';

export default function WelcomeHeaderCard() {
  const { teacherProfile, isCBC, isGCSE } = useTeacherProfile();

  const getCurriculumBadge = () => {
    if (isCBC) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <span className="text-lg">🇰🇪</span>
          <span className="text-sm font-medium text-green-400">CBC Curriculum</span>
        </div>
      );
    }
    if (isGCSE) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <span className="text-lg">🇬🇧</span>
          <span className="text-sm font-medium text-blue-400">GCSE Curriculum</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <span className="text-lg">📚</span>
        <span className="text-sm font-medium text-purple-400">{teacherProfile.curriculum}</span>
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0b0f12] via-[#0d1318] to-[#0b0f12] p-6 border border-white/10 ring-1 ring-white/5 mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white/95 mb-2">
            Welcome back, {teacherProfile.name}! 👋
          </h1>
          <p className="text-sm text-[#9aa6b2] mb-4">
            Ready to inspire minds today? Let's create something amazing.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {getCurriculumBadge()}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
              <span className="text-sm text-[#9aa6b2]">Subject:</span>
              <span className="text-sm font-medium text-white/90">{teacherProfile.subject}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
              <span className="text-sm text-[#9aa6b2]">School:</span>
              <span className="text-sm font-medium text-white/90">{teacherProfile.school}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-[#9aa6b2] mb-1">Teaching Experience</div>
          <div className="text-3xl font-bold text-white/95">{teacherProfile.yearsExperience}</div>
          <div className="text-xs text-[#9aa6b2]">years</div>
        </div>
      </div>
    </div>
  );
}
