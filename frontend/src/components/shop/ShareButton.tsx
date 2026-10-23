'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* partage annulé par l'utilisateur : aucune erreur à afficher */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-caption font-semibold text-ink shadow-card hover:bg-white"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
      ) : (
        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? 'Lien copié' : 'Partager'}
    </button>
  );
}
