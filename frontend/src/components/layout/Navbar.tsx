'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, ShoppingCart, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';
import { getToken, removeToken } from '@/lib/api';
import Cookies from 'js-cookie';

function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  const token = Cookies.get('token');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role || null;
  } catch {
    return null;
  }
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const { itemCount } = useCart();
  const role = getUserRole();
  const isMerchant = role === 'MERCHANT' || role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isLoggedIn = !!getToken();

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-[#1B7A3D] flex items-center justify-center text-white font-bold">
                J
              </div>
              <span className="text-xl font-bold text-gray-900">
                JëndCiThiès
                <span className="block text-[10px] font-medium text-gray-500 -mt-1">
                  by Sen-E-Carte
                </span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === '/products' ? 'text-green-700' : 'text-gray-600 hover:text-gray-900',
              )}
            >
              Produits
            </Link>
            <Link
              href="/shops"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname?.startsWith('/shops') ? 'text-green-700' : 'text-gray-600 hover:text-gray-900',
              )}
            >
              Boutiques
            </Link>
            <Link
              href="/cart"
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-colors rounded-lg px-3 py-2',
                pathname === '/cart' ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-gray-900',
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              Panier
              {itemCount > 0 && (
                <span className="ml-0.5 min-w-5 h-5 px-1 inline-flex items-center justify-center rounded-full bg-[#F59E0B] text-white text-[11px] font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            {isLoggedIn ? (
              <>
                {isMerchant ? (
                  <Link
                    href="/mon-commerce"
                    className={cn(
                      'flex items-center gap-1.5 text-sm font-medium transition-colors',
                      pathname === '/mon-commerce' || pathname?.startsWith('/merchant')
                        ? 'text-green-700'
                        : 'text-gray-600 hover:text-gray-900',
                    )}
                  >
                    <User className="h-4 w-4" />
                    Mon commerce
                  </Link>
                ) : (
                  <Link
                    href="/orders"
                    className={cn(
                      'flex items-center gap-1.5 text-sm font-medium transition-colors',
                      pathname === '/orders' ? 'text-green-700' : 'text-gray-600 hover:text-gray-900',
                    )}
                  >
                    <User className="h-4 w-4" />
                    Mes commandes
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-medium transition-colors',
                    pathname === '/login' ? 'text-green-700' : 'text-gray-600 hover:text-gray-900',
                  )}
                >
                  <User className="h-4 w-4" />
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="jt-btn-accent !py-2 !px-4 text-sm"
                >
                  Devenir commerçant
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Produits
            </Link>
            <Link
              href="/shops"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Boutiques
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className={cn(
                'block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50',
                itemCount > 0 ? 'bg-green-50' : '',
              )}
            >
              Panier {itemCount > 0 && <span className="ml-2 text-xs font-bold text-green-600">{itemCount}</span>}
            </Link>
            {isLoggedIn ? (
              <>
                {isMerchant ? (
                  <Link
                    href="/mon-commerce"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Mon commerce
                  </Link>
                 ) : (
                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Mes commandes
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="block w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 text-center"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-3 py-2 rounded-md text-base font-medium text-white bg-[#F59E0B] hover:bg-amber-600 text-center"
                >
                  Devenir commerçant
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
