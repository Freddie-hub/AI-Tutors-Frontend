"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function UpskillingDashboardPage() {
	useDashboardProtection(['upskill-individual']);
	return (
		<main className="min-h-screen p-6">
			<h1 className="text-2xl font-semibold">Upskilling Dashboard</h1>
			<p className="text-slate-600 mt-2">Your upskilling journey starts here.</p>
		</main>
	);
}
