"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

export default function TutorInput() {
  const [text, setText] = useState('');

  const send = () => {
    setText('');
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 bg-[#0E0E10] border border-white/10 rounded-2xl p-2 shadow-md shadow-black/20">
        <button
          className="shrink-0 w-10 h-10 grid place-items-center rounded-xl bg-white/5 hover:bg-white/10 text-white/80"
          title="Voice"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M19 11v1a7 7 0 0 1-14 0v-1" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 19v3" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask something about your lesson..."
          className="flex-1 bg-transparent outline-none text-sm px-2 placeholder:text-white/40"
        />

        <Button
          onClick={send}
          disabled={!text.trim()}
          className="shrink-0 bg-[#A855F7] hover:bg-[#9333EA] text-white rounded-xl px-4 py-2 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
        >
          <span className="sr-only">Send</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2 11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      </div>
      <p className="text-[11px] text-white/40 mt-1">AI may make mistakes. Verify important information.</p>
    </div>
  );
}
