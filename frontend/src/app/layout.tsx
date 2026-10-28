import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import { AiChatWidget } from '@/components/ai/AiChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://jendcithies.sn'),
  title: {
    default: 'JëndCiThiès — Commerce local à Thiès | by Sen-E-Carte',
    template: '%s | JëndCiThiès',
  },
  description:
    'JëndCiThiès by Sen-E-Carte : place de marché locale pour les commerçants de Mboro, Thiès et région. Produits frais, artisans, restaurants. Commandez en 3 clics.',
  keywords: ['Thiès', 'Mboro', 'Sénégal', 'commerce local', 'marché', 'boutique', 'artisan'],
  openGraph: {
    title: 'JëndCiThiès — Commerce local à Thiès',
    description: 'Commerce local, produits frais et services à Thiès et Mboro. Commandez en 3 clics.',
    type: 'website',
    locale: 'fr_SN',
    siteName: 'JëndCiThiès',
    url: 'https://jendcithies.sn',
    images: [{ url: '/favicon.svg', width: 100, height: 100 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <CartProvider>
          <Navbar />
          <main className="pt-20 min-h-screen">{children}</main>
          <Footer />
          <AiChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}
