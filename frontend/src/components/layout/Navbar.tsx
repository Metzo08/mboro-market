'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingCart, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';
import { Logo } from '@/components/ui/Logo';
import { LocalityPicker } from '@/components/layout/LocalityPicker';

const LINKS = [
  { href: '/shops', label: 'Boutiques' },
  { href: '/products', label: 'Produits' },
  { href: '/recherche', label: 'Recherche' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const { itemCount } = useCart();

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <LocalityPicker className="hidden sm:inline-flex" />
        </div>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
              className={cn(
                'rounded-sm px-3 py-2 text-small font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-sand text-terracotta-dark'
                  : 'text-muted hover:bg-sand hover:text-ink',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/register"
            className="hidden rounded-md border border-teal px-3 py-2 text-small font-medium text-teal transition-colors hover:bg-teal hover:text-white lg:inline-flex"
          >
            Devenir commerçant
          </Link>
          <Link
            href="/cart"
            aria-label={`Panier, ${itemCount} article${itemCount > 1 ? 's' : ''}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-sand"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[11px] font-bold text-white">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            aria-label="Mon compte"
            className="hidden h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-sand sm:flex"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="menu-mobile"
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-sand md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="menu-mobile" className="border-t border-line bg-canvas md:hidden">
          <div className="space-y-1 px-4 pb-5 pt-3">
            <LocalityPicker className="mb-3 inline-flex sm:hidden" />
            {[...LINKS, { href: '/orders', label: 'Mes commandes' }, { href: '/login', label: 'Mon compte' }].map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-sm px-3 py-2.5 text-body font-medium text-ink hover:bg-sand"
                >
                  {link.label}
                </Link>
              ),
            )}
            <Link
              href="/register"
              className="mt-2 block rounded-md bg-terracotta px-3 py-3 text-center text-small font-semibold text-white"
            >
              Devenir commerçant
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

