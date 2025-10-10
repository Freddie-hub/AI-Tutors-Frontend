"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-5 transition-all duration-500
      ${isScrolled ? "bg-black/50 backdrop-blur-md border-b border-white/10" : "bg-transparent border-transparent"}`}
    >
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-lg tracking-wide">Learning.ai</span>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-10 text-base font-medium">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <a
              key={link.name}
              href={link.href}
              className={`relative transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:transition-all after:duration-300
                ${
                  isActive
                    ? "text-orange-400 after:w-full after:bg-orange-400"
                    : "text-white hover:text-orange-400 after:w-0 hover:after:w-full after:bg-orange-400"
                }`}
            >
              {link.name}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
