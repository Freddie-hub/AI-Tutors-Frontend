"use client";

import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function Page() {
  // Allow only student-type roles that are onboarded
  useDashboardProtection(['individual-student', 'institution-student']);

  return (
    <DashboardLayout active="Classroom">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white text-xl font-semibold">This is the classroom page</h1>
      </div>
    </DashboardLayout>
  );
}
