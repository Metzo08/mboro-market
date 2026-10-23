import { PrismaClient, UserRole, ShopStatus, ShopType } from '@prisma/client';

const prisma = new PrismaClient();

const HOURS = {
  monday: { open: '08:00', close: '20:00' },
  tuesday: { open: '08:00', close: '20:00' },
  wednesday: { open: '08:00', close: '20:00' },
  thursday: { open: '08:00', close: '20:00' },
  friday: { open: '08:00', close: '20:00' },
  saturday: { open: '08:00', close: '21:00' },
  sunday: { open: '09:00', close: '14:00' },
};

const RESTAURANT_HOURS = {
  monday: { open: '18:00', close: '23:30' },
  tuesday: { open: '18:00', close: '23:30' },
  wednesday: { open: '18:00', close: '23:30' },
  thursday: { open: '18:00', close: '23:30' },
  friday: { open: '18:00', close: '23:30' },
  saturday: { open: '18:00', close: '00:00' },
  sunday: { open: '18:00', close: '23:00' },
};

async function upsertUser(data: any) {
  const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (existing) return prisma.user.update({ where: { id: existing.id }, data });
  return prisma.user.create({ data });
}

async function upsertOrganization(data: any) {
  const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
  if (existing) return prisma.organization.update({ where: { id: existing.id }, data });
  return prisma.organization.create({ data });
}

async function upsertShop(data: any) {
  const existing = await prisma.shop.findUnique({ where: { slug: data.slug } });
  if (existing) return prisma.shop.update({ where: { id: existing.id }, data });
  return prisma.shop.create({ data });
}

async function upsertCategory(data: any) {
  const existing = await prisma.category.findFirst({ where: { slug: data.slug, shopId: null } });
  if (existing) return prisma.category.update({ where: { id: existing.id }, data });
  return prisma.category.create({ data });
}

async function upsertProduct(data: any) {
  const existing = await prisma.product.findFirst({
    where: { slug: data.slug, shopId: data.shopId },
  });
  if (existing) return prisma.product.update({ where: { id: existing.id }, data });
  return prisma.product.create({ data });
}

async function upsertSetting(key: string, value: any) {
  const existing = await prisma.setting.findFirst({
    where: { scope: 'global', organizationId: null, shopId: null, key },
  });
  if (existing) {
    return prisma.setting.update({ where: { id: existing.id }, data: { value, isValidated: true } });
  }
  return prisma.setting.create({
    data: { scope: 'global', key, value, isValidated: true },
  });
}

