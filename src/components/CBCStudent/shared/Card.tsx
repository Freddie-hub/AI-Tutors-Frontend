import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[#0e1316] rounded-2xl p-6 border border-white/6 shadow-sm overflow-hidden min-w-0 ${className}`}>
      {children}
    </div>
  );
}
