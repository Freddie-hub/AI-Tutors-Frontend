// src/components/CBCStudent/courses/CourseOverview.tsx
"use client";

import { Button } from "@/components/ui/button";
import { CourseProgressBar } from "@/components/CBCStudent/courses/CourseProgressBar";

interface CourseOverviewProps {
  course: {
    id: string;
    title: string;
    description: string;
    progress: number;
  };
}

export function CourseOverview({ course }: CourseOverviewProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground mt-2">{course.description}</p>
      </div>

      <div className="space-y-2">
        <CourseProgressBar progress={course.progress} />
        <p className="text-sm text-muted-foreground">
          {course.progress}% completed
        </p>
      </div>

      <Button size="lg" className="mt-4">
        Continue Learning
      </Button>
    </div>
  );
}
