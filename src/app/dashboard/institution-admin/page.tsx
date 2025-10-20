'use client';

import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function InstitutionAdminPage() {
  useDashboardProtection(['institution-admin']);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f14] via-[#0b1113] to-[#0a0f14] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white/95 mb-4">Institution Admin Dashboard</h1>
        <p className="text-[#9aa6b2]">Coming soon...</p>
      </div>
    </div>
  );
}
