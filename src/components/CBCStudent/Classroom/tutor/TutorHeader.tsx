"use client";

import React from 'react';

export default function TutorHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-[#A855F7]/10 flex items-center justify-center text-[#A855F7] font-bold">
          AI
        </div>
        <div>
          <h2 className="text-lg font-semibold">Your AI Tutor</h2>
          <p className="text-sm text-white/60">Ready to guide you through today’s lesson</p>
        </div>
      </div>
    </div>
  );
}
