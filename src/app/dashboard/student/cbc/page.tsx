"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import LearningOverviewCard from '@/components/CBCStudent/dashboard/LearningOverviewCard';
import SubjectBreakdown from '@/components/CBCStudent/dashboard/SubjectBreakdown';
import ProgressSummary from '@/components/CBCStudent/dashboard/ProgressSummary';
import UpcomingLessons from '@/components/CBCStudent/dashboard/UpcomingLessons';
import ContinueLearningCard from '@/components/CBCStudent/dashboard/ContinueLearningCard';

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
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column */}
                <div className="lg:col-span-5 space-y-6 min-w-0">
                    <LearningOverviewCard />
                    <SubjectBreakdown />
                </div>

                {/* Middle Column */}
                <div className="lg:col-span-4 space-y-6 min-w-0">
                    <ProgressSummary />
                    <UpcomingLessons />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-3 min-w-0">
                    <ContinueLearningCard />
                </div>
            </div>
        </DashboardLayout>
    );
}