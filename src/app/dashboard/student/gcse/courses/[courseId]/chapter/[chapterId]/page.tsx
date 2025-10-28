"use client";

import { use, useEffect, useState } from 'react';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import { useChapterLesson } from '@/hooks/useChapterLesson';
import DashboardLayout from '@/components/GCSEStudent/layout/DashboardLayout';
import Button from "@/components/ui/Button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import LessonContent from "@/components/GCSEStudent/Classroom/LessonContent";

interface ChapterLessonPageProps {
  params: Promise<{ courseId: string; chapterId: string }>;
}

export default function ChapterLessonPage({ params }: ChapterLessonPageProps) {
  useDashboardProtection(['individual-student', 'institution-student']);
  
  const { courseId, chapterId } = use(params);
  const router = useRouter();
  const [showLesson, setShowLesson] = useState(false);

  const { 
    chapter, 
    lesson, 
    isLoadingChapter, 
    isGeneratingLesson,
    error,
    generateLesson,
    markComplete 
  } = useChapterLesson(courseId, chapterId);

  // Auto-generate lesson if not exists
  useEffect(() => {
    if (chapter && !lesson && !isGeneratingLesson && !error) {
      generateLesson();
    }
  }, [chapter, lesson, isGeneratingLesson, error]);

  // Show lesson once it's loaded
  useEffect(() => {
    if (lesson) {
      setShowLesson(true);
    }
  }, [lesson]);

  const handleComplete = async () => {
    await markComplete();
  router.push(`/dashboard/student/gcse/courses/${courseId}`);
  };

  if (isLoadingChapter) {
    return (
      <DashboardLayout active="Courses">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white/70">Loading chapter...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !chapter) {
    return (
      <DashboardLayout active="Courses">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-white/70">{error || 'Chapter not found'}</div>
            <Button onClick={() => router.back()} variant="secondary">
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isGeneratingLesson) {
    return (
      <DashboardLayout active="Courses">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-12 w-12 text-[#7c3aed] animate-spin" />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white/95 mb-2">
                Generating Your Lesson
              </h3>
              <p className="text-[#9aa6b2]">
                Our AI is creating a comprehensive lesson for {chapter.title}...
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!showLesson || !lesson) {
    return (
      <DashboardLayout active="Courses">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white/70">Preparing lesson...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout active="Courses">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button
              onClick={() => router.push(`/dashboard/student/gcse/courses/${courseId}`)}
              variant="secondary"
              className="bg-white/5 hover:bg-white/10 text-white border-white/10 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white/95 mb-1">{chapter.title}</h1>
              <p className="text-[#9aa6b2] text-sm">{chapter.subject}</p>
            </div>
          </div>
          
          {!chapter.completed && (
            <Button
              onClick={handleComplete}
              className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
            >
              Mark as Complete
            </Button>
          )}
        </div>

        {/* Lesson Content */}
        <LessonContent lesson={lesson} />

        {/* Bottom Action */}
        <div className="flex justify-center pt-6 border-t border-white/10">
          {!chapter.completed ? (
            <Button
              onClick={handleComplete}
              size="lg"
              className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
            >
              Complete Chapter & Continue
            </Button>
          ) : (
            <Button
              onClick={() => router.push(`/dashboard/student/gcse/courses/${courseId}`)}
              size="lg"
              variant="secondary"
              className="bg-white/5 hover:bg-white/10 text-white border-white/10"
            >
              Back to Course
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
