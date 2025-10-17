"use client";

import React from 'react';
import Card from '@/components/CBCStudent/shared/Card';
import Button from '@/components/ui/Button';

export default function LessonActions() {
  return (
    <Card className="rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="text-white/60 text-sm">Need help? Ask your AI tutor on the right.</div>
        <div className="flex items-center gap-3">
          <Button className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-4 py-2 rounded-xl font-medium shadow-[0_0_10px_rgba(168,85,247,0.15)]">
            Mark Complete
          </Button>
          <Button className="bg-transparent border border-white/10 hover:bg-white/5 text-white px-4 py-2 rounded-xl font-medium">
            Save Notes
          </Button>
        </div>
      </div>
    </Card>
  );
}
