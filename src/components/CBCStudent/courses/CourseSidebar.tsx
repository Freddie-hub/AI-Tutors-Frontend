// src/components/CBCStudent/courses/CourseSidebar.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  completed: boolean;
}

interface Topic {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseSidebarProps {
  topics: Topic[];
}

export function CourseSidebar({ topics }: CourseSidebarProps) {
  const [openTopic, setOpenTopic] = useState<string | null>(topics[0]?.id ?? null);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Course Topics</h2>

      <div className="space-y-2">
        {topics.map((topic) => {
          const isOpen = openTopic === topic.id;
          return (
            <div key={topic.id} className="border rounded-lg bg-muted/30">
              <button
                onClick={() => setOpenTopic(isOpen ? null : topic.id)}
                className="flex items-center justify-between w-full px-3 py-2 text-left font-medium hover:bg-muted/50 transition"
              >
                <span>{topic.title}</span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {isOpen && (
                <div className="space-y-1 px-3 pb-3 pt-1">
                  {topic.lessons.map((lesson) => (
                    <Link
                      href={`/dashboard/student/cbc/classroom/${lesson.id}`}
                      key={lesson.id}
                      className={cn(
                        "flex items-center gap-2 text-sm rounded-md px-2 py-1.5 transition hover:bg-accent",
                        lesson.completed ? "text-muted-foreground line-through" : "text-foreground"
                      )}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                      )}
                      {lesson.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
