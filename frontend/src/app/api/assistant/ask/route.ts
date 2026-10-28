import { NextRequest, NextResponse } from 'next/server';

/**
 * Route proxy public pour l'assistant IA JëndCiThiès.
 * Relaye la question au backend NestJS (/api/ai/public-ask)
 * qui répond uniquement à partir des données réelles des boutiques.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

    const res = await fetch(`${backendUrl}/ai/public-ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: body.question,
        language: body.language || 'FR',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { answer: "Désolé, l'assistant est momentanément indisponible. Réessayez dans quelques instants." },
        { status: 200 },
      );
    }

    const data = await res.json();
    return NextResponse.json({ answer: data.answer || data.content || 'Réponse indisponible.' });
  } catch (err: any) {
    return NextResponse.json(
      {
        answer:
          'Je ne peux pas répondre pour le moment. Consultez directement les boutiques ou contactez-les via WhatsApp.',
      },
      { status: 200 },
    );
  }
}
