import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', invalid = false, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex h-11 w-full rounded-sm border bg-white px-3 py-2 text-body text-ink placeholder:text-muted/70',
          'transition-colors focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/25',
          'disabled:cursor-not-allowed disabled:bg-sand disabled:opacity-70',
          invalid ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/20' : 'border-line',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Libellé + aide + erreur : un seul endroit pour l'accessibilité des formulaires. */
export function Field({ label, htmlFor, hint, error, required, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-small font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-caption text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export { Input };

