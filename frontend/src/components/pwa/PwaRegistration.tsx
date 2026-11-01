'use client';

import { useEffect, useState } from 'react';

/**
 * Enregistre le service worker + bouton "Installer l'app" (beforeinstallprompt).
 * Rendu uniquement côté client, invisible tant que le SW n'est pas prêt.
 */
export default function PwaRegistration() {
  const [canInstall, setCanInstall] = useState(false);
  const [promptEvent, setPromptEvent] = useState<any>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!canInstall) return null;

  return (
    <button
      onClick={() => {
        promptEvent?.prompt();
        setCanInstall(false);
      }}
      className="fixed bottom-4 right-4 z-50 rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-teal-800"
      aria-label="Installer l'application JëndCiThiès"
    >
      📲 Installer l'app
    </button>
  );
}
