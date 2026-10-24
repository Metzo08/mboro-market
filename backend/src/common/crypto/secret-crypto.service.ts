import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/**
 * Chiffrement des secrets au repos (CDC §11.5 : « secrets chiffrés au repos
 * et accessibles uniquement au service nécessaire »).
 *
 * Format stocké : `enc:v1:<iv>:<tag>:<ciphertext>` (base64url).
 * Le préfixe `enc:v1:` permet de distinguer une valeur chiffrée d'une
 * valeur historique en clair (migrée à la volée lors de la prochaine
 * écriture) sans jamais lever d'erreur sur la donnée existante.
 */
const PREFIX = 'enc:v1:';
const ALGO = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

@Injectable()
export class SecretCryptoService {
  private readonly logger = new Logger(SecretCryptoService.name);
  private warned = false;

  constructor(private config: ConfigService) {}

  /**
   * Clé de chiffrement dérivée de `SECRET_ENCRYPTION_KEY`.
   * À défaut, `JWT_SECRET` est utilisé (déjà secret et obligatoire en
   * production) ; en dernier recours une valeur de développement est
   * employée avec un avertissement explicite.
   */
  private deriveKey(): Buffer {
    const secret =
      this.config.get<string>('SECRET_ENCRYPTION_KEY') ||
      this.config.get<string>('JWT_SECRET') ||
      'change_me_in_production';

    if (!this.config.get<string>('SECRET_ENCRYPTION_KEY') && !this.warned) {
      this.logger.warn(
        'SECRET_ENCRYPTION_KEY non défini : les secrets boutique sont chiffrés avec une clé dérivée de JWT_SECRET. Définissez SECRET_ENCRYPTION_KEY en production.',
      );
      this.warned = true;
    }

    return scryptSync(secret, 'jendcithies.payment-settings.v1', KEY_BYTES);
  }

  /** Chiffre une valeur. Une valeur vide est renvoyée telle quelle. */
  encrypt(plain: string | null | undefined): string | null {
    if (plain === null || plain === undefined) return null;
    if (plain === '') return '';
    // Ne jamais chiffrer deux fois une valeur déjà chiffrée.
    if (this.isEncrypted(plain)) return plain;

    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGO, this.deriveKey(), iv);
    const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return [
      'enc',
      'v1',
      iv.toString('base64url'),
      tag.toString('base64url'),
      ciphertext.toString('base64url'),
    ].join(':');
  }

  /** Déchiffre une valeur. Les valeurs historiques en clair sont renvoyées intactes. */
  decrypt(payload: string | null | undefined): string | null {
    if (payload === null || payload === undefined) return null;
    if (!this.isEncrypted(payload)) return payload; // valeur legacy en clair

    const [, version, ivB64, tagB64, dataB64] = payload.split(':');
    if (version !== 'v1' || !ivB64 || !tagB64 || !dataB64) {
      throw new Error('Secret chiffré invalide : format inattendu');
    }

    const decipher = createDecipheriv(ALGO, this.deriveKey(), Buffer.from(ivB64, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  /** Indique si la valeur est déjà au format chiffré. */
  isEncrypted(value: string | null | undefined): boolean {
    return typeof value === 'string' && value.startsWith(PREFIX);
  }
}
