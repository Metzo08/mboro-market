/**
 * Test E2E du flux "reglages de paiement" commercant.
 * Usage : node scripts/test-payment-settings-e2e.js
 * Verifie : GET /shops/me -> PATCH /shops/:id -> relecture GET /shops/me
 */
const { PrismaClient } = require('@prisma/client');

const API = process.env.API_URL || 'http://localhost:3000/api';
const PHONE = process.env.TEST_PHONE || '+221700000000';

const prisma = new PrismaClient();

async function main() {
  // 1. On declenche un OTP pour ce telephone
  await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: PHONE }),
  });

  // 2. On recupere le code directement en base (contourne la console backend)
  const otp = await prisma.otpCode.findUnique({ where: { phone: PHONE } });
  if (!otp) throw new Error(`Aucun OTP pour ${PHONE}`);
  console.log('OTP obtenu :', otp.code);

  // 3. Verification de l OTP -> JWT
  const authRes = await fetch(`${API}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: PHONE, code: otp.code }),
  });
  if (!authRes.ok) throw new Error(`verify-otp HTTP ${authRes.status}: ${await authRes.text()}`);
  const auth = await authRes.json();
  const token = auth.access_token;
  console.log('Token obtenu, role =', auth.user?.role);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 4. GET /shops/me
  const meRes = await fetch(`${API}/shops/me`, { headers });
  if (!meRes.ok) throw new Error(`GET /shops/me HTTP ${meRes.status}: ${await meRes.text()}`);
  const shop = await meRes.json();
  console.log('Boutique :', shop.id, '-', shop.name);
  console.log('paymentSettings recu :', JSON.stringify(shop.settings?.paymentSettings));

  // 5. PATCH /shops/:id avec paymentSettings
  const patchRes = await fetch(`${API}/shops/${shop.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      paymentSettings: {
        waveApiKey: 'wave-sandbox_e2e_key',
        waveSecretKey: 'wave-sandbox_e2e_secret',
        paydunyaApiKey: 'test_e2e_key',
        paydunyaApiToken: 'test_e2e_token',
        acceptedPaymentMethods: ['wave', 'cod'],
      },
    }),
  });
  const patchBody = await patchRes.text();
  if (!patchRes.ok) throw new Error(`PATCH HTTP ${patchRes.status}: ${patchBody}`);
  console.log('PATCH OK ->', patchBody.slice(0, 200));

  // 6. Relecture : les secrets ne doivent PAS revenir, les drapeaux si
  const me2 = await fetch(`${API}/shops/me`, { headers });
  const shop2 = await me2.json();
  const ps = shop2.settings?.paymentSettings ?? {};
  console.log('Relecture paymentSettings :', JSON.stringify(ps));

  const checks = [
    ['cle publique Wave conservee', ps.waveApiKey === 'wave-sandbox_e2e_key'],
    ['secret Wave NON renvoye', ps.waveSecretKey === undefined],
    ['token PayDunya NON renvoye', ps.paydunyaApiToken === undefined],
    ['drapeau secret Wave present', ps.hasWaveSecretKey === true],
    ['drapeau token PayDunya present', ps.hasPaydunyaApiToken === true],
    ['moyens de paiement enregistres', JSON.stringify(ps.acceptedPaymentMethods) === JSON.stringify(['wave', 'cod'])],
  ];

  // 7. Verification en base : le secret est bien persiste
  const row = await prisma.shop.findUnique({ where: { id: shop.id } });
  const dbPs = row.settings?.paymentSettings ?? {};
  checks.push(['secret Wave persiste en base', dbPs.waveSecretKey === 'wave-sandbox_e2e_secret']);
  checks.push(['token PayDunya persiste en base', dbPs.paydunyaApiToken === 'test_e2e_token']);

  // 8. Un secret vide ne doit pas ecraser la valeur existante
  await fetch(`${API}/shops/${shop.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ paymentSettings: { waveApiKey: 'wave-sandbox_e2e_key', waveSecretKey: '' } }),
  });
  const row2 = await prisma.shop.findUnique({ where: { id: shop.id } });
  checks.push([
    'secret existant conserve quand envoye vide',
    row2.settings?.paymentSettings?.waveSecretKey === 'wave-sandbox_e2e_secret',
  ]);

  // 9. L'endpoint public ne doit jamais exposer les secrets
  const publicRes = await fetch(`${API}/shops/${shop.id}`);
  const publicShop = await publicRes.json();
  const publicPs = publicShop.settings?.paymentSettings ?? {};
  checks.push(['endpoint public sans secret Wave', publicPs.waveSecretKey === undefined]);
  checks.push(['endpoint public sans token PayDunya', publicPs.paydunyaApiToken === undefined]);

  let failed = 0;
  for (const [label, ok] of checks) {
    console.log(`${ok ? 'OK   ' : 'ECHEC'} ${label}`);
    if (!ok) failed++;
  }
  console.log(failed === 0 ? '\nTOUS LES CONTROLES PASSENT' : `\n${failed} CONTROLE(S) EN ECHEC`);
  process.exit(failed === 0 ? 0 : 1);
}

main()
  .catch((e) => {
    console.error('ERREUR :', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
