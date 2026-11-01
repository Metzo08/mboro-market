import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Hors ligne' };

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-6xl" role="img" aria-label="Signal hors ligne">
        📡
      </span>
      <h1 className="text-2xl font-bold text-teal-900">Vous êtes hors ligne</h1>
      <p className="max-w-md text-gray-600">
        Connexion réseau indisponible. Les pages déjà consultées restent accessibles. Vérifiez
        votre connexion puis réessayez — les produits frais de Mboro et Thiès vous attendent !
      </p>
      <Link
        href="/"
        className="rounded-full bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
      >
        Réessayer
      </Link>
    </div>
  );
}
