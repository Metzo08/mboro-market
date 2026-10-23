import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  defaultValue?: string;
  action?: string;
  placeholder?: string;
  size?: 'md' | 'lg';
  className?: string;
  id?: string;
}

/** Barre de recherche héro — formulaire GET, donc indexable et sans JS requis. */
export function SearchBar({
  defaultValue = '',
  action = '/recherche',
  placeholder = 'Rechercher un produit, une boutique, un service…',
  size = 'lg',
  className,
  id = 'recherche',
}: SearchBarProps) {
  return (
    <form action={action} method="GET" role="search" className={cn('w-full', className)}>
      <label htmlFor={id} className="sr-only">
        Rechercher
      </label>
      <div
        className={cn(
          'flex items-center gap-2 rounded-full border border-line bg-white shadow-raised focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20',
          size === 'lg' ? 'h-14 pl-5 pr-1.5' : 'h-11 pl-4 pr-1',
        )}
      >
        <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-muted/80 focus:outline-none"
        />
        <button
          type="submit"
          className={cn(
            'shrink-0 rounded-full bg-terracotta font-medium text-white transition-colors hover:bg-terracotta-dark',
            size === 'lg' ? 'h-11 px-5 text-small' : 'h-9 px-4 text-caption',
          )}
        >
          Rechercher
        </button>
      </div>
    </form>
  );
}
