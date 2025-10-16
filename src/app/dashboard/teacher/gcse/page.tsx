"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function TeacherGcseDashboardPage() {
	useDashboardProtection(['teacher']);
	return (
		<main className="min-h-screen p-6">
			<h1 className="text-2xl font-semibold">Teacher Dashboard - GCSE</h1>
			<p className="text-slate-600 mt-2">GCSE tools coming soon.</p>
		</main>
	);
}
