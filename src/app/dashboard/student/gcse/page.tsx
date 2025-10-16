"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function StudentGcseDashboardPage() {
	useDashboardProtection(['individual-student', 'institution-student']);
	return (
		<main className="min-h-screen p-6">Student Dashboard - GCSE</main>
	);
}
