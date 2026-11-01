import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { CheckoutSession } from './payments.service';

/**
 * Provider de paiement SIMULÉ (sandbox de démonstration).
 * CDC §20 : « Pas de paiement simulé présenté comme réel » — ce provider est
 * toujours explicitement marqué `sandbox: true` dans ses réponses, et génère
 * une page de paiement hors-ligne que le webhook local confirmera.
 *
 * Utilisé quand aucune clé réelle (Wave / PayDunya) n'est configurée, ou quand
 * le client demande explicitement provider=sandbox.
 */
@Injectable()
export class SandboxProvider {
  constructor(private config: ConfigService) {}

  /**
   * Génère une "page de paiement" simulée : une URL locale vers une page
   * frontend /checkout/sandbox qui affiche un faux tunnel de paiement et
   * déclenche le webhook de confirmation signé.
   */
  createCheckout(params: {
    amount: number;
    currency: string;
    reference: string;
    frontendUrl?: string;
    customerPhone?: string;
  }): CheckoutSession {
    const frontendUrl =
      this.config.get('SANDBOX_FRONTEND_URL') || 'http://localhost:3000';
    // La page sandbox reçoit la référence et le montant pour simuler le tunnel
    const checkoutUrl = `${frontendUrl}/checkout/sandbox?ref=${encodeURIComponent(params.reference)}&amount=${params.amount}&currency=${params.currency}`;

    return {
      checkoutUrl,
      providerReference: `SANDBOX-${Date.now()}`,
      raw: {
        sandbox: true,
        provider: 'sandbox',
        note: 'Paiement simulé — aucune transaction réelle. Confirmé via webhook local signé.',
      },
    };
  }

  /**
   * Génère la signature HMAC du webhook sandbox (même mécanisme que les
   * providers réels : le webhook doit présenter x-webhook-signature).
   */
  signPayload(payload: object): string {
    const secret =
      this.config.get('WEBHOOK_SECRET') || process.env.WEBHOOK_SECRET || '';
    return createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  }
}
