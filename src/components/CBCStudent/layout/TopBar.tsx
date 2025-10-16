'use client';

import React, { useEffect, useState } from 'react';
import { useAuthUser } from '@/lib/hooks';

export default function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile } = useAuthUser();

  const displayName = profile?.displayName || user?.displayName || 'Student';
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    // Initialize state in case the page is already scrolled
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`h-16 flex items-center justify-between px-6 border-b border-white/6 sticky top-0 z-30 transition-colors duration-300 ${
        scrolled ? 'bg-[#0b1113]/70 backdrop-blur-md' : 'bg-[#0b1113]/30 backdrop-blur'
      }`}
    >
      {/* Left: Welcome + Date */}
      <div className="mx-2 sm:mx-4">
        <div className="flex items-center gap-3 leading-tight">
          <span className="text-white/95 text-sm sm:text-base font-semibold">Welcome back, {displayName}</span>
          <span className="inline-block h-4 w-px bg-white/15" aria-hidden="true"></span>
          <span className="text-[#9aa6b2] text-xs sm:text-sm font-medium">{formattedDate}</span>
        </div>
      </div>

      {/* Right: Icon Cluster */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          className="w-9 h-9 rounded-lg bg-[#0b1113] border border-white/6 flex items-center justify-center hover:border-white/12 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Toggle theme"
        >
          <svg className="w-5 h-5 text-[#9aa6b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-lg bg-[#0b1113] border border-white/6 flex items-center justify-center hover:border-white/12 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5 text-[#9aa6b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Notification dot */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <button
          className="w-9 h-9 rounded-lg bg-[#0b1113] border border-white/6 flex items-center justify-center hover:border-white/12 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Settings"
        >
          <svg className="w-5 h-5 text-[#9aa6b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full border-2 border-white/6 overflow-hidden">
          <img
            src="https://i.pravatar.cc/150?img=25"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
