/**
 * Les rôles Prisma sont en MAJUSCULES (CUSTOMER, MERCHANT, ADMIN, SUPER_ADMIN).
 * Les décorateurs historiques utilisent des minuscules : on normalise toujours
 * avant comparaison pour éviter les refus d'accès silencieux.
 */
export function normalizeRole(role?: string | null): string {
  return (role ?? '').toUpperCase();
}

export function isAdminRole(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'ADMIN' || normalized === 'SUPER_ADMIN';
}

export function isMerchantRole(role?: string | null): boolean {
  return normalizeRole(role) === 'MERCHANT';
}
