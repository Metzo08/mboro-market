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
    if (this.groqKey) {
      const answer = await this.callOpenAiCompatible(
        'https://api.groq.com/openai/v1/chat/completions',
        this.groqKey,
        this.modelFor('groq'),
        messages,
        maxTokens,
      );
      if (answer) return { answer, provider: 'groq' };
    }
    if (this.openRouterKey) {
      const answer = await this.callOpenAiCompatible(
        'https://openrouter.ai/api/v1/chat/completions',
        this.openRouterKey,
        this.modelFor('openrouter'),
        messages,
        maxTokens,
      );
      if (answer) return { answer, provider: 'openrouter' };
    }
    return { answer: null, provider: null };
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
