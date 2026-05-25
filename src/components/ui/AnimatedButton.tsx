'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'gradient' | 'outline' | 'glass' | 'danger';
  loading?: boolean;
  success?: boolean;
}

export default function AnimatedButton({
  children,
  variant = 'gradient',
  loading = false,
  success = false,
  className = '',
  ...props
}: AnimatedButtonProps) {
  let variantClasses = '';
  
  if (variant === 'gradient') {
    variantClasses = 'premium-btn-gradient';
  } else if (variant === 'outline') {
    variantClasses = 'bg-transparent border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white';
  } else if (variant === 'glass') {
    variantClasses = 'glass-effect text-slate-700 dark:text-slate-200 hover:bg-white/10 dark:hover:bg-slate-950/20';
  } else if (variant === 'danger') {
    variantClasses = 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/20';
  }

  return (
    <button
      disabled={loading || props.disabled}
      className={`relative inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold select-none transition-all duration-300 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
        success ? 'animate-bounce-success' : ''
      } ${variantClasses} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
export { AnimatedButton };
