"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface TutorInputProps {
  onSend: (text: string) => void;
}

export default function TutorInput({ onSend }: TutorInputProps) {
  const [text, setText] = useState('');

  const send = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <div className="flex items-center gap-2 bg-white/5 border border-white/20 rounded-xl p-1.5 backdrop-blur-sm hover:border-purple-500/50 transition-colors duration-200">
        <button
          className="shrink-0 w-8 h-8 grid place-items-center rounded-lg bg-white/5 hover:bg-purple-600/30 text-white/80 hover:text-purple-400 transition-all duration-200"
          title="Voice Input"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M19 11v1a7 7 0 0 1-14 0v-1" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 19v3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && text.trim() && send()}
          placeholder="Ask me anything..."
          className="flex-1 bg-transparent outline-none text-sm px-2 placeholder:text-white/40 text-white"
        />

        <Button
          onClick={send}
          disabled={!text.trim()}
          className="shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 text-white rounded-lg px-3 py-1.5 shadow-lg shadow-purple-500/25 transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2 11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      </div>
      <p className="text-[10px] text-white/30 mt-1.5 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        AI may make mistakes. Verify important information.
      </p>
    </div>
  );
}
