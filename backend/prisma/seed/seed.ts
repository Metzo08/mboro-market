import { PrismaClient, UserRole, ShopStatus, ShopType } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertCategory(data: any) {
  const existing = await prisma.category.findFirst({ where: { slug: data.slug } });
  if (existing) {
    return prisma.category.update({ where: { id: existing.id }, data });
  }
  return prisma.category.create({ data });
}

async function upsertProduct(data: any) {
  const existing = await prisma.product.findFirst({ where: { slug: data.slug } });
  if (existing) {
    return prisma.product.update({ where: { id: existing.id }, data });
  }
  return prisma.product.create({ data });
}

async function upsertUser(data: any) {
  const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (existing) {
    return prisma.user.update({ where: { id: existing.id }, data });
  }
  return prisma.user.create({ data });
}

async function upsertOrganization(data: any) {
  const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return prisma.organization.update({ where: { id: existing.id }, data });
  }
  return prisma.organization.create({ data });
}

async function upsertShop(data: any) {
  const existing = await prisma.shop.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return prisma.shop.update({ where: { id: existing.id }, data });
  }
  return prisma.shop.create({ data });
}

async function main() {
  console.log('🌱 Début du seed...');

  // 1. Créer un super admin
  const superAdmin = await upsertUser({
    phone: '+221700000000',
    email: 'admin@jendcithes.sn',
    role: UserRole.SUPER_ADMIN,
    status: 'ACTIVE',
    phoneVerified: true,
    emailVerified: true,
  });
  console.log(`✓ Super admin créé: ${superAdmin.phone}`);

  // 2. Créer une organisation par défaut
  const organization = await upsertOrganization({
    slug: 'jendcithes-senecarte',
    ownerId: superAdmin.id,
    name: 'JëndCiThiès by Sen-E-Carte',
    legalName: 'Sen-E-Carte SARL',
    contactPhone: '+221700000000',
    contactEmail: 'contact@jendcithes.sn',
    address: 'Thiès, Sénégal',
    status: 'active',
    verificationStatus: 'verified',
  });
  console.log(`✓ Organisation créée: ${organization.name}`);

  // 3. Créer une boutique de démo
  const shop = await upsertShop({
    slug: 'mboro-marche',
    organizationId: organization.id,
    ownerId: superAdmin.id,
    name: 'Mboro Marché',
    type: ShopType.RETAIL,
    description: 'Produits frais et locaux de Mboro',
    shortDescription: 'Épicerie fine et produits du terroir',
    phone: '+221771234567',
    email: 'contact@mboro-marche.sn',
    whatsapp: '+221771234567',
    publicAddress: 'Marché de Mboro, Thiès, Sénégal',
    status: ShopStatus.ACTIVE,
    verificationStatus: 'verified',
    seoTitle: 'Mboro Marché - Produits locaux Thiès',
    seoDescription: 'Découvrez les produits frais et locaux de Mboro',
  });
  console.log(`✓ Boutique créée: ${shop.name}`);

  // 4. Créer des catégories
  const categories = [
    { name: 'Fruits & Légumes', slug: 'fruits-legumes', description: 'Produits frais de saison' },
    { name: 'Épicerie', slug: 'epicerie', description: 'Produits d\'épicerie fine' },
    { name: 'Artisanat', slug: 'artisanat', description: 'Objets artisanaux locaux' },
    { name: 'Services', slug: 'services', description: 'Services de proximité' },
  ];

  for (const cat of categories) {
    await upsertCategory({
      ...cat,
      shopId: shop.id,
      isPublic: true,
      isActive: true,
      sortOrder: categories.indexOf(cat),
    });
  }
  console.log(`✓ ${categories.length} catégories créées`);

  // 5. Créer des produits de démo
  const fruitsCategory = await prisma.category.findFirst({ where: { slug: 'fruits-legumes' } });
  const epicerieCategory = await prisma.category.findFirst({ where: { slug: 'epicerie' } });

  const products = [
    {
      title: 'Mangues fraîches de Mboro',
      slug: 'mangues-fraîches-mboro',
      shortDescription: 'Mangues juteuses et sucrées de la région de Mboro',
      description: 'Lot de 5 mangues fraîches, cueillies à la main dans les vergers de Mboro.',
      price: 1500,
      stock: 50,
      categoryId: fruitsCategory?.id,
      status: 'active',
      availability: 'in_stock',
    },
    {
      title: 'Riz local broken',
      slug: 'riz-local-broken',
      shortDescription: 'Riz brisé local de qualité supérieure',
      description: 'Sack de 5kg de riz brisé local, cultivé dans la vallée du Fleuve Sénégal.',
      price: 2500,
      stock: 100,
      categoryId: epicerieCategory?.id,
      status: 'active',
      availability: 'in_stock',
    },
    {
      title: 'Huile d\'arachide',
      slug: 'huile-arachide',
      shortDescription: 'Huile d\'arachide pure et naturelle',
      description: 'Bouteille d\'1 litre d\'huile d\'arachide pressée à froid.',
      price: 1800,
      stock: 30,
      categoryId: epicerieCategory?.id,
      status: 'active',
      availability: 'in_stock',
    },
  ];

  for (const prod of products) {
    await upsertProduct({
      ...prod,
      shopId: shop.id,
    });
  }
  console.log(`✓ ${products.length} produits créés`);

  // 6. Créer un abonnement pour la boutique
  const existingSub = await prisma.subscription.findFirst({ where: { shopId: shop.id } });
  if (existingSub) {
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        status: 'ACTIVE',
        planName: 'basic',
        price: 2500,
        currency: 'XOF',
        billingPeriod: 'monthly',
        startedAt: new Date(),
        nextDueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        shopId: shop.id,
        status: 'ACTIVE',
        planName: 'basic',
        price: 2500,
        currency: 'XOF',
        billingPeriod: 'monthly',
        startedAt: new Date(),
        nextDueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✓ Abonnement créé pour la boutique`);

  console.log('✅ Seed terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
