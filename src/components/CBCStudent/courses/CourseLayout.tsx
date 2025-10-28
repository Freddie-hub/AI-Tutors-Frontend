// src/components/CBCStudent/courses/CourseLayout.tsx
"use client";

import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CourseLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

export function CourseLayout({ sidebar, content }: CourseLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-muted/10 rounded-2xl overflow-hidden shadow-sm">
      <aside className="hidden md:flex w-72 border-r bg-background flex-col">
        <ScrollArea className="flex-1">{sidebar}</ScrollArea>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 bg-background">
        {content}
      </main>
    </div>
  );
}
