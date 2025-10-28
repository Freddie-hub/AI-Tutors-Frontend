"use client";

import React from 'react';

type Variant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg' | 'icon';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: Variant;
  size?: Size;
};

export default function Button({
  asChild,
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}: Props) {
  // Minimal, theme-friendly default styles; can be overridden via className
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-colors focus:outline-none focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed';

  const variantClasses: Record<Variant, string> = {
    default: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'bg-secondary text-secondary-foreground hover:opacity-90',
    destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizeClasses: Record<Size, string> = {
    sm: 'h-8 px-3 py-1.5 text-xs rounded-xl',
    md: 'h-9 px-4 py-2',
    lg: 'h-10 px-5 py-2.5 text-base',
    icon: 'h-9 w-9 p-0',
  };

  return (
    <button
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
