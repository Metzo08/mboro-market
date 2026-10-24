'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { removeToken } from '@/lib/api';
import { LayoutDashboard, ShoppingCart, Package, CreditCard, LogOut, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/merchant/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/merchant/products', label: 'Produits', icon: ShoppingCart },
  { href: '/merchant/orders', label: 'Commandes', icon: Package },
  { href: '/merchant/payments', label: 'Paiements', icon: CreditCard },
  { href: '/merchant/settings', label: 'Paramètres', icon: Settings },
];

export default function MerchantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-xl font-bold text-gray-900">Mboro Market</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => {
                const ActiveIcon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-green-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    )}
                  >
                    <ActiveIcon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
