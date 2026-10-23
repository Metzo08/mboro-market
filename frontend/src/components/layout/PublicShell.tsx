'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileTabBar } from '@/components/layout/MobileTabBar';

/**
 * L'espace commerçant possède sa propre navigation : on n'affiche pas
 * la navbar publique (et son panier client) sur /merchant.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMerchantArea = pathname.startsWith('/merchant');

  if (isMerchantArea) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main id="contenu" className="min-h-screen pb-safe md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileTabBar />
    </>
  );
}
