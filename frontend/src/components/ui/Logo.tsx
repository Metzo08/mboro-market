import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5', className)} aria-label="JëndCiThiès — accueil">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-md bg-terracotta font-display text-lg font-bold text-white shadow-card">
        J
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-canvas bg-gold" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-lg font-semibold tracking-tight text-ink">JëndCiThiès</span>
          <span className="mt-0.5 block text-caption font-medium text-muted">par Sen-E-Carte</span>
        </span>
      )}
    </Link>
  );
}
