import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeadingProps {
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeading({ title, eyebrow, href, linkLabel = 'Voir tout' }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-caption font-semibold uppercase tracking-[0.14em] text-terracotta-dark">{eyebrow}</p>
        )}
        <h2 className="text-h2 font-semibold text-ink">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-small font-medium text-teal hover:text-terracotta-dark"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
