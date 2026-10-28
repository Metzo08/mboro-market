'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, setToken } from '@/lib/api';
import { VerifyOtpDto } from '@/types';
import { ShieldCheck, Phone } from 'lucide-react';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const qPhone = searchParams.get('phone');
    if (qPhone) {
      setPhone(qPhone);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dto: VerifyOtpDto = { phone, code };
      const res = await api.post('/auth/verify-otp', dto);
      setToken(res.data.access_token);
      localStorage.setItem('token', res.data.access_token);

      const callback = searchParams.get('callback') || '/';
      router.push(callback);
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-[#E2D6C4] shadow-sm">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#E8632C] text-white flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#2B2420] tracking-tight">
          Vérification OTP
        </h2>
        <p className="mt-1.5 text-xs text-[#6B625A]">
          Entrez le code à 6 chiffres pour valider votre numéro
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold text-[#2B2420] mb-1">
            Numéro de téléphone
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              className="pl-9 text-sm font-semibold rounded-xl border-[#E2D6C4]"
              placeholder="+221 77 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2B2420] mb-1">
            Code OTP reçu
          </label>
          <Input
            id="code"
            name="code"
            type="text"
            maxLength={6}
            required
            autoFocus
            className="text-center tracking-widest text-lg font-mono font-bold rounded-xl border-[#E2D6C4]"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full py-3.5 jt-btn-primary rounded-xl text-sm font-bold shadow-md"
          disabled={loading || !phone || !code}
        >
          {loading ? 'Vérification en cours...' : 'Valider et continuer →'}
        </Button>
      </form>

      <p className="text-center text-xs text-[#6B625A] pt-2">
        Numéro erroné ?{' '}
        <Link href="/login" className="font-bold text-[#E8632C] hover:underline">
          Modifier le numéro
        </Link>
      </p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FFFBF5]">
      <Suspense fallback={<div className="text-center text-sm text-gray-500">Chargement...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
