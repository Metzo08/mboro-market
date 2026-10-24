'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '@/lib/api';

export default function MonCommercePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login?callback=/mon-commerce');
      return;
    }
    api.get('/auth/me')
      .then((res) => {
        const user = res.data.user;
        if (user.role === 'MERCHANT' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          router.push('/merchant/dashboard');
        } else {
          router.push('/');
        }
      })
      .catch(() => {
        router.push('/merchant/dashboard');
      });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers votre boutique…</p>
      </div>
    </div>
  );
}