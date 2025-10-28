"use client";

import Button from "@/components/ui/Button";
import { PlusCircle } from "lucide-react";
import { AddCourseModal } from "./AddCourseModal";

export function EmptyCoursesState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <h2 className="text-2xl font-semibold">No Courses Yet</h2>
      <p className="text-muted-foreground max-w-sm">
        Start your learning journey by creating or generating a new course.
      </p>
      <AddCourseModal>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add a Course
        </Button>
      </AddCourseModal>
    </div>
  );
}
