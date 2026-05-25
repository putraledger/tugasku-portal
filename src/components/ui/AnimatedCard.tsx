'use client';

import React from 'react';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number; // Animation delay in ms
  glass?: boolean;
}

export default function AnimatedCard({
  children,
  delay = 0,
  glass = false,
  className = '',
  ...props
}: AnimatedCardProps) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`premium-card animate-slideUp border border-slate-200 hover:border-indigo-200 dark:border-slate-700 dark:hover:border-slate-600 transition-all duration-300 shadow-sm hover:shadow-md ${
        glass ? 'glass-effect' : 'bg-white dark:bg-slate-800/80'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
export { AnimatedCard };
