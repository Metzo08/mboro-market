import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-terracotta text-white shadow-card hover:bg-terracotta-dark active:scale-[0.98] disabled:hover:bg-terracotta',
  secondary:
    'bg-teal text-white shadow-card hover:bg-teal/90 active:scale-[0.98] disabled:hover:bg-teal',
  tertiary:
    'border border-line bg-canvas text-ink hover:border-teal hover:text-teal active:scale-[0.98]',
  danger:
    'bg-danger text-white shadow-card hover:bg-danger/90 active:scale-[0.98] disabled:hover:bg-danger',
  ghost: 'text-ink hover:bg-sand',
  link: 'text-terracotta-dark underline underline-offset-4 hover:text-terracotta',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-small gap-1.5',
  md: 'h-11 px-5 text-small gap-2',
  lg: 'h-12 px-6 text-body gap-2',
  icon: 'h-10 w-10',
};

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150',
    'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55',
    variants[variant],
    sizes[size],
    className,
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type ?? 'button'}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };

