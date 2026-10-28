import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { InitializePaymentDto } from './dto';
import { InitializeWavePaymentDto } from './dto/wave-payment.initialize.dto';

export interface CheckoutSession {
  checkoutUrl: string | null;
  providerReference: string | null;
  raw: any;
}

export interface PaydunyaCredentials {
  apiKey: string | null;
  apiToken: string | null;
}

/**
 * Client PayDunya (Orange Money / Carte / Wave via agrégateur).
 * Docs : https://developers.paydunya.com/api/v1/
 *
 * Les credentials proviennent de la boutique (`paymentSettings`) et sont
 * prioritaires sur les variables d'environnement : chaque commerçant
 * encaisse avec son propre compte PayDunya (CDC §10).
 * Mode sandbox : activé si la clé commence par "sandbox".
 */
@Injectable()
export class PaydunyaProvider {
  constructor(private config: ConfigService) {}

  /** Credentials boutique si configurees, sinon celles de l'environnement. */
  private resolve(creds?: PaydunyaCredentials | null): {
    apiKey: string | null;
    apiToken: string | null;
  } {
    return {
      apiKey: creds?.apiKey?.trim() || this.config.get('PAYDUNYA_API_KEY') || null,
      apiToken: creds?.apiToken?.trim() || this.config.get('PAYDUNYA_API_TOKEN') || null,
    };
  }

  get isConfigured(): boolean {
    return !!this.config.get('PAYDUNYA_API_KEY') && !!this.config.get('PAYDUNYA_API_TOKEN');
  }

  get isSandbox(): boolean {
    const key = this.config.get('PAYDUNYA_API_KEY') || '';
    return key.startsWith('sandbox');
  }

  async createCheckout(
    params: {
      amount: number;
      currency: string;
      reference: string;
      callbackUrl: string;
      cancelUrl?: string;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
    },
    creds?: PaydunyaCredentials | null,
  ): Promise<CheckoutSession> {
    const { apiKey, apiToken: secretKey } = this.resolve(creds);
    const isSandbox = apiKey?.startsWith('sandbox');
    const baseUrl = isSandbox
      ? 'https://sandbox.paydunya.com/api/v1/payment/request'
      : 'https://api.paydunya.com/api/v1/payment/request';

    if (!secretKey || !apiKey) {
      // Aucun credentials → session sandbox locale (le webhook reste la source de vérité)
      return {
        checkoutUrl: null,
        providerReference: null,
        raw: { sandbox: true, reason: 'PAYDUNYA non configuré' },
      };
    }

    const body = new URLSearchParams({
      api_key: apiKey,
      secret_key: secretKey,
      amount: String(params.amount),
      currency: params.currency,
      reference: params.reference,
      callback_url: params.callbackUrl,
      cancel_url: params.cancelUrl ?? params.callbackUrl,
      return_url: params.callbackUrl,
      customer_name: params.customerName ?? 'Client JëndCiThiès',
      customer_phone: params.customerPhone ?? '',
      customer_email: params.customerEmail ?? '',
      mode: 'live',
    });

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const json: any = await res.json().catch((): null => null);
    if (!res.ok || !json) {
      throw new Error(`PayDunya indisponible (HTTP ${res.status})`);
    }
    if (json.error) {
      throw new Error(`PayDunya: ${json.error}`);
    }
    return {
      checkoutUrl: json.payment_url ?? json.checkout_url ?? null,
      providerReference: json.token ?? json.transaction_id ?? null,
      raw: json,
    };
  }
}

/**
 * Client Wave Business (Wave Money).
 * Docs : https://docs.wave.com/developers/business-apis
 *
 * Les credentials proviennent de la boutique (`paymentSettings`) et sont
 * prioritaires sur les variables d'environnement : chaque commerçant
 * encaisse avec son propre compte Wave (CDC §10).
 * Sandbox : activé si la clé commence par "wave-sandbox".
 */
export interface WaveCredentials {
  apiKey: string | null;
  businessId?: string | null;
}

@Injectable()
export class WaveProvider {
  constructor(private config: ConfigService) {}

  /** Credentials boutique si configurees, sinon celles de l'environnement. */
  private resolve(creds?: WaveCredentials | null): {
    apiKey: string | null;
    businessId: string | null;
  } {
    const apiKey =
      creds?.apiKey?.trim() || this.config.get('WAVE_API_KEY') || null;
    const businessId =
      creds?.businessId?.trim() || this.config.get('WAVE_BUSINESS_ID') || null;
    return { apiKey, businessId };
  }

  get isConfigured(): boolean {
    return !!this.config.get('WAVE_API_KEY');
  }

  get isSandbox(): boolean {
    const key = this.config.get('WAVE_API_KEY') || '';
    return key.startsWith('wave-sandbox');
  }

