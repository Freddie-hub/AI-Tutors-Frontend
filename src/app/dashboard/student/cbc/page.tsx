"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import LearningOverviewCard from '@/components/CBCStudent/dashboard/LearningOverviewCard';
import ProgressSummary from '@/components/CBCStudent/dashboard/ProgressSummary';
import UpcomingLessons from '@/components/CBCStudent/dashboard/UpcomingLessons';

export default function Page() {
    // Allow student-type roles only; must be onboarded
    useDashboardProtection(['individual-student', 'institution-student']);

    return (
        <DashboardLayout active="Dashboard">
            {/*
              Dashboard grid:
              - max-w-7xl keeps line length readable on wide screens
              - items-start prevents equal-height stretching of cards
              - min-w-0 on columns avoids overflow from wide content (e.g., charts)
            */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 lg:auto-rows-fr gap-6 items-start">
                {/* Left: Activity column (spans two rows) */}
                <div className="lg:col-span-5 lg:row-span-2 space-y-6 min-w-0">
                    <LearningOverviewCard />
                </div>

                {/* Right: Two cards stacked to match Activity height */}
                <div className="lg:col-span-7 space-y-6 min-w-0">
                    {/* Top: Progress Summary fills remaining width */}
                    <ProgressSummary />
                    {/* Bottom: Upcoming Lessons */}
                    <UpcomingLessons />
                </div>
            </div>
        </DashboardLayout>
    );
}