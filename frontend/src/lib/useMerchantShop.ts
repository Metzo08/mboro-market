'use client';

import { useEffect, useState } from 'react';
import { api, getToken } from '@/lib/api';
import type { Shop } from '@/types';

/**
 * Résout la boutique du commerçant depuis la session serveur.
 * Aucun identifiant de boutique n'est codé en dur côté client.
 */
export function useMerchantShop() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      window.location.href = `/login?callback=${window.location.pathname}`;
      return;
    }
    api
      .get('/shops/me')
      .then((res) => {
        const shops: Shop[] = res.data ?? [];
        if (shops.length === 0) {
          setError("Aucune boutique n'est associée à ce compte.");
          return;
        }
        setShop(shops[0]);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Impossible de charger votre boutique.');
      })
      .finally(() => setLoading(false));
  }, []);

  return { shop, loading, error };
}
