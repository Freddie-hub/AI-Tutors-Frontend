"use client";

import ClassroomLayout from '@/components/Upskill/Classroom/layout/ClassroomLayout';
import DashboardLayout from '@/components/Upskill/layout/DashboardLayout';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function ClassroomPage() {
  // Keep dashboard protection for upskill-individual role
  useDashboardProtection(['upskill-individual']);

  return (
    <DashboardLayout active="Classroom">
      <ClassroomLayout />
    </DashboardLayout>
  );
}
