import { PrismaClient, UserRole, ShopStatus, ShopType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // 1. Créer un super admin
  const superAdmin = await prisma.user.upsert({
    where: { phone: '+221700000000' },
    update: {},
    create: {
      phone: '+221700000000',
      email: 'admin@jendcithes.sn',
      role: UserRole.SUPER_ADMIN,
      status: 'ACTIVE',
      phoneVerified: true,
      emailVerified: true,
    },
  });
  console.log(`✓ Super admin créé: ${superAdmin.phone}`);

  // 2. Créer une organisation par défaut
  const organization = await prisma.organization.upsert({
    where: { slug: 'jendcithes-senecarte' },
    update: {},
    create: {
      ownerId: superAdmin.id,
      name: 'JëndCiThiès by Sen-E-Carte',
      legalName: 'Sen-E-Carte SARL',
      slug: 'jendcithes-senecarte',
      contactPhone: '+221700000000',
      contactEmail: 'contact@jendcithes.sn',
      address: 'Thiès, Sénégal',
      status: 'active',
      verificationStatus: 'verified',
    },
  });
  console.log(`✓ Organisation créée: ${organization.name}`);

  // 3. Créer une boutique de démo
  const shop = await prisma.shop.upsert({
    where: { slug: 'mboro-marche' },
    update: {},
    create: {
      organizationId: organization.id,
      ownerId: superAdmin.id,
      name: 'Mboro Marché',
      slug: 'mboro-marche',
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
    },
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
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        ...cat,
        shopId: shop.id,
        isPublic: true,
        isActive: true,
        sortOrder: categories.indexOf(cat),
      },
    });
  }
  console.log(`✓ ${categories.length} catégories créées`);

  // 5. Créer des produits de démo
  const fruitsCategory = await prisma.category.findUnique({ where: { slug: 'fruits-legumes' } });
  const epicerieCategory = await prisma.category.findUnique({ where: { slug: 'epicerie' } });

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
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        ...prod,
        shopId: shop.id,
      },
    });
  }
  console.log(`✓ ${products.length} produits créés`);

  // 6. Créer un abonnement pour la boutique
  await prisma.subscription.upsert({
    where: { shopId: shop.id },
    update: {},
    create: {
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
