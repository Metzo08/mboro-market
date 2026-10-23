import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-sand/60 pb-24 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-small text-muted">
            Les commerces et services de Thiès, à portée de main. Une plateforme Sen-E-Carte.
          </p>
        </div>

        <nav aria-label="Liens utiles" className="grid grid-cols-2 gap-2 text-small">
          <Link href="/shops" className="text-muted hover:text-terracotta-dark">
            Boutiques
          </Link>
          <Link href="/products" className="text-muted hover:text-terracotta-dark">
            Produits
          </Link>
          <Link href="/register" className="text-muted hover:text-terracotta-dark">
            Devenir commerçant
          </Link>
          <Link href="/orders" className="text-muted hover:text-terracotta-dark">
            Mes commandes
          </Link>
          <Link href="/legal/cgu" className="text-muted hover:text-terracotta-dark">
            Conditions d’utilisation
          </Link>
          <Link href="/legal/confidentialite" className="text-muted hover:text-terracotta-dark">
            Confidentialité
          </Link>
        </nav>

        <div className="text-small text-muted">
          <p className="font-medium text-ink">Support Sen-E-Carte</p>
          <p className="mt-1">Thiès, Sénégal</p>
          <a href="tel:+221700000000" className="mt-2 block text-teal hover:text-terracotta-dark">
            +221 70 000 00 00
          </a>
          <p className="mt-4 text-caption">
            Les mentions légales, CGU et CGV doivent être validées juridiquement avant mise en
            production.
          </p>
        </div>
      </div>
    </footer>
  );
}

