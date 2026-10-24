'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'accent' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  as?: React.ElementType;
  href?: string;
}

function ButtonBase(
  { className, variant = 'default', size = 'default', as: Comp = 'button', href, ...rest }: ButtonProps,
  ref: React.Ref<HTMLButtonElement>,
) {

  const variants = {
    default: 'jt-btn-primary shadow-sm hover:shadow',
    accent: 'jt-btn-accent shadow-sm hover:shadow font-semibold',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'hover:bg-gray-100 text-gray-700',
    link: 'text-green-700 underline-offset-4 hover:underline',
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  };

  const resolvedProps = {
    ...rest,
    ref,
    className,
    variant,
    size,
    href: Comp === 'a' && href ? href : undefined,
  };

  return (
    <Comp
      {...resolvedProps}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
    />
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(ButtonBase);

Button.displayName = 'Button';

export { Button };
