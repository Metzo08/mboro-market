import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Politique de confidentialité' };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-h1 font-semibold">Politique de confidentialité</h1>
      <p className="mt-3 rounded-md border border-gold/40 bg-gold/10 p-4 text-small text-ink">
        Document en cours de rédaction. La conformité à la loi sénégalaise n°2008-12 sur la
        protection des données (CDP) doit être vérifiée avant la mise en production.
      </p>
      <section className="mt-6 space-y-4 text-body text-muted">
        <h2 className="text-h3 font-semibold text-ink">Données collectées</h2>
        <p>
          Numéro de téléphone (identifiant principal), adresse de livraison et historique de
          commandes. L’email est facultatif. Les données de paiement ne transitent jamais par nos
          serveurs : elles sont traitées par le prestataire de paiement.
        </p>
        <h2 className="text-h3 font-semibold text-ink">Vos droits</h2>
        <p>
          Vous pouvez demander la correction ou la suppression de vos données en contactant le
          support Sen-E-Carte. Les données sensibles ne sont jamais transmises à un fournisseur d’IA
          sans nécessité et base légale.
        </p>
      </section>
    </article>
  );
}
