"use client";

import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-5 bg-white/10 backdrop-blur-md text-white border-b border-white/10">
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-lg tracking-wide">Learning.ai</span>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-10 text-base font-medium">
        <a href="#" className="hover:text-orange-400 transition-colors">
          Home
        </a>
        <a href="#" className="hover:text-orange-400 transition-colors">
          About
        </a>
        <a href="#" className="hover:text-orange-400 transition-colors">
          Features
        </a>
        <a href="#" className="hover:text-orange-400 transition-colors">
          Contact Us
        </a>
      </div>
    </nav>
  );
}
