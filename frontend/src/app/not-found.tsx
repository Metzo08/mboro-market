import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="motif-bogolan flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-6xl font-semibold text-terracotta">404</p>
        <h1 className="mt-3 text-h1 font-semibold">Cette page n’existe pas</h1>
        <p className="mt-2 text-body text-muted">
          Le lien est peut-être obsolète, ou la boutique a changé d’adresse. Retrouvez les commerces
          de votre localité depuis l’accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="rounded-md bg-terracotta px-4 py-2.5 text-small font-semibold text-white hover:bg-terracotta-dark">
            Retour à l’accueil
          </Link>
          <Link href="/shops" className="rounded-md border border-line px-4 py-2.5 text-small font-semibold text-ink hover:border-teal hover:text-teal">
            Voir les boutiques
          </Link>
        </div>
      </div>
    </div>
  );
}
