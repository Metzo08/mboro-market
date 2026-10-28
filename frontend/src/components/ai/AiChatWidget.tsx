'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';

/**
 * Widget flottant de chat IA accessible depuis toutes les pages publiques.
 * Répond aux questions sur les prix, le stock, les boutiques et la livraison
 * en se basant strictement sur les données réelles (Wolof / Français).
 */
export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<'FR' | 'WO'>('FR');
  const [messages, setMessages] = useState<Array<{ role: 'USER' | 'ASSISTANT'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'ASSISTANT',
          content:
            lang === 'WO'
              ? 'Salaamalekum ! Naka laa la mën a dimbalee tay ? Wax ma sa laaj ci njëg yi, es-tok bi walla yóbbu bi.'
              : 'Salaamalekum ! Je suis votre assistant JëndCiThiès. Posez vos questions sur les prix, le stock, les boutiques ou la livraison.',
        },
      ]);
    }
  }, [isOpen, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userContent = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'USER', content: userContent }]);
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userContent, language: lang }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ASSISTANT', content: data.answer }]);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion à l\'assistant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#E8632C] to-[#B6481A] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group"
          title="Assistant IA JëndCiThiès"
          aria-label="Ouvrir l'assistant IA"
        >
          <Sparkles className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F2A93B] border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-96 max-w-[400px] bg-white rounded-3xl shadow-2xl border border-[#E2D6C4] flex flex-col overflow-hidden animate-fade-in-up">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-[#115E59] to-[#0D4A46] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F2A93B] text-[#2B2420] flex items-center justify-center font-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Assistant JëndCiThiès</p>
                <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  En ligne · FR / Wolof
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sélecteur de langue */}
          <div className="px-4 py-2 bg-[#FFFBF5] border-b border-[#E2D6C4] flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#6B625A]">Langue :</span>
            <div className="inline-flex p-0.5 bg-[#F5EDE1] rounded-lg">
              <button
                onClick={() => setLang('FR')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === 'FR' ? 'bg-white text-[#115E59] shadow-sm' : 'text-[#6B625A]'}`}
              >
                🇫🇷 Français
              </button>
              <button
                onClick={() => setLang('WO')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === 'WO' ? 'bg-white text-[#115E59] shadow-sm' : 'text-[#6B625A]'}`}
              >
                🇸🇳 Wolof
              </button>
            </div>
          </div>

          {/* Zone messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80 min-h-64 bg-[#FFFBF5]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'USER'
                      ? 'bg-[#E8632C] text-white rounded-br-sm'
                      : 'bg-[#F5EDE1] text-[#2B2420] rounded-bl-sm border border-[#E2D6C4]'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F5EDE1] border border-[#E2D6C4] px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#6B625A] animate-spin" />
                  <span className="text-xs text-[#6B625A]">{lang === 'WO' ? 'Ñaxal biñ...' : 'Réflexion en cours...'}</span>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions rapides */}
          <div className="px-3 py-2 bg-white border-t border-[#E2D6C4] flex gap-1.5 overflow-x-auto">
            {[
              { label: lang === 'WO' ? 'Njëg yi' : 'Les prix', q: 'prix des produits' },
              { label: lang === 'WO' ? 'Es-tok' : 'Stock', q: 'stock disponible' },
              { label: lang === 'WO' ? 'Yóbbu' : 'Livraison', q: 'zone de livraison' },
            ].map((chip) => (
              <button
                key={chip.q}
                onClick={() => setInput(chip.q)}
                className="px-2.5 py-1 rounded-full bg-[#F5EDE1] hover:bg-[#FBECE4] text-[10px] font-semibold text-[#2B2420] border border-[#E2D6C4] transition-colors whitespace-nowrap"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Zone de saisie */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-[#E2D6C4] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'WO' ? 'Waxal here...' : 'Posez votre question...'}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E2D6C4] text-xs sm:text-sm text-[#2B2420] focus:outline-none focus:ring-2 focus:ring-[#E8632C] bg-[#FFFBF5]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-[#E8632C] hover:bg-[#B6481A] text-white flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm"
              aria-label="Envoyer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
