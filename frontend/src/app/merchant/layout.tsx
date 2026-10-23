'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Store,
} from 'lucide-react';
import { removeToken } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';

const NAV_ITEMS = [
  { href: '/merchant/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/merchant/orders', label: 'Commandes', icon: Package },
  { href: '/merchant/products', label: 'Catalogue', icon: ShoppingCart },
  { href: '/merchant/payments', label: 'Facturation', icon: CreditCard },
  { href: '/merchant/boutique', label: 'Ma boutique', icon: Store },
];

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    removeToken();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo compact />
            <div className="leading-tight">
              <p className="font-display text-small font-semibold text-ink">Espace commerçant</p>
              <p className="text-caption text-muted">JëndCiThiès</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-md border border-line px-3 py-2 text-caption font-medium text-ink hover:border-teal hover:text-teal sm:inline-flex"
            >
              <Store className="h-3.5 w-3.5" aria-hidden="true" /> Voir le site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-caption font-medium text-muted hover:bg-sand hover:text-danger"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Déconnexion
            </button>
          </div>
        </div>

        <nav aria-label="Navigation commerçant" className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-caption font-medium',
                  active ? 'bg-teal text-white' : 'bg-sand text-ink',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav aria-label="Navigation commerçant" className="sticky top-24 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2.5 text-small font-medium transition-colors',
                    active ? 'bg-teal text-white' : 'text-muted hover:bg-sand hover:text-ink',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-10">{children}</main>
      </div>
    </div>
  );
}
