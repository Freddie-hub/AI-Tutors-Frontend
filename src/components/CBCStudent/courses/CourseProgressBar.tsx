"use client";

import { Progress } from "@/components/ui/progress";

interface CourseProgressBarProps {
  progress: number;
}

export function CourseProgressBar({ progress }: CourseProgressBarProps) {
  return (
    <Progress value={progress} className="h-2 bg-muted" />
  );
}
