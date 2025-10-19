"use client";

import React from 'react';

export default function AgentWorking() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center h-full min-h-[300px] rounded-xl border border-white/10 bg-gradient-to-br from-[#0E0E10] to-[#141417]">
      <div className="flex items-center gap-3 text-white/80">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-80" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span className="text-sm">Agent is working…</span>
      </div>
      <p className="mt-2 text-xs text-white/50">Crafting your lesson, this may take a few seconds.</p>
    </div>
  );
}
