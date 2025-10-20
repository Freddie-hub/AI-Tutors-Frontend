'use client';

import { useAuthUser } from '@/lib/hooks';

export interface TeacherProfile {
  name: string;
  subject: string;
  curriculum: string;
  school: string;
  yearsExperience: string;
}

export function useTeacherProfile() {
  const { user, profile } = useAuthUser();
  
  // Mock data for now - will be replaced with real profile data
  const teacherProfile: TeacherProfile = {
    name: profile?.displayName || user?.displayName || 'Teacher',
    subject: 'Mathematics',
    curriculum: 'CBC', // Will be 'CBC', 'GCSE', or custom like 'IB', 'American', etc.
    school: 'Sample High School',
    yearsExperience: '5'
  };
  
  const isCBC = teacherProfile.curriculum === 'CBC';
  const isGCSE = teacherProfile.curriculum === 'GCSE';
  const isCurriculumBased = ['CBC', 'GCSE'].includes(teacherProfile.curriculum);
  
  return {
    teacherProfile,
    isCBC,
    isGCSE,
    isCurriculumBased,
  };
}
