import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone = 'neutral' | 'teal' | 'terracotta' | 'success' | 'danger' | 'gold' | 'outline';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-sand text-ink',
  teal: 'bg-teal/10 text-teal',
  terracotta: 'bg-terracotta/10 text-terracotta-dark',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  gold: 'bg-gold/15 text-[#8a5a10]',
  outline: 'border border-line bg-transparent text-muted',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: React.ReactNode;
}

export function Badge({ className, tone = 'neutral', icon, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

