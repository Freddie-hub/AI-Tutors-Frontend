import { Button } from "@/components/ui/Button";
import { PlusCircle } from "lucide-react";
import { CourseCard } from "@/components/CBCStudent/courses/CourseCard";
import { EmptyCoursesState } from "@/components/CBCStudent/courses/EmptyCoursesState";
import { AddCourseModal } from "@/components/CBCStudent/courses/AddCourseModal";

const mockCourses = [
  {
    id: "math101",
    title: "Mathematics Mastery",
    description: "A foundational course to strengthen math skills.",
    progress: 65,
    thumbnail: "/images/math.jpg",
  },
  {
    id: "sci101",
    title: "Science Essentials",
    description: "Learn the key principles of physics, chemistry, and biology.",
    progress: 30,
    thumbnail: "/images/science.jpg",
  },
];

export default function CoursesPage() {
  const hasCourses = mockCourses.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <AddCourseModal>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Course
          </Button>
        </AddCourseModal>
      </div>

      {hasCourses ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <EmptyCoursesState />
      )}
    </div>
  );
}

