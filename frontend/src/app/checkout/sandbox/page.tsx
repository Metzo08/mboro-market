'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

/**
 * Tunnel de paiement SIMULÉ (démo uniquement).
 * Aucun argent réel : appelle le webhook local signé du backend pour
 * confirmer la transaction, comme le ferait Wave/PayDunya en production.
 */
function SandboxPaymentContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const reference = sp.get('ref') || '';
  const amount = Number(sp.get('amount') || 0);

  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const confirmPayment = async () => {
    setStatus('processing');
    setMessage('');
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
      const payload = {
        id: `evt_sandbox_${Date.now()}`,
        reference,
        amount,
        status: 'SUCCEEDED',
        provider: 'sandbox',
      };
      const res = await fetch(`${backendUrl}/payments/sandbox-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('done');
      setTimeout(() => router.push('/orders'), 1800);
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Erreur de confirmation');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#FFFBF5] py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border-2 border-amber-400 shadow-lg overflow-hidden">
        {/* Bandeau avertissement */}
        <div className="bg-amber-100 border-b border-amber-300 px-5 py-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
          <p className="text-xs font-bold text-amber-900">
            Mode démonstration — aucun paiement réel n&apos;est effectué
          </p>
        </div>

        <div className="p-6 sm:p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#115E59] text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-[#2B2420] mb-1">Paiement simulé</h1>
          <p className="text-xs text-[#6B625A] mb-5">
            Référence : <span className="font-mono font-bold">{reference}</span>
          </p>

          <div className="rounded-2xl bg-[#F5EDE1] p-5 mb-6">
            <p className="text-xs text-[#6B625A] mb-1">Montant à payer</p>
            <p suppressHydrationWarning className="text-3xl font-black text-[#E8632C]">
              {formatPrice(amount)}
            </p>
          </div>

          {status === 'idle' && (
            <button
              onClick={confirmPayment}
              className="w-full jt-btn-primary py-3.5 rounded-xl text-sm font-bold shadow-md"
            >
              Confirmer le paiement (démo)
            </button>
          )}

          {status === 'processing' && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#6B625A]">
              <Loader2 className="w-5 h-5 animate-spin" />
              Confirmation en cours...
            </div>
          )}

          {status === 'done' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-6 h-6" />
                Paiement confirmé !
              </div>
              <p className="text-xs text-[#6B625A]">Redirection vers vos commandes...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <p className="text-sm text-red-700 bg-red-50 rounded-xl p-3">{message}</p>
              <button onClick={confirmPayment} className="text-xs font-bold text-[#115E59] underline">
                Réessayer
              </button>
            </div>
          )}

          <Link href="/products" className="block mt-4 text-xs text-[#6B625A] hover:underline">
            Annuler et revenir aux produits
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SandboxPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <SandboxPaymentContent />
    </Suspense>
  );
}
