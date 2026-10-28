import { PrismaClient, UserRole, ShopStatus, ShopType } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertCategory(data: any) {
  const existing = await prisma.category.findFirst({ where: { slug: data.slug, shopId: data.shopId ?? null } });
  if (existing) return prisma.category.update({ where: { id: existing.id }, data });
  return prisma.category.create({ data });
}

async function upsertProduct(data: any) {
  const { shopId, categoryId, media, customFields, ...rest } = data;
  const existing = await prisma.product.findFirst({
    where: { slug: rest.slug, shopId: shopId },
    include: { media: true },
  });
  if (existing) {
    const updateData: any = {
      ...rest,
      customFields,
    };
    // Mettre à jour ou créer le média associé
    if (media?.create) {
      const existingMedia = existing.media[0];
      if (existingMedia) {
        await prisma.mediaAsset.update({
          where: { id: existingMedia.id },
          data: { path: media.create.path, type: media.create.type, altText: media.create.altText, moderationStatus: media.create.moderationStatus },
        });
      } else {
        await prisma.mediaAsset.create({
          data: {
            ...media.create,
            product: { connect: { id: existing.id } },
          },
        });
      }
    }
    return prisma.product.update({ where: { id: existing.id }, data: updateData });
  }
  return prisma.product.create({
    data: {
      ...rest,
      shop: { connect: { id: shopId } },
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      customFields,
      media: media ? { create: media.create } : undefined,
    },
  });
}

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

async function upsertShopMedia(shopId: string, image: string, altText: string) {
  const existing = await prisma.mediaAsset.findFirst({
    where: { productId: null, shopId, moderationStatus: 'approved' },
  });
  if (existing) {
    return prisma.mediaAsset.update({
      where: { id: existing.id },
      data: { path: image, altText, type: 'image' },
    });
  }
  return prisma.mediaAsset.create({
    data: {
      shopId,
      path: image,
      type: 'image',
      altText,
      moderationStatus: 'approved',
    },
  });
}

