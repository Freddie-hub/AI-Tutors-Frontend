"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseProgressBar } from "@/components/CBCStudent/courses/CourseProgressBar";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    progress: number;
    thumbnail: string;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/dashboard/student/cbc/courses/${course.id}`}>
      <Card className="hover:shadow-md transition-all overflow-hidden cursor-pointer">
        <div className="relative h-40 w-full">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>

        <CardHeader>
          <CardTitle className="text-lg">{course.title}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {course.description}
          </p>
          <CourseProgressBar progress={course.progress} />
        </CardContent>
      </Card>
    </Link>
  );
}
