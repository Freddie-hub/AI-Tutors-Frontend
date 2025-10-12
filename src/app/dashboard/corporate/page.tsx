'use client';

import { useAuthUser } from '@/lib/hooks';
import { authService } from '@/lib/auth';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function CorporateDashboard() {
  const { isLoading } = useDashboardProtection(['corporate-user']);
  const { user, profile } = useAuthUser();

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Corporate Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {profile?.displayName || user?.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Employee Learning Management</h2>
          <p className="text-gray-600">
            Enhance your workforce capabilities with AI-powered corporate learning solutions.
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Employees</h3>
              <p className="text-blue-700">0 enrolled</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Training Programs</h3>
              <p className="text-green-700">0 active</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Skill Development</h3>
              <p className="text-purple-700">Track progress</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">ROI Analytics</h3>
              <p className="text-orange-700">Measure impact</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}