async function main() {
  console.log('🌱 Début du seed...');

  const admin = await upsertUser({
    phone: '+221700000000',
    email: 'admin@jendcithes.sn',
    role: UserRole.SUPER_ADMIN,
    status: 'ACTIVE',
    phoneVerified: true,
    emailVerified: true,
  });

  const merchant = await upsertUser({
    phone: '+221771234567',
    email: 'mame.diarra@jendcithes.sn',
    role: UserRole.MERCHANT,
    status: 'ACTIVE',
    phoneVerified: true,
  });

  const organization = await upsertOrganization({
    slug: 'jendcithes-senecarte',
    ownerId: admin.id,
    name: 'JëndCiThiès by Sen-E-Carte',
    legalName: 'Sen-E-Carte SARL',
    contactPhone: '+221700000000',
    contactEmail: 'contact@jendcithes.sn',
    address: 'Thiès, Sénégal',
    status: 'active',
    verificationStatus: 'verified',
  });

  // Raccord des commerçants à l'organisation de démonstration.
  for (const userId of [admin.id, merchant.id]) {
    const membership = await prisma.organizationMember.findFirst({
      where: { organizationId: organization.id, userId },
    });
    if (!membership) {
      await prisma.organizationMember.create({
        data: { organizationId: organization.id, userId, role: 'OWNER' },
      });
    }
  }

  const restaurant = await upsertShop({
    slug: 'dibiterie-chez-mame-diarra',
    organizationId: organization.id,
    ownerId: merchant.id,
    name: 'Dibiterie Chez Mame Diarra',
    type: ShopType.RESTAURANT,
    shortDescription: 'Grillades au feu de bois, dibi mouton et poulet',
    description:
      'Dibiterie familiale près du marché central de Mboro. Viande fraîche grillée au feu de bois, préparée à la commande.',
    phone: '+221771234567',
    whatsapp: '+221771234567',
    publicAddress: 'Près du marché central, Mboro, Thiès',
    status: ShopStatus.ACTIVE,
    verificationStatus: 'verified',
    openingHours: RESTAURANT_HOURS,
    seoTitle: 'Dibiterie Chez Mame Diarra — Grillades à Mboro',
    seoDescription: 'Dibi mouton et poulet grillé à Mboro. Commande en ligne, retrait ou livraison.',
    deliveryZones: [
      { id: 'mboro-centre', name: 'Mboro Centre', fee: 500 },
      { id: 'mboro-peripherie', name: 'Périphérie de Mboro', fee: 1000 },
    ],
  });

  const grocery = await upsertShop({
    slug: 'mboro-marche',
    organizationId: organization.id,
    ownerId: merchant.id,
    name: 'Mboro Marché',
    type: ShopType.RETAIL,
    shortDescription: 'Épicerie fine et produits du terroir',
    description: 'Produits frais, céréales et huiles locales de Mboro et de la région de Thiès.',
    phone: '+221771234567',
    whatsapp: '+221771234567',
    publicAddress: 'Marché de Mboro, Thiès',
    status: ShopStatus.ACTIVE,
    verificationStatus: 'verified',
    openingHours: HOURS,
    seoTitle: 'Mboro Marché — Produits locaux à Mboro',
    seoDescription: 'Fruits, légumes et épicerie locale livrés à Mboro et à Thiès.',
    deliveryZones: [
      { id: 'mboro-centre', name: 'Mboro Centre', fee: 500 },
      { id: 'thies-centre', name: 'Thiès Centre', fee: 1500 },
    ],
  });

  const workshop = await upsertShop({
    slug: 'atelier-ndiaye-menuiserie',
    organizationId: organization.id,
    ownerId: merchant.id,
    name: 'Atelier Ndiaye Menuiserie',
    type: ShopType.ARTISAN,
    shortDescription: 'Meubles sur mesure et réparations',
    description: 'Menuiserie artisanale à Thiès : meubles sur mesure, portes, réparations à domicile.',
    phone: '+221771234567',
    whatsapp: '+221771234567',
    publicAddress: 'Quartier Randoulène, Thiès',
    status: ShopStatus.ACTIVE,
    verificationStatus: 'pending',
    openingHours: HOURS,
    seoTitle: 'Atelier Ndiaye — Menuiserie à Thiès',
    seoDescription: 'Meubles sur mesure et menuiserie artisanale à Thiès.',
    deliveryZones: [{ id: 'thies-centre', name: 'Thiès Centre', fee: 1000 }],
  });

  const categories = [
    { name: 'Fruits & Légumes', slug: 'fruits-legumes', description: 'Produits frais de saison', sortOrder: 0 },
    { name: 'Épicerie', slug: 'epicerie', description: "Produits d'épicerie fine", sortOrder: 1 },
    { name: 'Restauration', slug: 'restauration', description: 'Plats et grillades', sortOrder: 2 },
    { name: 'Artisanat', slug: 'artisanat', description: 'Objets et travaux artisanaux', sortOrder: 3 },
    { name: 'Services', slug: 'services', description: 'Services de proximité', sortOrder: 4 },
  ];

  const categoryBySlug: Record<string, string> = {};
  for (const cat of categories) {
    const created = await upsertCategory({
      ...cat,
      shopId: null,
      isPublic: true,
      isActive: true,
    });
    categoryBySlug[cat.slug] = created.id;
  }

  const products = [
    {
      shopId: restaurant.id,
      categoryId: categoryBySlug['restauration'],
      title: 'Dibi mouton',
      slug: 'dibi-mouton',
      shortDescription: 'Mouton grillé au feu de bois, servi avec oignons et pain',
      description: 'Portion de mouton frais grillée au feu de bois, accompagnée de moutarde, oignons et pain. Préparée à la commande.',
      price: 2500,
      stock: 20,
      availability: 'in_stock',
    },
    {
      shopId: restaurant.id,
      categoryId: categoryBySlug['restauration'],
      title: 'Dibi poulet',
      slug: 'dibi-poulet',
      shortDescription: 'Poulet grillé, sauce maison',
      description: 'Demi-poulet grillé au feu de bois avec sauce maison et oignons frais.',
      price: 2000,
      stock: 15,
      availability: 'in_stock',
    },
    {
      shopId: restaurant.id,
      categoryId: categoryBySlug['restauration'],
      title: 'Ceeb u jën',
      slug: 'ceeb-u-jen',
      shortDescription: 'Riz au poisson, recette du jour',
      description: 'Riz au poisson préparé le jour même, légumes de saison.',
      price: 1500,
      stock: 10,
      availability: 'in_stock',
    },
    {
      shopId: grocery.id,
      categoryId: categoryBySlug['fruits-legumes'],
      title: 'Mangues fraîches de Mboro',
      slug: 'mangues-fraiches-mboro',
      shortDescription: 'Lot de 5 mangues cueillies à maturité',
      description: 'Lot de 5 mangues fraîches, cueillies à la main dans les vergers de Mboro.',
      price: 1500,
      promotionalPrice: 1200,
      stock: 50,
      availability: 'in_stock',
    },
    {
      shopId: grocery.id,
      categoryId: categoryBySlug['epicerie'],
      title: 'Riz local brisé 5 kg',
      slug: 'riz-local-brise-5kg',
      shortDescription: 'Riz brisé local de qualité supérieure',
      description: 'Sac de 5 kg de riz brisé local, cultivé dans la vallée du fleuve Sénégal.',
      price: 2500,
      stock: 100,
      availability: 'in_stock',
    },
    {
      shopId: grocery.id,
      categoryId: categoryBySlug['epicerie'],
      title: "Huile d'arachide 1 L",
      slug: 'huile-arachide-1l',
      shortDescription: 'Huile pressée à froid',
      description: "Bouteille d'un litre d'huile d'arachide pressée à froid.",
      price: 1800,
      stock: 0,
      availability: 'out_of_stock',
    },
    {
      shopId: workshop.id,
      categoryId: categoryBySlug['artisanat'],
      title: 'Tabouret en teck sur mesure',
      slug: 'tabouret-teck-sur-mesure',
      shortDescription: 'Fabrication artisanale, bois massif',
      description: 'Tabouret en teck massif, fabrication sur mesure. Délai indicatif : 7 jours ouvrés.',
      price: 15000,
      stock: 2,
      availability: 'made_to_order',
      leadTime: '7 jours ouvrés',
    },
  ];

  for (const product of products) {
    await upsertProduct({ ...product, status: 'active' });
  }

  // Zones de livraison structurées (source de vérité des frais).
  for (const shop of [restaurant, grocery, workshop]) {
    const zones = (shop.deliveryZones as any[]) ?? [];
    for (const zone of zones) {
      const existing = await prisma.deliveryZone.findFirst({
        where: { shopId: shop.id, name: zone.name },
      });
      const data = {
        shopId: shop.id,
        name: zone.name,
        territories: [zone.name],
        deliveryFee: zone.fee,
        estimatedMin: 20,
        estimatedMax: 45,
        isActive: true,
      };
      if (existing) {
        await prisma.deliveryZone.update({ where: { id: existing.id }, data });
      } else {
        await prisma.deliveryZone.create({ data });
      }
    }
  }

  // Abonnements de démonstration (flux SaaS séparé des ventes).
  for (const shop of [restaurant, grocery, workshop]) {
    const existing = await prisma.subscription.findUnique({ where: { shopId: shop.id } });
    const data = {
      status: (shop.slug === 'atelier-ndiaye-menuiserie' ? 'PAST_DUE' : 'ACTIVE') as any,
      planName: 'basic',
      price: 2500,
      currency: 'XOF',
      billingPeriod: 'monthly',
      startedAt: new Date(),
      nextDueAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    };
    if (existing) {
      await prisma.subscription.update({ where: { id: existing.id }, data });
    } else {
      await prisma.subscription.create({ data: { shopId: shop.id, ...data } });
    }
  }

  await upsertSetting('locations', [
    { name: 'Mboro', slug: 'mboro', region: 'Thiès', department: 'Mbour' },
    { name: 'Thiès', slug: 'thies', region: 'Thiès', department: 'Thiès' },
    { name: 'Mbour', slug: 'mbour', region: 'Thiès', department: 'Mbour' },
  ]);
  await upsertSetting('pricing', {
    activationFee: 5000,
    monthlyFee: 2500,
    currency: 'XOF',
    graceDays: 7,
  });
  await upsertSetting('payments', {
    methods: ['cash', 'wave', 'orange_money'],
    labels: {
      cash: 'Paiement à la livraison / retrait',
      wave: 'Wave',
      orange_money: 'Orange Money',
    },
  });
  await upsertSetting('brand', {
    slogan: 'Les commerces et services de Thiès, à portée de main',
    editor: 'Sen-E-Carte',
    supportPhone: '+221700000000',
    whatsapp: '+221700000000',
  });

  console.log('✅ Seed terminé : 3 boutiques, 7 produits, 5 catégories, 4 réglages.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
