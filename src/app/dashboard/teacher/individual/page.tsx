"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function TeacherOtherDashboardPage() {
	useDashboardProtection(['teacher']);
	return (
		<main className="min-h-screen p-6">
			<h1 className="text-2xl font-semibold">Teacher Dashboard - Other Curriculum</h1>
			<p className="text-slate-600 mt-2">Your general teaching tools will appear here.</p>
		</main>
	);
}
