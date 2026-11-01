import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Client LLM multi-fournisseur (CDC §8.6 : couche d'abstraction commune
 * pour pouvoir changer de fournisseur sans réécrire le métier).
 *
 * Ordre de priorité :
 *   1. Groq   (rapide, gratuit, llama-3.3-70b) — LLM_API_KEY ou GROQ_API_KEY
 *   2. OpenRouter (fallback)                   — OPENROUTER_API_KEY
 *   3. Aucun → isConfigured = false, l'appelant utilise le moteur à règles
 *
 * Garde-fous appliqués : timeout court (8s), température basse (0.4),
 * jamais d'invention de données (le prompt impose de répondre uniquement
 * à partir du contexte boutique fourni).
 */

export interface LlmMessage {
  role: 'system' | 'user';
  content: string;
}

export interface LlmResult {
  answer: string | null;
  provider: 'groq' | 'openrouter' | null;
}

@Injectable()
export class LlmProvider {
  private readonly logger = new Logger(LlmProvider.name);

  constructor(private config: ConfigService) { }

  get groqKey(): string | null {
    return (
      this.config.get<string>('LLM_API_KEY') ||
      this.config.get<string>('GROQ_API_KEY') ||
      null
    );
  }

  get openRouterKey(): string | null {
    return this.config.get<string>('OPENROUTER_API_KEY') || null;
  }

  get isConfigured(): boolean {
    return !!(this.groqKey || this.openRouterKey);
  }

  private modelFor(provider: 'groq' | 'openrouter'): string {
    if (this.config.get<string>('LLM_MODEL')) return this.config.get<string>('LLM_MODEL')!;
    return provider === 'groq' ? 'openai/gpt-oss-20b' : 'meta-llama/llama-3.3-70b-instruct';
  }

  /** Appel chat completion avec fallback automatique Groq → OpenRouter. */
  async chat(messages: LlmMessage[], maxTokens = 400): Promise<LlmResult> {
    const { answer } = await this.chatComplete(messages, maxTokens);
    return { answer, provider: answer ? (this.groqKey ? 'groq' : 'openrouter') : null };
  }

  /**
   * Chat complet en mode STREAMING : retourne un générateur de tokens texte
   * (delta.content), avec fallback silencieux (null) si aucun provider n'est
   * disponible. Le générateur tente Groq puis OpenRouter dans l'ordre.
   */
  async *streamChat(
    messages: LlmMessage[],
    maxTokens = 400,
  ): AsyncGenerator<{ token: string; provider: string } | { done: true }> {
    const providers: Array<{ name: 'groq' | 'openrouter'; url: string; key: string | null }> = [
      { name: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', key: this.groqKey },
      { name: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions', key: this.openRouterKey },
    ];

    for (const p of providers) {
      if (!p.key) continue;
      let yielded = false;
      try {
        const stream = await this.openStream(p.url, p.key, this.modelFor(p.name), messages, maxTokens);
        if (!stream) continue;
        for await (const token of stream) {
          yielded = true;
          yield { token, provider: p.name };
        }
        if (yielded) yield { done: true };
        return;
      } catch (e: any) {
        this.logger.warn(`Stream ${p.name} interrompu (${e?.message ?? 'erreur'})`);
        // Si on a déjà émis des tokens, on arrête proprement (mi-phrase).
        if (yielded) {
          yield { done: true };
          return;
        }
        // Sinon on tente le provider suivant.
      }
    }
    yield { done: true };
  }

  private async chatComplete(
    messages: LlmMessage[],
    maxTokens: number,
  ): Promise<{ answer: string | null }> {
    if (this.groqKey) {
      const answer = await this.callOpenAiCompatible(
        'https://api.groq.com/openai/v1/chat/completions',
        this.groqKey,
        this.modelFor('groq'),
        messages,
        maxTokens,
      );
      if (answer) return { answer };
    }
    if (this.openRouterKey) {
      const answer = await this.callOpenAiCompatible(
        'https://openrouter.ai/api/v1/chat/completions',
        this.openRouterKey,
        this.modelFor('openrouter'),
        messages,
        maxTokens,
      );
      if (answer) return { answer };
    }
    return { answer: null };
  }

  /**
   * Ouvre un flux SSE OpenAI-compatible (stream: true) et retourne un
   * générateur de deltas texte. null si le flux ne peut pas être ouvert.
   */
  private async openStream(
    url: string,
    apiKey: string,
    model: string,
    messages: LlmMessage[],
    maxTokens: number,
  ): Promise<AsyncGenerator<string> | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000) as unknown as ReturnType<typeof setTimeout>;
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.4,
          max_tokens: Math.max(maxTokens, 400),
          stream: true,
          reasoning_effort: 'low',
        }),
        signal: controller.signal,
      });
    } catch (e: any) {
      clearTimeout(timeout);
      this.logger.warn(`Stream ${model} indisponible (${e?.message ?? 'erreur'})`);
      return null;
    }
    clearTimeout(timeout);

    if (!res.ok || !res.body) {
      this.logger.warn(`Stream ${model} HTTP ${res.status}`);
      return null;
    }

    // Décodage incrémental du SSE : chaque ligne "data: {...}" contient un
    // delta.choices[0].delta.content ; "data: [DONE]" termine le flux.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    async function* iterate(): AsyncGenerator<string> {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') return;
            try {
              const json = JSON.parse(payload);
              const delta = json?.choices?.[0]?.delta?.content;
              if (typeof delta === 'string' && delta) yield delta;
            } catch {
              // Chunk JSON partiel/incomplet — ignoré, le buffer le complètera.
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
    return iterate();
  }

  private async callOpenAiCompatible(
    url: string,
    apiKey: string,
    model: string,
    messages: LlmMessage[],
    maxTokens: number,
  ): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000) as unknown as ReturnType<typeof setTimeout>;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.4,
          max_tokens: Math.max(maxTokens, 400),
          // gpt-oss épuise son budget en raisonnement interne si max_tokens
          // est trop bas → content vide. "low" garde la qualité et libère
          // les tokens pour la réponse.
          reasoning_effort: 'low',
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        this.logger.warn(`LLM ${model} HTTP ${res.status}`);
        return null;
      }
      const json: any = await res.json().catch((): null => null);
      const content = json?.choices?.[0]?.message?.content;
      return typeof content === 'string' && content.trim() ? content.trim() : null;
    } catch (e: any) {
      this.logger.warn(`LLM indisponible (${e?.message ?? 'erreur'})`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
