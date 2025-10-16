"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function TeacherCbcDashboardPage() {
	// Only allow teachers; ensure they are onboarded
	useDashboardProtection(['teacher']);

	return (
		<main className="min-h-screen p-6">
			<h1 className="text-2xl font-semibold">Teacher Dashboard - CBC</h1>
			<p className="text-slate-600 mt-2">Welcome back. Your CBC teaching tools will appear here.</p>
		</main>
	);
}
