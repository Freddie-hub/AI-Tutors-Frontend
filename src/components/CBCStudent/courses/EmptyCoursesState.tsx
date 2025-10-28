"use client";

import Button from "@/components/ui/Button";
import { PlusCircle } from "lucide-react";
import { AddCourseModal } from "./AddCourseModal";

export function EmptyCoursesState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <div className="text-6xl mb-4">📚</div>
      <h2 className="text-2xl font-semibold text-white/95">No Courses Yet</h2>
      <p className="text-[#9aa6b2] max-w-sm">
        Start your learning journey by creating or generating a new course.
      </p>
      <AddCourseModal>
        <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add a Course
        </Button>
      </AddCourseModal>
    </div>
  );
}
