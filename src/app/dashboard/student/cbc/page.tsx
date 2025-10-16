"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function Page() {
    // Allow student-type roles only; must be onboarded
    useDashboardProtection(['individual-student', 'institution-student']);

    return <main className="min-h-screen p-6">Student Dashboard - CBC</main>;
}