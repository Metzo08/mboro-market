'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  basePath: string;
  /** Paramètres de recherche à préserver (ex: ?q=ceeb&category=... */
  extraParams?: Record<string, string>;
  /** Ne rien afficher si une seule page */
  hideIfSingle?: boolean;
}

/**
 * Pagination URL-based (SSR-friendly, CDC §8.7 : anti-duplication de pages).
 * Préserve les filtres actifs et utilise des liens réels pour l'indexation.
 */
export function Pagination({
  page,
  total,
  limit,
  basePath,
  extraParams = {},
  hideIfSingle = true,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (hideIfSingle && totalPages <= 1) return null;

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams({ ...extraParams, page: String(targetPage) });
    // Nettoyer les valeurs vides pour éviter les URLs polluées
    for (const [k, v] of [...params.entries()]) {
      if (!v || v === 'ALL') params.delete(k);
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Fenêtre de pages autour de la page courante
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-2 mt-8"
    >
      {/* Précédent */}
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E2D6C4] bg-white text-xs font-bold text-[#115E59] hover:bg-[#F5EDE1] transition-colors"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Précédent</span>
        </Link>
      ) : (
        <span
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E2D6C4] bg-[#F5EDE1]/60 text-xs font-bold text-[#6B625A]/50 cursor-not-allowed"
          aria-disabled="true"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Précédent</span>
        </span>
      )}

      {/* Numéros de page */}
      <div className="flex items-center gap-1.5">
        {start > 1 && (
          <>
            <Link
              href={buildHref(1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2D6C4] bg-white text-xs font-bold text-[#2B2420] hover:bg-[#F5EDE1] transition-colors"
            >
              1
            </Link>
            {start > 2 && <span className="text-[#6B625A] text-xs px-1">…</span>}
          </>
        )}

        {pages.map((p) => (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
              p === page
                ? 'bg-[#E8632C] text-white shadow-sm ring-2 ring-[#E8632C]/30'
                : 'border border-[#E2D6C4] bg-white text-[#2B2420] hover:bg-[#F5EDE1]'
            }`}
          >
            {p}
          </Link>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-[#6B625A] text-xs px-1">…</span>}
            <Link
              href={buildHref(totalPages)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2D6C4] bg-white text-xs font-bold text-[#2B2420] hover:bg-[#F5EDE1] transition-colors"
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {/* Suivant */}
      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E2D6C4] bg-white text-xs font-bold text-[#115E59] hover:bg-[#F5EDE1] transition-colors"
          aria-label="Page suivante"
        >
          <span>Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E2D6C4] bg-[#F5EDE1]/60 text-xs font-bold text-[#6B625A]/50 cursor-not-allowed"
          aria-disabled="true"
        >
          <span>Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      )}

      {/* Info résultat */}
      <span className="w-full text-center text-[11px] text-[#6B625A] mt-1">
        Page {page} sur {totalPages} — {total} résultat{total > 1 ? 's' : ''}
      </span>
    </nav>
  );
}
