'use client';

import React, { useState } from 'react';

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-white/6 bg-[#0e1316]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0e1316]/80 sticky top-0 z-30">
      {/* Left: Greeting */}
      <div>
        <h1 className="text-lg font-semibold text-white/95">Welcome back, Nova Taya</h1>
      </div>

      {/* Center: Search */}
  <div className="max-w-[640px] w-full mx-4 sm:mx-8">
        <div className="rounded-full bg-[#0b1113] px-4 py-2 flex items-center gap-3 border border-white/6">
          {/* Search Icon */}
          <svg className="w-5 h-5 text-[#9aa6b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          {/* Input */}
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white/90 placeholder-[#9aa6b2] focus:outline-none"
            aria-label="Search"
          />
          
          {/* Mic Icon */}
          <svg className="w-5 h-5 text-[#9aa6b2] cursor-pointer hover:text-white/90 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
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
