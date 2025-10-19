"use client";

import ClassroomLayout from '@/components/GCSEStudent/Classroom/layout/ClassroomLayout';
import DashboardLayout from '@/components/GCSEStudent/layout/DashboardLayout';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function ClassroomPage() {
  // Keep dashboard protection for student roles
  useDashboardProtection(['individual-student', 'institution-student']);

  return (
    <DashboardLayout active="Classroom">
      <ClassroomLayout />
    </DashboardLayout>
  );
}
