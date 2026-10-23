import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * État vide : illustration légère (motif de marque) + message + action.
 * Jamais de page blanche silencieuse (cf. §15.3).
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'motif-bogolan flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-sand/40 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="mb-3 rounded-full bg-white p-3 text-terracotta shadow-card">{icon}</div>}
      <h3 className="text-h3 font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-small text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
