"use client";

import React, { useState } from 'react';
import TutorChat from '@/components/CBCStudent/Classroom/tutor/TutorChat';
import TutorInput from '@/components/CBCStudent/Classroom/tutor/TutorInput';

export default function TutorPanel() {
  const [messages, setMessages] = useState<Array<{ id: number; role: 'user' | 'assistant'; text: string }>>([]);

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: Date.now(),
      role: 'user' as const,
      text: text
    };
    setMessages([...messages, newMessage]);
    // TODO: Add AI response logic here
  };

  return (
    <div className="flex flex-col h-full">
      {/* Simple header label */}
      <div className="pb-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/70">Your Personal AI Tutor</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide mt-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/40 text-sm text-center px-4">
            <p>Ask a question to get started with your AI tutor</p>
          </div>
        ) : (
          <TutorChat messages={messages} />
        )}
      </div>
      
      <TutorInput onSend={handleSendMessage} />
    </div>
  );
}
