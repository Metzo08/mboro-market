import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mboro Market - Commerce local à Thiès',
  description: 'Place de marché locale pour les commerçants de Mboro et Thiès, Sénégal',
  openGraph: {
    title: 'Mboro Market',
    description: 'Commerce local, produits frais et services à Thiès',
    type: 'website',
    locale: 'fr_SN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        <main className="pt-20 min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
