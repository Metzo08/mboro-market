'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { useMerchantShop } from '@/lib/useMerchantShop';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { paymentStatusMeta } from '@/lib/status';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

interface Transaction {
  id: string;
  transactionReference: string;
  amount: string | number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string;
}

export default function MerchantPayments() {
  const { shop, loading: shopLoading } = useMerchantShop();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shop) return;
    api
      .get('/payments', { params: { shopId: shop.id } })
      .then((res) => setTransactions(res.data.items ?? res.data ?? []))
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger les paiements.'))
      .finally(() => setLoading(false));
  }, [shop]);

  if (shopLoading || loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const subscription = shop?.subscription;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-h1 font-semibold">Facturation</h1>
        <p className="mt-1 text-small text-muted">
          Les abonnements Sen-E-Carte et les ventes clients sont deux flux distincts, jamais mélangés.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-md bg-danger/10 p-3 text-small text-danger">{error}</p>
      )}

      <section className="rounded-lg border border-line bg-white p-5 shadow-card">
        <h2 className="flex items-center gap-2 text-h3 font-semibold">
          <CreditCard className="h-5 w-5 text-terracotta" aria-hidden="true" /> Abonnement boutique
        </h2>
        {subscription ? (
          <dl className="mt-3 grid gap-3 text-small sm:grid-cols-3">
            <div>
              <dt className="text-caption text-muted">Statut</dt>
              <dd className="mt-1">
                <Badge tone={subscription.status === 'ACTIVE' ? 'success' : 'danger'}>
                  {subscription.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Montant mensuel</dt>
              <dd className="numbers mt-1 font-semibold text-ink">
                {(subscription as any).price ? formatPrice((subscription as any).price) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Prochaine échéance</dt>
              <dd className="mt-1 text-ink">
                {subscription.nextDueAt ? formatDateTime(subscription.nextDueAt) : '—'}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-small text-muted">Aucun abonnement configuré pour cette boutique.</p>
        )}
        <p className="mt-4 flex items-start gap-2 rounded-md bg-sand/60 p-3 text-caption text-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
          Le paiement de l’abonnement en ligne (PayDunya / Wave Business) n’est pas encore branché.
          Aucun encaissement n’est simulé : le règlement se fait directement auprès de Sen-E-Carte.
        </p>
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-white">
        <h2 className="border-b border-line px-5 py-4 text-h3 font-semibold">Transactions clients</h2>
        {transactions.length === 0 ? (
          <p className="px-5 py-8 text-center text-small text-muted">
            Aucune transaction enregistrée. Les paiements à la livraison sont confirmés manuellement
            par vos soins.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="bg-sand/60 text-caption uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-2 font-semibold">Référence</th>
                  <th className="px-5 py-2 font-semibold">Date</th>
                  <th className="px-5 py-2 text-right font-semibold">Montant</th>
                  <th className="px-5 py-2 text-right font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transactions.map((transaction) => {
                  const meta = paymentStatusMeta(transaction.status);
                  return (
                    <tr key={transaction.id}>
                      <td className="numbers px-5 py-3 text-muted">{transaction.transactionReference}</td>
                      <td className="px-5 py-3 text-muted">{formatDateTime(transaction.createdAt)}</td>
                      <td className="numbers px-5 py-3 text-right font-medium text-ink">
                        {formatPrice(transaction.amount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
