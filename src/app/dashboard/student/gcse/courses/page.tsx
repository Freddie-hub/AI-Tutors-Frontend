"use client";

import  GCSECoursesPage from '@/components/GCSEStudent/courses/layout/courses';
import DashboardLayout from '@/components/GCSEStudent/layout/DashboardLayout';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function ClassroomPage() {
  // Keep dashboard protection for student roles
  useDashboardProtection(['individual-student', 'institution-student']);

  return (
    <DashboardLayout active="Courses">
      <GCSECoursesPage />
    </DashboardLayout>
  );
}
