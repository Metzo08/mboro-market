'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Search, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/recherche', label: 'Recherche', icon: Search },
  { href: '/cart', label: 'Panier', icon: ShoppingCart, cart: true },
  { href: '/orders', label: 'Commandes', icon: Package },
  { href: '/login', label: 'Compte', icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // L'espace commerçant possède sa propre navigation.
  if (pathname.startsWith('/merchant')) return null;

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-caption font-medium transition-colors',
                  active ? 'text-terracotta-dark' : 'text-muted hover:text-ink',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.cart && itemCount > 0 && (
                  <span className="absolute right-1/2 top-1.5 -mr-4 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
