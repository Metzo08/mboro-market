'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, setToken } from '@/lib/api';
import { ShieldCheck, Phone, Lock, Mail, ArrowRight } from 'lucide-react';

type AuthMode = 'phone' | 'password';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mode téléphone (OTP)
  const [phone, setPhone] = useState('+221770000001');

  // Mode email/mot de passe
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/login', { phone });
      router.push(`/verify-otp?phone=${encodeURIComponent(phone)}`);
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login/password', { email, password });
      setToken(res.data.access_token);
      localStorage.setItem('token', res.data.access_token);
      sessionStorage.setItem('token', res.data.access_token);

      const user = res.data.user || res.data;
      if (user.role === 'MERCHANT' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/mon-commerce');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FFFBF5]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-[#E2D6C4] shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#115E59] text-white flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-sm">
            J
          </div>
          <h1 className="text-2xl font-black text-[#2B2420] tracking-tight">
            Connexion JëndCiThiès
          </h1>
          <p className="text-xs text-[#6B625A] mt-1">
            Accédez à votre espace client ou gestionnaire de boutique
          </p>
        </div>

        {/* Mode sélection */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-[#F5EDE1] rounded-xl w-full">
            <button
              type="button"
              onClick={() => setMode('phone')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'phone'
                  ? 'bg-white text-[#115E59] shadow-sm'
                  : 'text-[#6B625A] hover:text-[#2B2420]'
              }`}
            >
              Téléphone (OTP)
            </button>
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'password'
                  ? 'bg-white text-[#115E59] shadow-sm'
                  : 'text-[#6B625A] hover:text-[#2B2420]'
              }`}
            >
              Email / Mot de passe
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={mode === 'phone' ? handlePhoneSubmit : handlePasswordSubmit}>
          {mode === 'phone' ? (
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-[#2B2420] mb-1">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="pl-9 text-sm rounded-xl border-[#E2D6C4]"
                />
              </div>
              <p className="text-[11px] text-[#6B625A] mt-1.5">
                Un code SMS sécurisé sera envoyé à ce numéro.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-[#2B2420] mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="commercant@senecarte.sn"
                    className="pl-9 text-sm rounded-xl border-[#E2D6C4]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-[#2B2420] mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-sm rounded-xl border-[#E2D6C4]"
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-3.5 jt-btn-primary rounded-xl text-sm font-bold shadow-md"
            disabled={loading}
          >
            {loading ? 'Connexion...' : mode === 'phone' ? 'Continuer avec mon téléphone →' : 'Se connecter'}
          </Button>
        </form>

        <p className="text-center text-xs text-[#6B625A]">
          Vous n'avez pas encore de compte ?{' '}
          <Link href="/register" className="font-bold text-[#E8632C] hover:underline">
            Créer un compte commerçant
          </Link>
        </p>
      </div>
    </div>
  );
}
