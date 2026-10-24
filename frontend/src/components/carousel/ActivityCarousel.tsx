'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivitySlide {
  id: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  href?: string;
  cta?: string;
}

interface ActivityCarouselProps {
  slides: ActivitySlide[];
  /** Intervalle d'autoplay en ms. Mettre 0 ou undefined pour désactiver. */
  autoPlayInterval?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Carrousel d'activités SaaS.
 * Une seule diapositive est visible à la fois.
 * Navigation clavier (flèches), contrôles précédent/suivant et indicateurs cliquables.
 */
export function ActivityCarousel({
  slides,
  autoPlayInterval = 6000,
  className,
  ariaLabel = 'Activités de la plateforme',
}: ActivityCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = slides.length;
  const total = Math.max(count, 1);

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay : mis en pause au survol / focus / lorsque l'onglet est masqué.
  useEffect(() => {
    if (!autoPlayInterval || count <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlayInterval, count, isPaused]);

  useEffect(() => {
    const onVisibility = () => {
      if (typeof document !== 'undefined' && document.hidden) setIsPaused(true);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) next();
    else prev();
  };

  if (count === 0) return null;

  const current = slides[index];

  return (
    <div
      className={cn('relative', className)}
      role="region"
      aria-roledescription="carrousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide visible */}
      <div
        className="rounded-xl border border-[#E8E4D9] bg-white p-6 shadow-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-start gap-4">
          {current.icon && (
            <div
              className={cn(
                'h-11 w-11 flex-shrink-0 rounded-xl flex items-center justify-center',
                current.color ?? 'bg-green-100 text-green-700',
              )}
            >
              <current.icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-[#1a2e22] mb-1">{current.title}</h3>
            <p className="text-sm text-[#5b6b60] leading-relaxed">{current.description}</p>
            {current.href && current.cta && (
              <Link
                href={current.href}
                className="mt-3 inline-flex items-center text-sm font-medium text-[#1B7A3D] hover:underline"
              >
                {current.cta} →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Controles */}
      <button
        type="button"
        onClick={prev}
        aria-label="Activité précédente"
        className="absolute top-1/2 -translate-y-1/2 -left-3 z-10 h-9 w-9 rounded-full bg-white border border-[#E8E4D9] text-[#1a2e22] shadow-sm flex items-center justify-center hover:bg-[#F0FDF4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A3D]"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Activité suivante"
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-10 h-9 w-9 rounded-full bg-white border border-[#E8E4D9] text-[#1a2e22] shadow-sm flex items-center justify-center hover:bg-[#F0FDF4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A3D]"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Indicateurs */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Aller à l'activité ${i + 1} : ${slide.title}`}
            aria-current={i === index}
            className={cn(
              'h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A3D]',
              i === index ? 'w-6 bg-[#1B7A3D]' : 'w-2 bg-[#C9D6CC] hover:bg-[#9FB8A6]',
            )}
          />
        ))}
        <span className="ml-2 text-xs text-[#5b6b60] tabular-nums">
          {index + 1} / {total}
        </span>
      </div>
    </div>
  );
}

export default ActivityCarousel;