  async createCheckout(
    params: {
      amount: number;
      currency: string;
      reference: string;
      callbackUrl: string;
      customerPhone?: string;
    },
    creds?: WaveCredentials | null,
  ): Promise<CheckoutSession> {
    const { apiKey, businessId } = this.resolve(creds);
    if (!apiKey) {
      return {
        checkoutUrl: null,
        providerReference: null,
        raw: { sandbox: true, reason: 'WAVE non configuré' },
      };
    }

    const isSandbox = apiKey.startsWith('wave-sandbox');
    const baseUrl = isSandbox
      ? 'https://wave-sandbox.ml/business/checkout'
      : 'https://api.wave.com/business/checkout';
    const body = {
      business_id: businessId,
      amount: params.amount,
      currency: params.currency,
      reference: params.reference,
      success_url: params.callbackUrl,
      cancel_url: params.callbackUrl,
      customer_phone: params.customerPhone,
      checkout_type: 'web',
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json: any = await res.json().catch((): null => null);
    if (!res.ok || !json) {
      throw new Error(`Wave indisponible (HTTP ${res.status})`);
    }
    return {
      checkoutUrl: json.wave_checkout_url ?? json.checkout_url ?? null,
      providerReference: json.checkout_session_id ?? json.id ?? null,
      raw: json,
    };
  }
}

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private wave: WaveProvider,
    private paydunya: PaydunyaProvider,
    private shops: ShopsService,
  ) {}

  // CDC §10.2 : vérification HMAC obligatoire — webhook falsifié = rejeté
  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    const secret = this.config.get('WEBHOOK_SECRET') || process.env.WEBHOOK_SECRET;
    if (!secret) return false; // sans secret configuré → rejet par défaut
    if (!signature) return false;
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  async initialize(dto: InitializePaymentDto) {
    if (!dto.orderId) throw new BadRequestException('orderId requis');
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    const provider = (dto.provider ?? 'sandbox').toLowerCase();
    const method = (dto.paymentMethod ?? '').toLowerCase();

    // Paiement hors-ligne : pas d'appel provider (CDC §10.3)
    const offline = method === 'cod' || method === 'cash' || method === 'pickup';
    const prismaMethod =
      method === 'pickup'
        ? 'PICKUP'
        : method === 'cod' || method === 'cash'
          ? 'CASH_ON_DELIVERY'
          : 'ONLINE';
    if (offline) {
      const transaction = await this.prisma.transaction.create({
        data: {
          transactionReference: `TXN-${Date.now()}`,
          orderId: order.id,
          invoiceId: dto.invoiceId,
          shopId: order.shopId,
          provider: method,
          amount: order.total,
          currency: order.currency,
          paymentMethod: prismaMethod as any,
          status: 'PENDING',
        },
      });
      return {
        transactionId: transaction.id,
        reference: transaction.transactionReference,
        amount: transaction.amount,
        currency: transaction.currency,
        provider: transaction.provider,
        status: transaction.status,
        checkoutUrl: null as string | null,
        offline: true,
      };
    }

    const reference = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const callbackUrl =
      dto.returnUrl || this.config.get('PAYMENT_CALLBACK_URL') || 'http://localhost:3001/orders';

    // Reglements configures par la boutique (chiffres au repos, dechiffres
    // ici). Ils sont prioritaires sur les credentials de l'environnement.
    const shopSettings = await this.shops.getPaymentSettings(order.shopId);

    // Le commerçant peut restreindre les moyens de paiement acceptes :
    // on refuse un moyen qu'il a desactive (CDC §10).
    const accepted = shopSettings?.acceptedPaymentMethods ?? [];
    if (accepted.length > 0) {
      const requested = provider !== 'sandbox' ? provider : method;
      if (
        (requested === 'wave' || requested === 'paydunya') &&
        !accepted.includes(requested)
      ) {
        throw new BadRequestException(
          "Ce moyen de paiement n'est pas accepte par cette boutique",
        );
      }
    }

    // Appel réel au provider (Wave / PayDunya) — sinon session sandbox
    let session: CheckoutSession = {
      checkoutUrl: null,
      providerReference: null,
      raw: { sandbox: true },
    };
    try {
      if (provider === 'wave' || method === 'wave') {
        session = await this.wave.createCheckout(
          {
            amount: Number(order.total),
            currency: order.currency,
            reference,
            callbackUrl,
            customerPhone: dto.phone,
          },
          {
            apiKey: shopSettings?.waveApiKey ?? null,
            businessId: shopSettings?.waveBusinessId ?? null,
          },
        );
      } else if (provider === 'paydunya' || method === 'paydunya') {
        session = await this.paydunya.createCheckout(
          {
            amount: Number(order.total),
            currency: order.currency,
            reference,
            callbackUrl,
            customerPhone: dto.phone,
          },
          {
            apiKey: shopSettings?.paydunyaApiKey ?? null,
            apiToken: shopSettings?.paydunyaApiToken ?? null,
          },
        );
      }
    } catch (e: any) {
      throw new BadRequestException(
        `Initialisation du paiement impossible : ${e?.message ?? 'erreur inconnue'}`,
      );
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        transactionReference: reference,
        orderId: order.id,
        invoiceId: dto.invoiceId,
        shopId: order.shopId,
        provider: provider === 'sandbox' ? (method || 'sandbox') : provider,
        amount: order.total,
        currency: order.currency,
        paymentMethod: (dto.paymentMethod as any) ?? null,
        providerTransactionId: session.providerReference as string | null,
        status: session.checkoutUrl ? 'PENDING' : 'CREATED',
      },
    });

    return {
      transactionId: transaction.id,
      reference: transaction.transactionReference,
      amount: transaction.amount,
      currency: transaction.currency,
      provider: transaction.provider,
      status: transaction.status,
      checkoutUrl: session.checkoutUrl,
      providerReference: session.providerReference,
      sandbox: !session.checkoutUrl,
    };
  }

  async handleWebhook(provider: string, payload: any, signature?: string, rawBody?: string) {
    // PAY-004 : webhook falsifié rejeté — signature HMAC obligatoire
    if (rawBody !== undefined) {
      const ok = this.verifyWebhookSignature(rawBody, signature);
      if (!ok) throw new ForbiddenException('Signature webhook invalide');
    }
    if (!payload?.reference) throw new BadRequestException('Référence manquante');
    const existing = await this.prisma.transaction.findFirst({
      where: { webhookId: payload.id },
    });
    if (existing) {
      return { status: 'already_processed' };
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { transactionReference: payload.reference },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction introuvable');
    }
    // PAY-003 : vérification montant — jamais confirmer un montant différent
    if (payload.amount != null && Number(payload.amount) !== Number(transaction.amount)) {
      throw new BadRequestException('Montant webhook incohérent');
    }
    if (transaction.status === 'SUCCEEDED') {
      return { status: 'already_processed' };
    }
    const newStatus = payload.status ?? 'SUCCEEDED';

    return this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus as any,
          providerTransactionId: (payload.providerTransactionId || null) as string | null,
          webhookId: payload.id,
          webhookPayload: payload as any,
          verifiedAt: new Date(),
        },
      });
      if (transaction.orderId && newStatus === 'SUCCEEDED') {
        await tx.order.update({
          where: { id: transaction.orderId },
          data: { paymentStatus: 'SUCCEEDED' },
        });
      }
      if (transaction.orderId && newStatus === 'FAILED') {
        await tx.order.update({
          where: { id: transaction.orderId },
          data: { paymentStatus: 'FAILED' },
        });
      }
      return { status: newStatus };
    });
  }

  async findOne(id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) {
      throw new NotFoundException('Transaction introuvable');
    }
    return tx;
  }

  async refund(id: string, dto: any) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) {
      throw new NotFoundException('Transaction introuvable');
    }
    return this.prisma.transaction.update({
      where: { id },
      data: { status: 'REFUNDED' },
    });
  }
  
  async processWaveWebhook(payload: any) {
    // CDC §10.3 : traiter le webhook checkout.session.payment_completed de Wave
    if (!payload?.type || payload.type !== "checkout.session.payment_completed") {
      throw new BadRequestException("Evenement webhook Wave inattendu");
    }
    const { data, object } = payload;
    const session = data?.object ?? data;
    const reference = session?.metadata?.reference ?? session?.id;
    const amount = session?.amount_total ? Number(session.amount_total) / 100 : null;
    const paymentIntentId = session?.payment_intent;
    const status = session?.status === "completed" ? "SUCCEEDED" : session?.status;
    
    // Trouver la transaction par le reference ou payment_intent
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        OR: [
          { providerTransactionId: paymentIntentId as any },
          { webhookId: session.id }
        ]
      }
    });
    
    if (!transaction) {
      throw new NotFoundException("Transaction introuvable pour le payment_intent: " + paymentIntentId);
    }
    
    // Éviter le double-traitement
    if (transaction.status === "SUCCEEDED") {
      return { status: "already_processed" };
    }
    
    // Mettre à jour la transaction
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: status as any,
        
        providerTransactionId: paymentIntentId ? (paymentIntentId as any) : transaction.providerTransactionId,
        webhookId: session.id,
        verifiedAt: new Date()
      }
    });
    
    // Mettre à jour le statut de la commande si elle existe
    if (transaction.orderId) {
      const order = await this.prisma.order.findUnique({ where: { id: transaction.orderId } });
      await this.prisma.order.update({
        where: { id: transaction.orderId },
        data: { paymentStatus: status === "SUCCEEDED" ? "SUCCEEDED" : (order?.paymentStatus || "PENDING") }
      });
    }
    
    return { status };
  }
}
