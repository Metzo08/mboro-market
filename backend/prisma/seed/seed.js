"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function upsertCategory(data) {
    const existing = await prisma.category.findFirst({ where: { slug: data.slug, shopId: data.shopId ?? null } });
    if (existing)
        return prisma.category.update({ where: { id: existing.id }, data });
    return prisma.category.create({ data });
}
async function upsertProduct(data) {
    const existing = await prisma.product.findFirst({ where: { slug: data.slug, shopId: data.shopId } });
    if (existing)
        return prisma.product.update({ where: { id: existing.id }, data });
    return prisma.product.create({ data });
}
async function upsertUser(data) {
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing)
        return prisma.user.update({ where: { id: existing.id }, data });
    return prisma.user.create({ data });
}
async function upsertOrganization(data) {
    const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
    if (existing)
        return prisma.organization.update({ where: { id: existing.id }, data });
    return prisma.organization.create({ data });
}
async function upsertShop(data) {
    const existing = await prisma.shop.findUnique({ where: { slug: data.slug } });
    if (existing)
        return prisma.shop.update({ where: { id: existing.id }, data });
    return prisma.shop.create({ data });
}
async function main() {
    console.log('Seed starting...');
    const superAdmin = await upsertUser({
        phone: '+221700000000',
        email: 'admin@jendcithes.sn',
        role: client_1.UserRole.SUPER_ADMIN,
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
    const shopsData = [
        {
            slug: 'mboro-marche', name: 'Mboro Marché', type: client_1.ShopType.RETAIL,
            shortDescription: 'Épicerie fine', description: 'Produits frais et locaux de Mboro.',
            phone: '+221771234567', email: 'contact@mboro-marche.sn', whatsapp: '+221771234567',
            publicAddress: 'Marché de Mboro, Thiès, Sénégal', status: client_1.ShopStatus.ACTIVE,
            verificationStatus: 'verified',
            seoTitle: 'Mboro Marché - Produits locaux', seoDescription: 'Produits frais et locaux de Mboro.',
            organizationId: organization.id, ownerId: superAdmin.id,
        },
        {
            slug: 'restaurant-baobab', name: 'Restaurant Le Baobab', type: client_1.ShopType.RESTAURANT,
            shortDescription: 'Plats traditionnels', description: 'Cuisine sénégalaise authentique.',
            phone: '+221772145678', email: 'contact@baobab.sn', whatsapp: '+221772145678',
            publicAddress: 'Rue du 18e, Thiès, Sénégal', status: client_1.ShopStatus.ACTIVE,
            verificationStatus: 'verified',
            seoTitle: 'Restaurant Le Baobab - Cuisine', seoDescription: 'Délices sénégalais à Thiès.',
            organizationId: organization.id, ownerId: superAdmin.id,
        },
        {
            slug: 'artisan-bazin-mboro', name: 'Artisan Bazin Mboro', type: client_1.ShopType.ARTISAN,
            shortDescription: 'Bazin riche et broderies', description: 'Tissus traditionnels et couture.',
            phone: '+221773156789', email: 'contact@bazin-mboro.sn', whatsapp: '+221773156789',
            publicAddress: 'Marché de Mboro, Allée des Artisans', status: client_1.ShopStatus.ACTIVE,
            verificationStatus: 'verified',
            seoTitle: 'Artisan Bazin Mboro - Tissus', seoDescription: 'Bazin et pagnes sur mesure.',
            organizationId: organization.id, ownerId: superAdmin.id,
        },
        {
            slug: 'epices-du-terroir', name: 'Épices du Terroir', type: client_1.ShopType.RETAIL,
            shortDescription: 'Saveurs authentiques', description: 'Épices et condiments locaux.',
            phone: '+221774167890', email: 'contact@epices-terroir.sn', whatsapp: '+221774167890',
            publicAddress: 'Marché Central, Thiès, Sénégal', status: client_1.ShopStatus.ACTIVE,
            verificationStatus: 'verified',
            seoTitle: 'Épices du Terroir - Condiments', seoDescription: 'Épices sénégalaises.',
            organizationId: organization.id, ownerId: superAdmin.id,
        },
        {
            slug: 'boulangerie-du-coin', name: 'Boulangerie du Coin', type: client_1.ShopType.RETAIL,
            shortDescription: 'Boulangerie artisanale', description: 'Pains frais, pâtisseries maison.',
            phone: '+221775178912', email: 'contact@boulangerie.sn', whatsapp: '+221775178912',
            publicAddress: 'Rue de la République, Mboro', status: client_1.ShopStatus.DRAFT,
            verificationStatus: 'pending',
            seoTitle: 'Boulangerie du Coin - Pains', seoDescription: 'Boulangerie artisanale à Mboro.',
            organizationId: organization.id, ownerId: superAdmin.id,
        },
        {
            slug: 'coiffure-beaute-sen', name: 'Coiffure Beauté Sén', type: client_1.ShopType.SERVICE,
            shortDescription: 'Coiffure et beauté', description: 'Coiffure, soins et manucure.',
            phone: '+221776189023', email: 'contact@beaute-sen.sn', whatsapp: '+221776189023',
            publicAddress: 'Avenue Cheikh Anta Diop, Thiès', status: client_1.ShopStatus.ACTIVE,
            verificationStatus: 'verified',
            seoTitle: 'Coiffure Beauté Sén - Salon', seoDescription: 'Salon de coiffure à Thiès.',
            organizationId: organization.id, ownerId: superAdmin.id,
        },
        {
            slug: 'materiaux-de-construction', name: 'Matériaux de Construction', type: client_1.ShopType.RETAIL,
            shortDescription: 'Matériaux et fournitures', description: 'Ciment, sable, gravier, tuiles.',
            phone: '+221777190134', email: 'contact@matcon-senegal.sn', whatsapp: '+221777190134',
            publicAddress: 'Zone Industrielle, Thiès', status: client_1.ShopStatus.ACTIVE,
            verificationStatus: 'verified',
            seoTitle: 'Matériaux de Construction', seoDescription: 'Matériaux et fournitures pour chantiers.',
            organizationId: organization.id, ownerId: superAdmin.id,
        },
        {
            slug: 'telephonie-mboro', name: 'Téléphonie Mboro', type: client_1.ShopType.SERVICE,
            shortDescription: 'Téléphonie et réparation', description: 'Vente téléphones et réparation.',
            phone: '+221778201245', email: 'contact@tel-mboro.sn', whatsapp: '+221778201245',
            publicAddress: 'Marché de Mboro, Rue Principale', status: client_1.ShopStatus.DRAFT,
            verificationStatus: 'pending',
            seoTitle: 'Téléphonie Mboro - Vente', seoDescription: 'Téléphonie et accessoires.',
            organizationId: organization.id, ownerId: superAdmin.id,
        },
    ];
    const shops = [];
    for (const shopData of shopsData) {
        const created = await upsertShop({ ...shopData });
        shops.push(created);
        console.log('Shop:', created.name, '(' + created.type + ')');
    }
    // 4. Categories & Products (CDC §7 - multi-tenant, shopId isolation)
    const CATEGORIES = [
        { name: 'Épicerie', slug: 'epicerie', icon: '🏠' },
        { name: 'Légumes', slug: 'legumes', icon: '��' },
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
    // 5. Products (data-driven - one set per shop category)
    const PRODUCTS = {
        epicerie: [
            { title: 'Riz Basmati', slug: 'riz-basmati', price: 1200, sku: 'EP001', stock: 50, unit: 'kg' },
            { title: 'Pâtes Spaghetti', slug: 'pates-spaghetti', price: 450, sku: 'EP002', stock: 100, unit: 'paquet' },
            { title: 'Huile Arachide', slug: 'huile-arachide', price: 1800, sku: 'EP003', stock: 30, unit: 'L' },
            { title: 'Sel Cuisine', slug: 'sel-cuisine', price: 300, sku: 'EP004', stock: 200, unit: 'paquet' },
            { title: 'Sucre Brut', slug: 'sucre-brut', price: 650, sku: 'EP005', stock: 80, unit: 'kg' },
        ],
        legumes: [
            { title: 'Tomates Fraîches', slug: 'tomates-fraiches', price: 800, sku: 'LG001', stock: 60, unit: 'kg' },
            { title: 'Oignons Rouges', slug: 'oignons-rouges', price: 600, sku: 'LG002', stock: 100, unit: 'kg' },
            { title: 'Piments', slug: 'piments', price: 1200, sku: 'LG003', stock: 40, unit: 'kg' },
            { title: 'Concombres', slug: 'concombres', price: 500, sku: 'LG004', stock: 45, unit: 'pièce' },
            { title: 'Carottes', slug: 'carottes', price: 400, sku: 'LG005', stock: 70, unit: 'kg' },
        ],
        fruits: [
            { title: 'Mangues', slug: 'mangues', price: 2500, sku: 'FR001', stock: 30, unit: 'kg' },
            { title: 'Bananes Plantains', slug: 'bananes-plantains', price: 1800, sku: 'FR002', stock: 60, unit: 'kg' },
            { title: 'Papayes Vertes', slug: 'papayes-vertes', price: 1500, sku: 'FR003', stock: 25, unit: 'pièce' },
            { title: 'Avocats', slug: 'avocats', price: 2000, sku: 'FR004', stock: 40, unit: 'kg' },
        ],
        viandes: [
            { title: 'Poulet Frais', slug: 'poulet-frais', price: 5500, sku: 'VM001', stock: 20, unit: 'kg' },
            { title: 'Bœuf', slug: 'boeuf', price: 8500, sku: 'VM002', stock: 15, unit: 'kg' },
            { title: 'Côtes de Porc', slug: 'cotes-de-porc', price: 6500, sku: 'VM003', stock: 18, unit: 'kg' },
        ],
        bouillons: [
            { title: 'Bouillon Cube', slug: 'bouillon-cube', price: 350, sku: 'BL001', stock: 500, unit: 'paquet' },
            { title: 'Bouillon de Poissons', slug: 'bouillon-poissons', price: 2200, sku: 'BL002', stock: 60, unit: 'paquet' },
        ],
        boissons: [
            { title: 'Eau Minérale', slug: 'eau-minerale', price: 300, sku: 'BV001', stock: 200, unit: 'bouteille' },
            { title: 'Jus de Maracouyà', slug: 'jus-maracouyà', price: 1500, sku: 'BV002', stock: 80, unit: 'bouteille' },
            { title: 'Bissap', slug: 'bissap', price: 800, sku: 'BV003', stock: 100, unit: 'bouteille' },
            { title: 'Thé à la Menthe', slug: 'the-menthe', price: 600, sku: 'BV004', stock: 120, unit: 'paquet' },
        ],
        habillement: [
            { title: 'Boubou Traditionnel', slug: 'boubou-traditionnel', price: 25000, sku: 'HB001', stock: 12, unit: 'pièce' },
            { title: 'Tunique Bazin', slug: 'tunique-bazin', price: 45000, sku: 'HB002', stock: 8, unit: 'pièce' },
            { title: 'Pagnes Wax', slug: 'pagnes-wax', price: 8500, sku: 'HB003', stock: 20, unit: 'mètre' },
        ],
        chaussures: [
            { title: 'Sandales Enfant', slug: 'sandales-enfant', price: 3500, sku: 'CH001', stock: 30, unit: 'paire' },
            { title: 'Baskets Femme', slug: 'baskets-femme', price: 18500, sku: 'CH002', stock: 15, unit: 'paire' },
        ],
        electronique: [
            { title: 'Téléphone Portable', slug: 'telephone-portable', price: 250000, sku: 'EL001', stock: 10, unit: 'pièce' },
            { title: 'Chargeur USB', slug: 'chargeur-usb', price: 2500, sku: 'EL002', stock: 50, unit: 'pièce' },
            { title: 'Écouteurs Bluetooth', slug: 'ecouteurs-bluetooth', price: 45000, sku: 'EL003', stock: 20, unit: 'pièce' },
        ],
        telephonie: [
            { title: 'Samsung Galaxy A', slug: 'samsung-galaxy-a', price: 185000, sku: 'TL001', stock: 8, unit: 'pièce' },
            { title: 'Apple iPhone 15', slug: 'iphone-15', price: 850000, sku: 'TL002', stock: 4, unit: 'pièce' },
            { title: 'Xiaomi Redmi Note', slug: 'xiaomi-redmi-note', price: 125000, sku: 'TL003', stock: 12, unit: 'pièce' },
        ],
        reparation: [
            { title: 'Réparation Écran', slug: 'reparation-ecran', price: 35000, sku: 'RP001', stock: 0, unit: 'service' },
            { title: 'Remplacement Batterie', slug: 'remplacement-batterie', price: 15000, sku: 'RP002', stock: 0, unit: 'service' },
            { title: 'Nettoyage Smartphone', slug: 'nettoyage-smartphone', price: 8000, sku: 'RP003', stock: 0, unit: 'service' },
        ],
        materiaux: [
            { title: 'Ciment Portland', slug: 'ciment-portland', price: 4500, sku: 'MT001', stock: 200, unit: 'sac' },
            { title: 'Sable Fin', slug: 'sable-fin', price: 8000, sku: 'MT002', stock: 500, unit: 'm³' },
            { title: 'Brique', slug: 'brique', price: 350, sku: 'MT003', stock: 1000, unit: 'pièce' },
        ],
        tissus: [
            { title: 'Bazin Riche', slug: 'bazin-riche', price: 12500, sku: 'TS001', stock: 60, unit: 'mètre' },
            { title: 'Pagne Wax', slug: 'pagne-wax', price: 8500, sku: 'TS002', stock: 45, unit: 'mètre' },
            { title: 'Japoncoton', slug: 'japoncoton', price: 6500, sku: 'TS003', stock: 80, unit: 'mètre' },
        ],
        cuisine: [
            { title: 'Thieboudienne', slug: 'thieboudienne', price: 5500, sku: 'CU001', stock: 0, unit: 'plat' },
            { title: 'Yassa Poulet', slug: 'yassa-poulet', price: 4800, sku: 'CU002', stock: 0, unit: 'plat' },
            { title: 'Maafe', slug: 'maafe', price: 4200, sku: 'CU003', stock: 0, unit: 'plat' },
        ],
        patisserie: [
            { title: 'Pain de Campagne', slug: 'pain-campagne', price: 650, sku: 'PT001', stock: 40, unit: 'pièce' },
            { title: 'Croissant', slug: 'croissant', price: 450, sku: 'PT002', stock: 35, unit: 'pièce' },
            { title: 'Biscuits Sale', slug: 'biscuits-sale', price: 850, sku: 'PT003', stock: 60, unit: 'paquet' },
        ],
        cosmétiques: [
            { title: 'Kohl Électronique', slug: 'kohl-electronique', price: 2500, sku: 'CS001', stock: 50, unit: 'tube' },
            { title: 'Huile de Coco', slug: 'huile-coco', price: 6500, sku: 'CS002', stock: 40, unit: 'bouteille' },
            { title: 'Baume à Lèvres', slug: 'baume-levres', price: 1500, sku: 'CS003', stock: 60, unit: 'pièce' },
        ],
    };
    const IMAGE_URLS = [
        'https://images.unsplash.com/photo-1488905141291-3c3d0602a997?w=800&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q-80',
        'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q-80',
        'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q-80',
    ];
    let productCount = 0;
    for (const shop of shops) {
        const categories = await prisma.category.findMany({ where: { shopId: shop.id } });
        for (const cat of categories) {
            const products = PRODUCTS[cat.slug] || [];
            for (const p of products) {
                await upsertProduct({
                    shopId: shop.id,
                    categoryId: cat.id,
                    title: p.title,
                    slug: p.slug + '-' + shop.slug,
                    shortDescription: p.title,
                    description: p.title + ' - Produit de qualité',
                    price: p.price,
                    sku: p.sku,
                    stock: p.stock,
                    trackInventory: true,
                    status: 'active',
                    availability: 'in_stock',
                    seoTitle: p.title,
                    seoDescription: p.title + ' a ' + shop.name,
                    customFields: { image: IMAGE_URLS[Math.floor(Math.random() * IMAGE_URLS.length)] },
                });
                productCount++;
            }
        }
        console.log('Products seeded for shop:', shop.name);
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
        if (!shop)
            continue;
        const products = await prisma.product.findMany({ where: { shopId: shop.id }, take: orderData.itemCount });
        if (products.length === 0)
            continue;
        const order = await prisma.order.create({
            data: {
                shopId: shop.id,
                customerId: superAdmin.id,
                status: orderData.status,
                totalAmount: orderData.total,
                currency: 'XOF',
                paymentStatus: orderData.status === 'COMPLETED' || orderData.status === 'DELIVERED' ? 'SUCCEEDED' : 'PENDING',
                paymentMethod: 'ONLINE',
                shippingAddress: shop.publicAddress || 'Thiès, Sénégal',
                notes: 'Commande de démonstration',
                items: {
                    create: products.map((p, i) => ({
                        productId: p.id,
                        name: p.title,
                        quantity: 1 + (i % 3),
                        unitPrice: Number(p.price),
                        totalPrice: Number(p.price) * (1 + (i % 3)),
                    })),
                },
            },
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
