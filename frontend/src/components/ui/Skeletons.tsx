/**
 * Squelettes de chargement (CDC §3.2 : Skeleton loader pour listes produits).
 * Doit être visuellement identique aux cartes réelles pour éviter les CLS (§15.1 : CLS ≤ 0,1).
 */

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E2D6C4] bg-white overflow-hidden animate-pulse" aria-hidden="true">
      <div className="h-48 bg-[#F5EDE1]" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[#F5EDE1] rounded w-3/4" />
        <div className="h-3 bg-[#F5EDE1] rounded w-1/2" />
        <div className="h-5 bg-[#F5EDE1] rounded w-2/3" />
        <div className="h-9 bg-[#F5EDE1] rounded-xl w-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E2D6C4] bg-white overflow-hidden animate-pulse" aria-hidden="true">
      <div className="h-44 bg-[#F5EDE1]" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-[#F5EDE1]" />
          <div className="h-4 bg-[#F5EDE1] rounded w-2/3" />
        </div>
        <div className="h-3 bg-[#F5EDE1] rounded w-full" />
        <div className="h-3 bg-[#F5EDE1] rounded w-3/4" />
      </div>
    </div>
  );
}

/** État vide illustré avec CTA (CDC §3.2) */
export function EmptyState({
  emoji = '🛒',
  title,
  message,
  actionLabel,
  actionHref,
}: {
  emoji?: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border-2 border-dashed border-[#E2D6C4] bg-[#FFFBF5]">
      <div className="w-16 h-16 rounded-2xl bg-[#F5EDE1] flex items-center justify-center text-3xl mb-4" aria-hidden="true">
        {emoji}
      </div>
      <h3 className="text-lg font-bold text-[#2B2420] mb-1.5">{title}</h3>
      <p className="text-sm text-[#6B625A] max-w-sm mb-6">{message}</p>
      {actionLabel && actionHref && (
        <a href={actionHref} className="jt-btn-primary px-6 py-2.5 text-sm font-bold shadow-sm">
          {actionLabel}
        </a>
      )}
    </div>
  );
}
