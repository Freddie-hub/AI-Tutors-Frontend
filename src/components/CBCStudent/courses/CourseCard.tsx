"use client";

import Image from "next/image";
import Link from "next/link";
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
      <div className="relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all hover:ring-[#7c3aed]/20 hover:shadow-[0_8px_32px_rgba(124,58,237,0.25)]">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f14] via-transparent to-transparent opacity-60"></div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-semibold text-white/95 mb-2">{course.title}</h3>
          <p className="text-sm text-[#9aa6b2] line-clamp-2 mb-4">
            {course.description}
          </p>
          <CourseProgressBar progress={course.progress} />
        </div>
      </div>
    </Link>
  );
}
