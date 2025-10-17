"use client";

import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export default function Button({ asChild, className = '', ...props }: Props) {
  // Minimal, theme-friendly default styles; can be overridden via className
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#A855F7]/40 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed';
  return <button className={`${base} ${className}`} {...props} />;
}
