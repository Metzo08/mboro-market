'use client';

import { useState, useEffect } from 'react';
import { api, getToken } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Store, ArrowLeft, Download, ShieldCheck, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function MerchantPosterPage() {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [host, setHost] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHost(window.location.origin);
    }

    const token = getToken();
    if (!token) {
      window.location.href = '/login?callback=/merchant/poster';
      return;
    }

    api.get('/shops/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setShop(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const storeUrl = shop?.slug ? `${host}/shops/${shop.slug}` : host;

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Génération de votre affiche de comptoir...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 print:bg-white print:p-0">
      {/* Barre d'actions supérieure (masquée à l'impression) */}
      <div className="max-w-xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/merchant/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>
        <Button
          onClick={handlePrint}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimer mon affiche A4
        </Button>
      </div>

      {/* AFFICHE DE COMPTOIR FORMAT A4 / STAND */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl border-2 border-emerald-600 shadow-xl p-8 sm:p-12 text-center print:shadow-none print:border-2 print:rounded-none print:max-w-full">
        {/* En-tête plateforme */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
            J
          </div>
          <span className="font-extrabold text-gray-900 tracking-tight text-lg">
            JëndCiThiès
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
            By Sen-E-Carte
          </span>
        </div>

        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-6">
          Votre commerce local connecté
        </p>

        {/* Nom du commerce */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-6 border border-emerald-200 mb-8">
          <h1 className="text-3xl font-black text-emerald-950 mb-1">
            {shop?.name || 'Ma Boutique'}
          </h1>
          <p className="text-sm text-emerald-800 font-medium">
            {shop?.shortDescription || 'Commandez en direct depuis chez vous'}
          </p>
        </div>

        {/* Grand QR Code */}
        <div className="inline-block p-6 rounded-3xl bg-white border-4 border-gray-900 shadow-inner mb-6">
          <QRCodeSVG
            value={storeUrl}
            size={240}
            level="H"
            includeMargin={true}
          />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Scannez avec votre téléphone
        </h2>
        <p className="text-sm text-gray-600 max-w-sm mx-auto mb-8">
          Découvrez notre catalogue complet, commandez en 3 clics et recevez votre livraison à domicile.
        </p>

        {/* Badges de confiance & paiements */}
        <div className="grid grid-cols-3 gap-2 pt-6 border-t border-gray-200 text-left">
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Paiement</p>
            <p className="text-xs font-bold text-gray-800">Wave & Espèces</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Livraison</p>
            <p className="text-xs font-bold text-gray-800">Mboro & Thiès</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Contact</p>
            <p className="text-xs font-bold text-gray-800 truncate">
              {shop?.phone || '+221 77...'}
            </p>
          </div>
        </div>

        {/* Pied de page affiche */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>{storeUrl}</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Commerce vérifié
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4 print:hidden">
        Astuce : Imprimez ce document en couleur et posez-le sur votre comptoir ou vitrine.
      </p>
    </div>
  );
}
