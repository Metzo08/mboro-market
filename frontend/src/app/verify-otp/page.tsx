'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, setToken } from '@/lib/api';
import { VerifyOtpDto } from '@/types';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dto: VerifyOtpDto = { phone, code };
      const res = await api.post('/auth/verify-otp', dto);
      setToken(res.data.access_token);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 text-center">
            Vérification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entrez le code OTP envoyé sur votre téléphone
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md bg-shadow -space-y-px">
            <div>
              <label htmlFor="phone" className="sr-only">
                Numéro de téléphone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                disabled
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-gray-50"
                placeholder="+221 70 xxx xxxx"
                value={phone}
              />
            </div>
            <div>
              <label htmlFor="code" className="sr-only">
                Code OTP
              </label>
              <Input
                id="code"
                name="code"
                type="text"
                maxLength={6}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Vous n'avez pas reçu le code ?{' '}
          <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
            Renvoyer le code
          </Link>
        </p>
      </div>
    </div>
  );
}
