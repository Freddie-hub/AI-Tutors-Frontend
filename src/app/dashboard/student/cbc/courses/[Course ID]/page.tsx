import { CourseLayout } from "@/components/CBCStudent/courses/CourseLayout";
import { CourseSidebar } from "@/components/CBCStudent/courses/CourseSidebar";
import { CourseOverview } from "@/components/CBCStudent/courses/CourseOverview";

// Mock data for demo purposes
const mockCourse = {
  id: "math101",
  title: "Mathematics Mastery",
  description: "Build a strong foundation in algebra, geometry, and arithmetic.",
  progress: 65,
  topics: [
    {
      id: "algebra",
      title: "Algebra Basics",
      lessons: [
        { id: "l1", title: "Introduction to Variables", completed: true },
        { id: "l2", title: "Solving Linear Equations", completed: false },
      ],
    },
    {
      id: "geometry",
      title: "Geometry Essentials",
      lessons: [
        { id: "l3", title: "Understanding Angles", completed: false },
        { id: "l4", title: "Triangles and Polygons", completed: false },
      ],
    },
  ],
};

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  const course = mockCourse; // In a real app, fetch from API using params.courseId

  return (
    <CourseLayout
      sidebar={<CourseSidebar topics={course.topics} />}
      content={<CourseOverview course={course} />}
    />
  );
}