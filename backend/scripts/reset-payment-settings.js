/** Remet a zero les paymentSettings d'une boutique (nettoyage des tests E2E). */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const shopId = process.argv[2];
  if (!shopId) {
    console.log('Usage : node scripts/reset-payment-settings.js <shopId>');
    process.exit(1);
  }
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) {
    console.log('Boutique introuvable :', shopId);
    process.exit(1);
  }
  const settings = shop.settings ?? {};
  delete settings.paymentSettings;
  await prisma.shop.update({ where: { id: shopId }, data: { settings } });
  console.log('paymentSettings supprime pour', shop.name);
  await prisma.$disconnect();
})();
