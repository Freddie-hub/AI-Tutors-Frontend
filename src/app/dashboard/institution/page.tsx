"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function InstitutionDashboardPage() {
	useDashboardProtection(['institution-admin']);
	return (
		<main className="min-h-screen p-6">
			<h1 className="text-2xl font-semibold">Institution Admin Dashboard</h1>
			<p className="text-slate-600 mt-2">Manage your institution here.</p>
		</main>
	);
}
