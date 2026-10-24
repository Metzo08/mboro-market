'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'secondary' | 'success' | 'destructive' | 'outline';
}

const variants = {
  default: 'bg-[#1B7A3D] text-white border-transparent',
  accent: 'bg-[#F59E0B] text-white border-transparent',
  secondary: 'bg-gray-100 text-gray-900 border-transparent',
  success: 'bg-green-50 text-green-700 border-green-200',
  destructive: 'bg-red-50 text-red-700 border-red-200',
  outline: 'border-gray-300 text-gray-700 bg-white',
} as const;

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

Badge.displayName = 'Badge';
