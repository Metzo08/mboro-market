'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { getOpenState, type OpenState } from '@/lib/shop';
import type { OpeningHours } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Calculé côté client après montage pour éviter tout écart d'hydratation
 * entre l'heure du serveur et celle du téléphone de l'utilisateur.
 */
export function OpenStatus({
  hours,
  className,
}: {
  hours?: OpeningHours | null;
  className?: string;
}) {
  const [state, setState] = useState<OpenState | null>(null);

  useEffect(() => {
    setState(getOpenState(hours));
    const timer = window.setInterval(() => setState(getOpenState(hours)), 60_000);
    return () => window.clearInterval(timer);
  }, [hours]);

  if (!state) {
    return (
      <span className={cn('inline-flex h-5 w-24 animate-pulse rounded-full bg-sand', className)} aria-hidden="true" />
    );
  }

  const tone = state.state === 'open' ? 'success' : state.state === 'closed' ? 'danger' : 'outline';

  return (
    <Badge tone={tone} className={className}>
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          state.state === 'open' ? 'bg-success' : state.state === 'closed' ? 'bg-danger' : 'bg-muted',
        )}
      />
      {state.label}
    </Badge>
  );
}
