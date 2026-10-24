'use client';

import { useState, useEffect, useRef } from 'react';
import { api, getToken } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { Bot, MessageCircle, Globe } from 'lucide-react';

export default function AIAssistantPage() {
  const [token] = useState(() => getToken());
  const [shop, setShop] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<'FR' | 'WO'>('FR');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      setError('Connexion requise');
      return;
    }
    initAssistant();
  }, [token]);

  const initAssistant = async () => {
    try {
      const meRes = await api.get('/auth/me');
      const userId = meRes.data.user.id;
      const shopRes = await api.get(`/shops/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShop(shopRes.data);

      const convRes = await api.post('/ai/conversations', {
        shopId: shopRes.data.id,
        userId,
        language: lang,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversation(convRes.data);
      loadMessages(convRes.data.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur d\'initialisation');
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const res = await api.get(`/ai/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data || []);
      scrollToBottom();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des messages');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversation) return;
    setSending(true);
    const userMessage = { role: 'USER' as const, content: input, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    scrollToBottom();
    try {
      const res = await api.post(`/ai/conversations/${conversation.id}/messages`, {
        content: input,
        language: lang,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => [...prev, res.data]);
      scrollToBottom();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickQuestions = [
    { fr: 'Quels sont mes prix ?', wo: 'Njegegi ŋu ?' },
    { fr: 'Quel est mon stock ?', wo: 'Stokku ŋu nekki ?' },
    { fr: 'Adresse de livraison', wo: 'Yobbu bi ŋaadi ?' },
    { fr: 'Bonjour', wo: 'Salaamalekum' },
  ];

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-8">Vous devez être connecté pour accéder à l'assistant IA.</p>
          <Link href="/login" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'assistant…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Assistant IA</h1>
                <p className="text-sm text-gray-500">Gestion de stock & conseils — {shop?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{lang === 'FR' ? 'Français' : 'Wolof'}</span>
                <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'FR' ? 'WO' : 'FR')}>
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
              <Link href="/mon-commerce" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Boutique
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[600px] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <MessageCircle className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">Commencez la conversation avec votre assistant IA</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'} max-w-[85%]`}
              >
                <div className={`px-4 py-2 rounded-2xl ${
                  msg.role === 'USER'
                    ? 'bg-green-600 text-white text-sm rounded-tr-none'
                    : 'bg-gray-100 text-gray-900 text-sm rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Questions rapides</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q.fr}
                    onClick={() => setInput(lang === 'FR' ? q.fr : q.wo)}
                    className="text-left p-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-green-50 hover:border-green-200 transition-colors"
                  >
                    {lang === 'FR' ? q.fr : q.wo}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                placeholder={lang === 'FR' ? 'Écrivez votre question…' : 'Wax ci wolof ci…'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" disabled={sending || !input.trim()}>
                {sending ? 'Envoi…' : lang === 'FR' ? 'Envoyer' : 'Yëkke'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}