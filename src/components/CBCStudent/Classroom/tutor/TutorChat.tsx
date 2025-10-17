"use client";

import React from 'react';
import Card from '@/components/CBCStudent/shared/Card';

const messages = [
  { id: 1, role: 'assistant', text: 'Hello! I\'m your AI tutor. How can I help you with Algebra today?' },
  { id: 2, role: 'user', text: 'Can you explain how to simplify 3x + 2x?' },
  { id: 3, role: 'assistant', text: 'Sure! Combine like terms: 3x + 2x = 5x. You add the coefficients (3 + 2) and keep x.' },
];

export default function TutorChat() {
  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <Card key={m.id} className={`rounded-2xl ${m.role === 'assistant' ? 'bg-[#111113]' : 'bg-[#18181B]'}`}>
          <div className="text-sm leading-relaxed">{m.text}</div>
        </Card>
      ))}
    </div>
  );
}
