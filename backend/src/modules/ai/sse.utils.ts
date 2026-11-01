import { Logger } from '@nestjs/common';

/**
 * Utilitaires SSE (Server-Sent Events) pour le streaming du chat IA.
 * Format conforme au standard EventSource : lignes "data: {...}\n\n".
 */

export type SseEvent =
  | { type: 'token'; value: string }
  | { type: 'products'; products: any[] }
  | { type: 'done'; provider: string | null }
  | { type: 'error'; message: string };

/** Sérialise un événement en chunk SSE. */
export function formatSse(event: SseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Découpe un texte en tokens lisibles (mots + espaces) pour un rendu
 * "machine à écrire" naturel côté client.
 */
export function tokenizeAnswer(text: string): string[] {
  // On garde les espaces/newlines attachés au mot précédent pour préserver
  // la mise en forme (listes à puces, sauts de ligne).
  return text.match(/\S+\s*/g) ?? [text];
}

/**
 * Écrit dans une Response un flux SSE complet à partir d'un générateur
 * asynchrone d'événements, avec heartbeat anti-proxy et nettoyage à la
 * déconnexion du client.
 */
export async function writeSseStream(
  res: any,
  events: AsyncGenerator<SseEvent>,
): Promise<void> {
  const logger = new Logger('SseStream');
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx : pas de buffering
  res.flushHeaders?.();

  let closed = false;
  res.on('close', () => {
    closed = true;
  });

  const send = (event: SseEvent) => {
    if (closed || res.writableEnded) return false;
    res.write(formatSse(event));
    return true;
  };

  try {
    for await (const event of events) {
      if (!send(event)) break;
    }
  } catch (e: any) {
    logger.warn(`Stream interrompu : ${e?.message ?? 'erreur'}`);
    send({ type: 'error', message: 'Flux interrompu, réessayez.' });
  } finally {
    if (!closed && !res.writableEnded) res.end();
  }
}
