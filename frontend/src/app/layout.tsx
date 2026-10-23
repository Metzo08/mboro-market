import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { PublicShell } from '@/components/layout/PublicShell';
import { CartProvider } from '@/components/cart/CartProvider';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'JëndCiThiès — Les commerces et services de Thiès, à portée de main',
    template: '%s | JëndCiThiès',
  },
  description:
    "Trouvez les commerçants, restaurants et artisans de Mboro, Thiès et sa région. Commandez en ligne, payez à la livraison ou par Wave / Orange Money.",
  applicationName: 'JëndCiThiès',
  openGraph: {
    title: 'JëndCiThiès — Une plateforme Sen-E-Carte',
    description: 'Les commerces et services de Thiès, à portée de main.',
    type: 'website',
    locale: 'fr_SN',
    siteName: 'JëndCiThiès',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JëndCiThiès',
    description: 'Les commerces et services de Thiès, à portée de main.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#fffbf5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="bg-canvas text-ink font-sans antialiased">
        <CartProvider>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-teal focus:px-4 focus:py-2 focus:text-white"
          >
            Aller au contenu
          </a>
          <PublicShell>{children}</PublicShell>
        </CartProvider>
      </body>
    </html>
  );
}
