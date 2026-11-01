import { NextRequest } from 'next/server';

/**
 * Proxy SSE pour l'assistant IA en streaming.
 * Next.js App Router relaie le flux binaire du backend tel quel
 * (text/event-stream) — aucun buffering, chaque chunk part immédiatement.
 */
export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
  let body: { question?: string; language?: string } = {};
  try {
    body = await req.json();
  } catch {
    // body vide — géré par le backend
  }

  const upstream = await fetch(`${backendUrl}/ai/public-ask-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      question: body.question ?? '',
      language: body.language ?? 'FR',
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(
      `data: ${JSON.stringify({ type: 'error', message: 'Assistant momentanément indisponible.' })}\n\n`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        },
      },
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