async function main() {
  console.log('Seed starting...');

  const superAdmin = await upsertUser({
    phone: '+221700000000',
    email: 'admin@jendcithes.sn',
    role: UserRole.SUPER_ADMIN,
    status: 'ACTIVE',
    phoneVerified: true,
    emailVerified: true,
  });
  console.log('Super admin:', superAdmin.phone);

  const organization = await upsertOrganization({
    slug: 'jendcithes-senecarte',
    ownerId: superAdmin.id,
    name: 'JendCithees by Sen-E-Carte',
    legalName: 'Sen-E-Carte SARL',
    contactPhone: '+221700000000',
    contactEmail: 'contact@jendcithes.sn',
    address: 'Thies, Senegal',
    status: 'active',
    verificationStatus: 'verified',
  });
  console.log('Organization:', organization.name);

  // 3. 8 shops (CDC §7)
  const shopsData: any[] = [
    {
      slug: 'mboro-marche', name: 'Mboro Marché', type: ShopType.RETAIL,
      shortDescription: 'Épicerie fine', description: 'Produits frais et locaux de Mboro.',
      phone: '+221771234567', email: 'contact@mboro-marche.sn', whatsapp: '+221771234567',
      publicAddress: 'Marché de Mboro, Thiès, Sénégal', status: ShopStatus.ACTIVE,
      verificationStatus: 'verified',
      seoTitle: 'Mboro Marché - Produits locaux', seoDescription: 'Produits frais et locaux de Mboro.',
      organizationId: organization.id, ownerId: superAdmin.id,
    },
    {
      slug: 'restaurant-baobab', name: 'Restaurant Le Baobab', type: ShopType.RESTAURANT,
      shortDescription: 'Plats traditionnels', description: 'Cuisine sénégalaise authentique.',
      phone: '+221772145678', email: 'contact@baobab.sn', whatsapp: '+221772145678',
      publicAddress: 'Rue du 18e, Thiès, Sénégal', status: ShopStatus.ACTIVE,
      verificationStatus: 'verified',
      seoTitle: 'Restaurant Le Baobab - Cuisine', seoDescription: 'Délices sénégalais à Thiès.',
      organizationId: organization.id, ownerId: superAdmin.id,
    },
    {
      slug: 'artisan-bazin-mboro', name: 'Artisan Bazin Mboro', type: ShopType.ARTISAN,
      shortDescription: 'Bazin riche et broderies', description: 'Tissus traditionnels et couture.',
      phone: '+221773156789', email: 'contact@bazin-mboro.sn', whatsapp: '+221773156789',
      publicAddress: 'Marché de Mboro, Allée des Artisans', status: ShopStatus.ACTIVE,
      verificationStatus: 'verified',
      seoTitle: 'Artisan Bazin Mboro - Tissus', seoDescription: 'Bazin et pagnes sur mesure.',
      organizationId: organization.id, ownerId: superAdmin.id,
    },
    {
      slug: 'epices-du-terroir', name: 'Épices du Terroir', type: ShopType.RETAIL,
      shortDescription: 'Saveurs authentiques', description: 'Épices et condiments locaux.',
      phone: '+221774167890', email: 'contact@epices-terroir.sn', whatsapp: '+221774167890',
      publicAddress: 'Marché Central, Thiès, Sénégal', status: ShopStatus.ACTIVE,
      verificationStatus: 'verified',
      seoTitle: 'Épices du Terroir - Condiments', seoDescription: 'Épices sénégalaises.',
      organizationId: organization.id, ownerId: superAdmin.id,
    },
    {
      slug: 'boulangerie-du-coin', name: 'Boulangerie du Coin', type: ShopType.RETAIL,
      shortDescription: 'Boulangerie artisanale', description: 'Pains frais, pâtisseries maison.',
      phone: '+221775178912', email: 'contact@boulangerie.sn', whatsapp: '+221775178912',
      publicAddress: 'Rue de la République, Mboro', status: ShopStatus.DRAFT,
      verificationStatus: 'pending',
      seoTitle: 'Boulangerie du Coin - Pains', seoDescription: 'Boulangerie artisanale à Mboro.',
      organizationId: organization.id, ownerId: superAdmin.id,
    },
    {
      slug: 'coiffure-beaute-sen', name: 'Coiffure Beauté Sén', type: ShopType.SERVICE,
      shortDescription: 'Coiffure et beauté', description: 'Coiffure, soins et manucure.',
      phone: '+221776189023', email: 'contact@beaute-sen.sn', whatsapp: '+221776189023',
      publicAddress: 'Avenue Cheikh Anta Diop, Thiès', status: ShopStatus.ACTIVE,
      verificationStatus: 'verified',
      seoTitle: 'Coiffure Beauté Sén - Salon', seoDescription: 'Salon de coiffure à Thiès.',
      organizationId: organization.id, ownerId: superAdmin.id,
    },
    {
      slug: 'materiaux-de-construction', name: 'Matériaux de Construction', type: ShopType.RETAIL,
      shortDescription: 'Matériaux et fournitures', description: 'Ciment, sable, gravier, tuiles.',
      phone: '+221777190134', email: 'contact@matcon-senegal.sn', whatsapp: '+221777190134',
      publicAddress: 'Zone Industrielle, Thiès', status: ShopStatus.ACTIVE,
      verificationStatus: 'verified',
      seoTitle: 'Matériaux de Construction', seoDescription: 'Matériaux et fournitures pour chantiers.',
      organizationId: organization.id, ownerId: superAdmin.id,
    },
    {
      slug: 'telephonie-mboro', name: 'Téléphonie Mboro', type: ShopType.SERVICE,
      shortDescription: 'Téléphonie et réparation', description: 'Vente téléphones et réparation.',
      phone: '+221778201245', email: 'contact@tel-mboro.sn', whatsapp: '+221778201245',
      publicAddress: 'Marché de Mboro, Rue Principale', status: ShopStatus.DRAFT,
      verificationStatus: 'pending',
      seoTitle: 'Téléphonie Mboro - Vente', seoDescription: 'Téléphonie et accessoires.',
      organizationId: organization.id, ownerId: superAdmin.id,
    },
  ];

  // Shop-specific images for storefronts
  const SHOP_IMAGES: Record<string, string> = {
    'mboro-marche': 'https://images.unsplash.com/photo-1570135460237-510ca82c6781?w=800&q=80',
    'restaurant-baobab': 'https://images.unsplash.com/photo-1689155494424-d2337856fe3e?w=800&q=80',
    'artisan-bazin-mboro': 'https://images.unsplash.com/photo-1597960194599-22929afc25b1?w=800&q=80',
    'epices-du-terroir': 'https://images.unsplash.com/photo-1758745464235-ccb8c1253074?w=800&q=80',
    'boulangerie-du-coin': 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=800&q=80',
    'coiffure-beaute-sen': 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&q=80',
    'materiaux-de-construction': 'https://images.unsplash.com/photo-1575493438282-4e0fb32d1bdd?w=800&q=80',
    'telephonie-mboro': 'https://images.unsplash.com/photo-1697545806245-9795b6056141?w=800&q=80',
  };

  const shops: any[] = [];
  for (const shopData of shopsData) {
    const created = await upsertShop({ ...shopData });
    // Créer/mettre à jour le media de vitrine pour la boutique
    const shopImage = SHOP_IMAGES[shopData.slug];
    if (shopImage) {
      await upsertShopMedia(created.id, shopImage, created.name + ' - Vue extérieure');
    }
    shops.push(created);
    console.log('Shop:', created.name, '(' + created.type + ')');
  }

  // 4. Categories & Products (CDC §7 - multi-tenant, shopId isolation)
  const CATEGORIES = [
    { name: 'Épicerie', slug: 'epicerie', icon: '🏠' },
    { name: 'Légumes', slug: 'legumes', icon: '🥦' },
    { name: 'Fruits', slug: 'fruits', icon: '🍎' },
    { name: 'Viandes', slug: 'viandes', icon: '🥩' },
    { name: 'Bouillons', slug: 'bouillons', icon: '🍜' },
    { name: 'Boissons', slug: 'boissons', icon: '🥤' },
    { name: 'Habillement', slug: 'habillement', icon: '👕' },
    { name: 'Chaussures', slug: 'chaussures', icon: '👟' },
    { name: 'Électronique', slug: 'electronique', icon: '📱' },
    { name: 'Téléphonie', slug: 'telephonie', icon: '📞' },
    { name: 'Réparation', slug: 'reparation', icon: '🔧' },
    { name: 'Matériaux', slug: 'materiaux', icon: '🏗️' },
    { name: 'Tissus', slug: 'tissus', icon: '🧵' },
    { name: 'Cuisine', slug: 'cuisine', icon: '🍳' },
    { name: 'Pâtisserie', slug: 'patisserie', icon: '🍰' },
    { name: 'Cosmétiques', slug: 'cosmetiques', icon: '💄' },
  ];

  // Image URLs spécifiques par titre de produit (correspondance intelligente titre ↔ image)
  // Image URLs spécifiques par titre de produit (correspondance intelligente titre ↔ image)
  const PRODUCT_IMAGES: Record<string, string> = {
    // Épicerie
    'riz parfumé': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    'riz basmati': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    'pâtes spaghetti': 'https://images.unsplash.com/photo-1627042633145-b780d842ba45?w=600&q=80',
    'huile arachide': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',
    'sel cuisine': 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&q=80',
    'sucre brut': 'https://images.unsplash.com/photo-1709651808265-977ed7ef78c6?w=600&q=80',
    'lait en poudre': 'https://images.unsplash.com/photo-1693996046865-19217d179161?w=600&q=80',
    'café touba': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
    // Légumes
    'tomates fraîches': 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&q=80',
    'oignons rouges': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80',
    'piments': 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80',
    'concombres': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80',
    'carottes': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80',
    'piments verts': 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80',
    // Fruits
    'mangues': 'https://images.unsplash.com/photo-1732472581875-89ff83f18439?w=600&q=80',
    'bananes plantains': 'https://images.unsplash.com/photo-1617631716600-6a454b430367?w=600&q=80',
    'papayes vertes': 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=600&q=80',
    'avocats': 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=600&q=80',
    // Viandes
    'poulet frais': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&q=80',
    'bœuf': 'https://images.unsplash.com/photo-1723893905879-0e309c2a8e06?w=600&q=80',
    'côtes de porc': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
    // Boissons
    'bissap': 'https://images.unsplash.com/photo-1654922704274-cd34f165c5e7?w=600&q=80',
    'jus de bissap': 'https://images.unsplash.com/photo-1654922704274-cd34f165c5e7?w=600&q=80',
    'eau minérale': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
    'jus de maracouyà': 'https://images.unsplash.com/photo-1604495772376-9657f0035eb5?w=600&q=80',
    'thé à la menthe': 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600&q=80',
    // Bouillons
    'bouillon cube': 'https://images.unsplash.com/photo-1758745464235-ccb8c1253074?w=600&q=80',
    'bouillon de poissons': 'https://images.unsplash.com/photo-1730112696140-19e61bb43d36?w=600&q=80',
    // Téléphonie
    'iphone 15': 'https://images.unsplash.com/photo-1634403665481-74948d815f03?w=600&q=80',
    'xiaomi redmi note': 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&q=80',
    'samsung galaxy a': 'https://images.unsplash.com/photo-1662947995689-ec5165848ad0?w=600&q=80',
    'téléphone portable': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    'chargeur usb': 'https://images.unsplash.com/photo-1557767382-97b28f5488e7?w=600&q=80',
    'écouteurs bluetooth': 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80',
    // Réparation
    'réparation écran': 'https://images.unsplash.com/photo-1550041473-d296a3a8a18a?w=600&q=80',
    'remplacement batterie': 'https://images.unsplash.com/photo-1550041473-d296a3a8a18a?w=600&q=80',
    'nettoyage smartphone': 'https://images.unsplash.com/photo-1550041473-d296a3a8a18a?w=600&q=80',
    // Matériaux
    'ciment portland': 'https://images.unsplash.com/photo-1575493438282-4e0fb32d1bdd?w=600&q=80',
    'sable fin': 'https://images.unsplash.com/photo-1685555809025-0fe60ab6df46?w=600&q=80',
    'brique': 'https://images.unsplash.com/photo-1585750629386-33bdc1431574?w=600&q=80',
    // Tissus
    'bazin riche': 'https://images.unsplash.com/photo-1768212565426-58b089b6386d?w=600&q=80',
    'pagne wax': 'https://images.unsplash.com/photo-1768212565426-58b089b6386d?w=600&q=80',
    'japoncoton': 'https://images.unsplash.com/photo-1552710307-537199cd41c0?w=600&q=80',
    // Cuisine
    'thieboudienne': 'https://images.unsplash.com/photo-1665400808116-f0e6339b7e9a?w=600&q=80',
    'yassa poulet': 'https://images.unsplash.com/photo-1689155494424-d2337856fe3e?w=600&q=80',
    'maafe': 'https://images.unsplash.com/photo-1730112696140-19e61bb43d36?w=600&q=80',
    // Pâtisserie
    'pain de campagne': 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=600&q=80',
    'croissant': 'https://images.unsplash.com/photo-1623334044303-241021148842?w=600&q=80',
    'biscuits sale': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
    // Habillement / chaussures
    'boubou traditionnel': 'https://images.unsplash.com/photo-1648329008114-bce0ec0b5950?w=600&q=80',
    'tunique bazin': 'https://images.unsplash.com/photo-1648329008114-bce0ec0b5950?w=600&q=80',
    'pagnes wax': 'https://images.unsplash.com/photo-1768212565426-58b089b6386d?w=600&q=80',
    'sandales enfant': 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80',
    'baskets femme': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    // Cosmétiques
    'kohl électronique': 'https://images.unsplash.com/photo-1668255446079-b15fd061735d?w=600&q=80',
    'huile de coco': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',
    'baume à lèvres': 'https://images.unsplash.com/photo-1666594171486-858f82f5b191?w=600&q=80',
  };

  // Image URLs de fallback par catégorie de produit
  const CATEGORY_IMAGES: Record<string, string[]> = {
    epicerie: [
      'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&q=80',
      'https://images.unsplash.com/photo-1709651808265-977ed7ef78c6?w=600&q=80',
      'https://images.unsplash.com/photo-1627042633145-b780d842ba45?w=600&q=80',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
    ],
    legumes: [
      'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&q=80',
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80',
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80',
      'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80',
      'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80',
    ],
    fruits: [
      'https://images.unsplash.com/photo-1732472581875-89ff83f18439?w=600&q=80',
      'https://images.unsplash.com/photo-1617631716600-6a454b430367?w=600&q=80',
      'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=600&q=80',
      'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=600&q=80',
    ],
    viandes: [
      'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&q=80',
      'https://images.unsplash.com/photo-1723893905879-0e309c2a8e06?w=600&q=80',
      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
    ],
    bouillons: [
      'https://images.unsplash.com/photo-1758745464235-ccb8c1253074?w=600&q=80',
      'https://images.unsplash.com/photo-1730112696140-19e61bb43d36?w=600&q=80',
    ],
    boissons: [
      'https://images.unsplash.com/photo-1654922704274-cd34f165c5e7?w=600&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
      'https://images.unsplash.com/photo-1604495772376-9657f0035eb5?w=600&q=80',
      'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600&q=80',
    ],
    habillement: [
      'https://images.unsplash.com/photo-1648329008114-bce0ec0b5950?w=600&q=80',
      'https://images.unsplash.com/photo-1768212565426-58b089b6386d?w=600&q=80',
    ],
    chaussures: [
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    ],
    electronique: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
      'https://images.unsplash.com/photo-1557767382-97b28f5488e7?w=600&q=80',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80',
    ],
    telephonie: [
      'https://images.unsplash.com/photo-1662947995689-ec5165848ad0?w=600&q=80',
      'https://images.unsplash.com/photo-1634403665481-74948d815f03?w=600&q=80',
      'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&q=80',
    ],
    reparation: [
      'https://images.unsplash.com/photo-1550041473-d296a3a8a18a?w=600&q=80',
    ],
    materiaux: [
      'https://images.unsplash.com/photo-1575493438282-4e0fb32d1bdd?w=600&q=80',
      'https://images.unsplash.com/photo-1685555809025-0fe60ab6df46?w=600&q=80',
      'https://images.unsplash.com/photo-1585750629386-33bdc1431574?w=600&q=80',
    ],
    tissus: [
      'https://images.unsplash.com/photo-1768212565426-58b089b6386d?w=600&q=80',
      'https://images.unsplash.com/photo-1552710307-537199cd41c0?w=600&q=80',
    ],
    cuisine: [
      'https://images.unsplash.com/photo-1665400808116-f0e6339b7e9a?w=600&q=80',
      'https://images.unsplash.com/photo-1689155494424-d2337856fe3e?w=600&q=80',
      'https://images.unsplash.com/photo-1730112696140-19e61bb43d36?w=600&q=80',
    ],
    patisserie: [
      'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=600&q=80',
      'https://images.unsplash.com/photo-1623334044303-241021148842?w=600&q=80',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
    ],
    cosmetiques: [
      'https://images.unsplash.com/photo-1668255446079-b15fd061735d?w=600&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
      'https://images.unsplash.com/photo-1666594171486-858f82f5b191?w=600&q=80',
    ],
  };

  const FALLBACK_SEED_IMAGE = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80';

  // 5. Products (data-driven - organized by category with specific images and descriptions)
  const PRODUCTS: Record<string, any[]> = {
    epicerie: [
      { title: 'Riz Basmati', slug: 'riz-basmati', price: 1200, sku: 'EP001', stock: 50, unit: 'kg', description: 'Riz basmati long grain, idéal pour des riz parfumés.', shortDescription: 'Riz basmati premium' },
      { title: 'Pâtes Spaghetti', slug: 'pates-spaghetti', price: 450, sku: 'EP002', stock: 100, unit: 'paquet', description: 'Spaghetti italiens de qualité, cuisson al dente.', shortDescription: 'Spaghetti classiques' },
      { title: 'Huile Arachide', slug: 'huile-arachide', price: 1800, sku: 'EP003', stock: 30, unit: 'L', description: 'Huile de colza vierge, parfaite pour la cuisson.', shortDescription: 'Huile végétale' },
      { title: 'Sel Cuisine', slug: 'sel-cuisine', price: 300, sku: 'EP004', stock: 200, unit: 'paquet', description: 'Sel de cuisine raffiné, micro-cristallisé.', shortDescription: 'Sel de cuisine' },
      { title: 'Sucre Brut', slug: 'sucre-brut', price: 650, sku: 'EP005', stock: 80, unit: 'kg', description: 'Sucre de canne brut, pour un goût authentique.', shortDescription: 'Sucre brut' },
      { title: 'Lait En Poudre', slug: 'lait-en-poudre', price: 950, sku: 'EP006', stock: 40, unit: 'paquet', description: 'Lait en poudre pasteurisé, riche en calcium.', shortDescription: 'Lait en poudre' },
      { title: 'Café Touba', slug: 'cafe-touba', price: 1500, sku: 'EP007', stock: 60, unit: 'paquet', description: 'Café Touba traditionnel, arôme épicé typique.', shortDescription: 'Café Touba' },
    ],
    legumes: [
      { title: 'Tomates Fraîches', slug: 'tomates-fraiches', price: 800, sku: 'LG001', stock: 60, unit: 'kg', description: 'Tomates rouges mûres, cultivées localement.', shortDescription: 'Tomates fraîches' },
      { title: 'Oignons Rouges', slug: 'oignons-rouges', price: 600, sku: 'LG002', stock: 100, unit: 'kg', description: 'Oignons rouges croquants, parfaits pour salades.', shortDescription: 'Oignons rouges' },
      { title: 'Piments', slug: 'piments', price: 1200, sku: 'LG003', stock: 40, unit: 'kg', description: 'Piments forts, pour des plats épicés traditionnels.', shortDescription: 'Piments frais' },
      { title: 'Concombres', slug: 'concombres', price: 500, sku: 'LG004', stock: 45, unit: 'pièce', description: 'Concombres croquants, idéaux pour salades.', shortDescription: 'Concombres frais' },
      { title: 'Carottes', slug: 'carottes', price: 400, sku: 'LG005', stock: 70, unit: 'kg', description: 'Carottes sucrées, riches en bêta-carotène.', shortDescription: 'Carottes fraîches' },
      { title: 'Piments Verts', slug: 'piments-verts', price: 800, sku: 'LG006', stock: 35, unit: 'kg', description: 'Piments verts frais du jour.', shortDescription: 'Piments verts' },
    ],
    fruits: [
      { title: 'Mangues', slug: 'mangues', price: 2500, sku: 'FR001', stock: 30, unit: 'kg', description: 'Mangues mûres, variété locale délicieuse.', shortDescription: 'Mangues fraîches' },
      { title: 'Bananes Plantains', slug: 'bananes-plantains', price: 1800, sku: 'FR002', stock: 60, unit: 'kg', description: 'Bananes plantains mûres, parfaites pour cuisine.', shortDescription: 'Bananes plantains' },
      { title: 'Papayes Vertes', slug: 'papayes-vertes', price: 1500, sku: 'FR003', stock: 25, unit: 'pièce', description: 'Papayes vertes pour soupes traditionnelles.', shortDescription: 'Papayes vertes' },
      { title: 'Avocats', slug: 'avocats', price: 2000, sku: 'FR004', stock: 40, unit: 'kg', description: 'Avocats mûrs, pour des salades crémeuses.', shortDescription: 'Avocats frais' },
    ],
    viandes: [
      { title: 'Poulet Frais', slug: 'poulet-frais', price: 5500, sku: 'VM001', stock: 20, unit: 'kg', description: 'Poulet frais élevé en plein air.', shortDescription: 'Poulet frais' },
      { title: 'Bœuf', slug: 'boeuf', price: 8500, sku: 'VM002', stock: 15, unit: 'kg', description: 'Bœuf de qualité, idéal pour grillades.', shortDescription: 'Bœuf frais' },
      { title: 'Côtes de Porc', slug: 'cotes-de-porc', price: 6500, sku: 'VM003', stock: 18, unit: 'kg', description: 'Côtes de porc pour grillades savoureuses.', shortDescription: 'Côtes de porc' },
    ],
    bouillons: [
      { title: 'Bouillon Cube', slug: 'bouillon-cube', price: 350, sku: 'BL001', stock: 500, unit: 'paquet', description: 'Bouillons cubes concentrés pour soupes.', shortDescription: 'Bouillon cube' },
      { title: 'Bouillon de Poissons', slug: 'bouillon-poissons', price: 2200, sku: 'BL002', stock: 60, unit: 'paquet', description: 'Bouillon de poisson en poudre, pour sauces.', shortDescription: 'Bouillon poisson' },
    ],
    boissons: [
      { title: 'Eau Minérale', slug: 'eau-minerale', price: 300, sku: 'BV001', stock: 200, unit: 'bouteille', description: 'Eau minérale naturelle, 1L.', shortDescription: 'Eau minérale 1L' },
      { title: 'Jus de Maracouyà', slug: 'jus-maracouyà', price: 1500, sku: 'BV002', stock: 80, unit: 'bouteille', description: 'Jus de maracouyà frais, sans additifs.', shortDescription: 'Jus de maracouyà' },
      { title: 'Bissap', slug: 'bissap', price: 800, sku: 'BV003', stock: 100, unit: 'bouteille', description: 'Bissap traditionnel sénégalais, rafraîchissant.', shortDescription: 'Bissap 50cl' },
      { title: 'Thé à la Menthe', slug: 'the-menthe', price: 600, sku: 'BV004', stock: 120, unit: 'paquet', description: 'Thé à la menthe séché, pour infusion.', shortDescription: 'Thé menthe' },
    ],
    habillement: [
      { title: 'Boubou Traditionnel', slug: 'boubou-traditionnel', price: 25000, sku: 'HB001', stock: 12, unit: 'pièce', description: 'Boubou traditionnel en wax, broderie fine.', shortDescription: 'Boubou wax' },
      { title: 'Tunique Bazin', slug: 'tunique-bazin', price: 45000, sku: 'HB002', stock: 8, unit: 'pièce', description: 'Tunique bazin riche, main main.', shortDescription: 'Tunique bazin' },
      { title: 'Pagnes Wax', slug: 'pagnes-wax', price: 8500, sku: 'HB003', stock: 20, unit: 'mètre', description: 'Pagnes wax coloré, motif africain.', shortDescription: 'Pagne wax' },
    ],
    chaussures: [
      { title: 'Sandales Enfant', slug: 'sandales-enfant', price: 3500, sku: 'CH001', stock: 30, unit: 'paire', description: 'Sandales confortables pour enfants.', shortDescription: 'Sandales enfant' },
      { title: 'Baskets Femme', slug: 'baskets-femme', price: 18500, sku: 'CH002', stock: 15, unit: 'paire', description: 'Baskets femme tendance, semelle amortie.', shortDescription: 'Baskets femme' },
    ],
    electronique: [
      { title: 'Téléphone Portable', slug: 'telephone-portable', price: 250000, sku: 'EL001', stock: 10, unit: 'pièce', description: 'Téléphone portable intelligent 64Go.', shortDescription: 'Téléphone portable' },
      { title: 'Chargeur USB', slug: 'chargeur-usb', price: 2500, sku: 'EL002', stock: 50, unit: 'pièce', description: 'Chargeur USB rapide, 20W.', shortDescription: 'Chargeur USB' },
      { title: 'Écouteurs Bluetooth', slug: 'ecouteurs-bluetooth', price: 45000, sku: 'EL003', stock: 20, unit: 'pièce', description: 'Écouteurs sans fil, autonomie 24h.', shortDescription: 'Écouteurs BT' },
    ],
    telephonie: [
      { title: 'Samsung Galaxy A', slug: 'samsung-galaxy-a', price: 185000, sku: 'TL001', stock: 8, unit: 'pièce', description: 'Samsung Galaxy A, 128Go, 6Go RAM.', shortDescription: 'Samsung Galaxy A' },
      { title: 'Apple iPhone 15', slug: 'iphone-15', price: 850000, sku: 'TL002', stock: 4, unit: 'pièce', description: 'iPhone 15, 128Go, couleur bleu.', shortDescription: 'iPhone 15' },
      { title: 'Xiaomi Redmi Note', slug: 'xiaomi-redmi-note', price: 125000, sku: 'TL003', stock: 12, unit: 'pièce', description: 'Xiaomi Redmi Note 12, 128Go.', shortDescription: 'Xiaomi Redmi Note' },
    ],
    reparation: [
      { title: 'Réparation Écran', slug: 'reparation-ecran', price: 35000, sku: 'RP001', stock: 0, unit: 'service', description: 'Remplacement d\'écran tactile professionnel.', shortDescription: 'Réparation écran' },
      { title: 'Remplacement Batterie', slug: 'remplacement-batterie', price: 15000, sku: 'RP002', stock: 0, unit: 'service', description: 'Changement batterie smartphone.', shortDescription: 'Batterie' },
      { title: 'Nettoyage Smartphone', slug: 'nettoyage-smartphone', price: 8000, sku: 'RP003', stock: 0, unit: 'service', description: 'Nettoyage complet du smartphone.', shortDescription: 'Nettoyage' },
    ],
    materiaux: [
      { title: 'Ciment Portland', slug: 'ciment-portland', price: 4500, sku: 'MT001', stock: 200, unit: 'sac', description: 'Ciment Portland 32,5R, 50kg.', shortDescription: 'Ciment 50kg' },
      { title: 'Sable Fin', slug: 'sable-fin', price: 8000, sku: 'MT002', stock: 500, unit: 'm³', description: 'Sable fin non abrasif.', shortDescription: 'Sable fin' },
      { title: 'Brique', slug: 'brique', price: 350, sku: 'MT003', stock: 1000, unit: 'pièce', description: 'Brique rouge standard.', shortDescription: 'Brique' },
    ],
    tissus: [
      { title: 'Bazin Riche', slug: 'bazin-riche', price: 12500, sku: 'TS001', stock: 60, unit: 'mètre', description: 'Bazin riche brodé, motif traditionnel.', shortDescription: 'Bazin riche' },
      { title: 'Pagne Wax', slug: 'pagne-wax', price: 8500, sku: 'TS002', stock: 45, unit: 'mètre', description: 'Pagne wax imprimé, couleur vive.', shortDescription: 'Pagne wax' },
      { title: 'Japoncoton', slug: 'japoncoton', price: 6500, sku: 'TS003', stock: 80, unit: 'mètre', description: 'Japon coton imprimé, léger.', shortDescription: 'Japon coton' },
    ],
    cuisine: [
      { title: 'Thieboudienne', slug: 'thieboudienne', price: 5500, sku: 'CU001', stock: 0, unit: 'plat', description: 'Thieboudienne traditionnel, avec poisson.', shortDescription: 'Thieboudienne' },
      { title: 'Yassa Poulet', slug: 'yassa-poulet', price: 4800, sku: 'CU002', stock: 0, unit: 'plat', description: 'Yassa poulet caramélisé, légumes.', shortDescription: 'Yassa poulet' },
      { title: 'Maafe', slug: 'maafe', price: 4200, sku: 'CU003', stock: 0, unit: 'plat', description: 'Maafe au bœuf, sauce arachide.', shortDescription: 'Maafe bœuf' },
    ],
    patisserie: [
      { title: 'Pain de Campagne', slug: 'pain-campagne', price: 650, sku: 'PT001', stock: 40, unit: 'pièce', description: 'Pain de campagne croustillant.', shortDescription: 'Pain campagne' },
      { title: 'Croissant', slug: 'croissant', price: 450, sku: 'PT002', stock: 35, unit: 'pièce', description: 'Croissant feuilleté, beurre.', shortDescription: 'Croissant' },
      { title: 'Biscuits Sale', slug: 'biscuits-sale', price: 850, sku: 'PT003', stock: 60, unit: 'paquet', description: 'Biscuits salés au fromage.', shortDescription: 'Biscuits salés' },
    ],
    cosmetiques: [
      { title: 'Kohl Électronique', slug: 'kohl-electronique', price: 2500, sku: 'CS001', stock: 50, unit: 'tube', description: 'Kohl électronique longue tenue.', shortDescription: 'Kohl' },
      { title: 'Huile de Coco', slug: 'huile-coco', price: 6500, sku: 'CS002', stock: 40, unit: 'bouteille', description: 'Huile de coco vierge, 500ml.', shortDescription: 'Huile coco' },
      { title: 'Baume à Lèvres', slug: 'baume-levres', price: 1500, sku: 'CS003', stock: 60, unit: 'pièce', description: 'Baume à lèvres hydratant, soin.', shortDescription: 'Baume lèvres' },
    ],
  };

  // Category to shop mapping — chaque boutique a son propre catalogue,
  // pas de duplication entre boutiques (correction de la répétition d'images).
  const SHOP_CATEGORIES_BY_SLUG: Record<string, string[]> = {
    'mboro-marche': ['epicerie', 'legumes', 'fruits'],
    'restaurant-baobab': ['cuisine'],
    'artisan-bazin-mboro': ['tissus', 'habillement'],
    'epices-du-terroir': ['bouillons', 'boissons', 'epicerie'],
    'boulangerie-du-coin': ['patisserie', 'epicerie'],
    'coiffure-beaute-sen': ['cosmetiques'],
    'materiaux-de-construction': ['materiaux'],
    'telephonie-mboro': ['telephonie', 'reparation', 'electronique', 'chaussures'],
  };
  const SHOP_CATEGORIES: Record<string, string[]> = {
    RETAIL: ['epicerie', 'legumes', 'fruits', 'viandes'],
    RESTAURANT: ['cuisine'],
    ARTISAN: ['tissus', 'habillement'],
    SERVICE: ['telephonie', 'reparation', 'electronique', 'cosmetiques'],
  };

  let productCount = 0;
  for (const shop of shops) {
    // Catalogue par slug — sinon par type (pas de duplication entre boutiques)
    const shopCategorySlugs = SHOP_CATEGORIES_BY_SLUG[shop.slug] || SHOP_CATEGORIES[shop.type] || ['epicerie'];
    const existingCats = await prisma.category.findMany({ where: { shopId: shop.id } });
    const existingSlugs = new Set(existingCats.map(c => c.slug));

    for (const catData of CATEGORIES) {
      if (shopCategorySlugs.includes(catData.slug)) {
        let cat = existingCats.find(c => c.slug === catData.slug);
        if (!cat) {
          cat = await prisma.category.create({
            data: {
              shopId: shop.id,
              name: catData.name,
              slug: catData.slug,
              icon: catData.icon,
              description: `${catData.name} pour ${shop.name}`,
              isPublic: true,
              isActive: true,
              sortOrder: existingCats.length,
            },
          });
        }
        const products = PRODUCTS[catData.slug] || [];
        for (const p of products) {
          // 1. Correspondance par TITRE (l'image doit correspondre au produit)
          const titleLower = p.title.toLowerCase();
          let img = PRODUCT_IMAGES[titleLower] || null; // 1a. correspondance exacte
          if (!img) {
            for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
              if (titleLower.includes(key) || key.includes(titleLower)) { img = url; break; }
            }
          }
          // 2. Sinon image représentative de la catégorie (variée)
          if (!img) {
            const catImages = CATEGORY_IMAGES[catData.slug];
            if (catImages && catImages.length) {
              img = catImages[productCount % catImages.length];
            }
          }
          if (!img) img = FALLBACK_SEED_IMAGE;
          await upsertProduct({
            shopId: shop.id,
            categoryId: cat.id,
            title: p.title,
            slug: p.slug + '-' + shop.slug,
            shortDescription: p.shortDescription || p.title,
            description: p.description || (p.title + ' - Produit de qualité de ' + shop.name),
            price: p.price,
            sku: p.sku + '-' + shop.slug.slice(0, 3),
            stock: p.stock,
            trackInventory: true,
            status: 'active',
            availability: 'in_stock',
            seoTitle: p.title + ' - ' + shop.name,
            seoDescription: p.shortDescription || (p.title + ' proposé par ' + shop.name),
            customFields: { image: img, unit: p.unit },
            media: {
              create: {
                path: img,
                type: 'image',
                altText: p.title,
                moderationStatus: 'approved',
              },
            },
          });
          productCount++;
        }
      }
    }
    console.log('Products seeded for shop:', shop.name, `(${shopCategorySlugs.join(', ')})`);
  }
  console.log('Total products created:', productCount);

  // 6. Orders (CDC §4 - demo orders for 3 shops)
  const DEMO_ORDERS = [
    { shopSlug: 'mboro-marche', itemCount: 3, total: 12500, status: 'COMPLETED' },
    { shopSlug: 'restaurant-baobab', itemCount: 2, total: 24500, status: 'DELIVERED' },
    { shopSlug: 'mboro-marche', itemCount: 5, total: 6800, status: 'PENDING' },
    { shopSlug: 'epices-du-terroir', itemCount: 4, total: 18600, status: 'COMPLETED' },
  ];

  let orderCount = 0;
  for (const orderData of DEMO_ORDERS) {
    const shop = shops.find((s) => s.slug === orderData.shopSlug);
    if (!shop) continue;

    const products = await prisma.product.findMany({ where: { shopId: shop.id }, take: orderData.itemCount });
    if (products.length === 0) continue;

    const order = await prisma.order.create({
      data: {
        orderNumber: 'ORD-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 1000),
        shopId: shop.id,
        userId: superAdmin.id,
        status: orderData.status as any,
        total: orderData.total,
        currency: 'XOF',
        paymentStatus: orderData.status === 'COMPLETED' || orderData.status === 'DELIVERED' ? 'SUCCEEDED' : 'PENDING',
        paymentMethod: 'ONLINE',
        deliveryAddress: JSON.stringify({ address: shop.publicAddress || 'Thiès, Sénégal' }),
        customerNote: 'Commande de démonstration',
        items: {
          create: products.map((p, i) => ({
            productId: p.id,
            name: p.title,
            quantity: 1 + (i % 3),
            unitPrice: Number(p.price),
            totalPrice: Number(p.price) * (1 + (i % 3)),
          })),
        },
      } as any,
    });
    orderCount++;
    console.log('Order created:', order.id.substring(0, 8), '=>', shop.name);
  }
  console.log('Total orders created:', orderCount);

  // 7. Reviews (demo)
  let reviewCount = 0;
  for (const shop of shops.slice(0, 5)) {
    const product = await prisma.product.findFirst({ where: { shopId: shop.id } });
    if (product) {
      await prisma.review.create({
        data: {
          shopId: shop.id,
          authorId: superAdmin.id,
          rating: 5,
          content: 'Excellent produit! Livraison rapide.',
        },
      });
      reviewCount++;
    }
  }
  console.log('Total reviews created:', reviewCount);

  // 8. Feature flags (CDC §13)
  const existingAiFlag = await prisma.featureFlag.findFirst({ where: { key: 'ai-assistant-enabled' } });
  if (!existingAiFlag) {
    await prisma.featureFlag.create({ data: { key: 'ai-assistant-enabled', scope: 'GLOBAL', isActive: true } });
  }
  const existingTenantFlag = await prisma.featureFlag.findFirst({ where: { key: 'multi-tenant-isolation' } });
  if (!existingTenantFlag) {
    await prisma.featureFlag.create({ data: { key: 'multi-tenant-isolation', scope: 'GLOBAL', isActive: true } });
  }
  console.log('Feature flags seeded');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });