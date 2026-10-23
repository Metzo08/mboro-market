import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Conditions générales d’utilisation' };

export default function CguPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-h1 font-semibold">Conditions générales d’utilisation</h1>
      <p className="mt-3 rounded-md border border-gold/40 bg-gold/10 p-4 text-small text-ink">
        Document en cours de rédaction. Les CGU, CGV, la politique de remboursement et les mentons
        légales doivent être validées juridiquement avant la mise en production (cahier des charges
        §14.3 et §22).
      </p>
      <section className="prose-sm mt-6 space-y-4 text-body text-muted">
        <h2 className="text-h3 font-semibold text-ink">Rôle de la plateforme</h2>
        <p>
          JëndCiThiès met en relation les clients et les commerçants de la région de Thiès. Chaque
          boutique est responsable des produits, prix, stocks et délais qu’elle publie. Le badge
          « Vérifiée » indique uniquement que les pièces justificatives demandées ont été contrôlées
          par Sen-E-Carte ; il ne garantit pas la qualité d’un produit.
        </p>
        <h2 className="text-h3 font-semibold text-ink">Commandes et paiements</h2>
        <p>
          Les montants sont recalculés côté serveur au moment de la commande. Un paiement en ligne
          n’est considéré comme reçu qu’après confirmation authentifiée du prestataire de paiement.
        </p>
      </section>
    </article>
  );
}
