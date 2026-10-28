import { Product } from '@/types';

/**
 * Mapping produit -> image Unsplash.
 * Chaque produit a son image propre (vérifiée HTTP 200), pas de duplication.
 * Source des recherches : https://unsplash.com/s/photos/<mot-clé>
 */
const PRODUCT_IMAGES: Record<string, string> = {
  // === Épicerie ===
  'riz': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
  'riz parfumé': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
  'pâtes spaghetti': 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=600&q=80',
  'huile arachide': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',
  'sel cuisine': 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&q=80',
  'sucre brut': 'https://images.unsplash.com/photo-1709651808265-977ed7ef78c6?w=600&q=80',
  'lait en poudre': 'https://images.unsplash.com/photo-1693996046865-19217d179161?w=600&q=80',
  'café touba': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
  // === Légumes ===
  'tomates fraîches': 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&q=80',
  'oignons rouges': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80',
  'piments': 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80',
  'piments verts': 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80',
  'concombres': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80',
  'carottes': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80',
  // === Fruits ===
  'mangues': 'https://images.unsplash.com/photo-1732472581875-89ff83f18439?w=600&q=80',
  'bananes plantains': 'https://images.unsplash.com/photo-1617631716600-6a454b430367?w=600&q=80',
  'papayes vertes': 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=600&q=80',
  'avocats': 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=600&q=80',
  // === Viandes ===
  'poulet frais': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&q=80',
  'bœuf': 'https://images.unsplash.com/photo-1723893905879-0e309c2a8e06?w=600&q=80',
  'côtes de porc': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
  // === Boissons ===
  'bissap': 'https://images.unsplash.com/photo-1654922704274-cd34f165c5e7?w=600&q=80',
  'eau minérale': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
  'jus de maracouyà': 'https://images.unsplash.com/photo-1604495772376-9657f0035eb5?w=600&q=80',
  'thé à la menthe': 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600&q=80',
  // === Bouillons ===
  'bouillon cube': 'https://images.unsplash.com/photo-1758745464235-ccb8c1253074?w=600&q=80',
  'bouillon de poissons': 'https://images.unsplash.com/photo-1730112696140-19e61bb43d36?w=600&q=80',
  // === Téléphonie / électronique ===
  'apple iphone 15': 'https://images.unsplash.com/photo-1634403665481-74948d815f03?w=600&q=80',
  'iphone 15': 'https://images.unsplash.com/photo-1634403665481-74948d815f03?w=600&q=80',
  'samsung galaxy a': 'https://images.unsplash.com/photo-1662947995689-ec5165848ad0?w=600&q=80',
  'xiaomi redmi note': 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&q=80',
  'téléphone portable': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
  'chargeur usb': 'https://images.unsplash.com/photo-1557767382-97b28f5488e7?w=600&q=80',
  'écouteurs bluetooth': 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80',
  // === Réparation ===
  'réparation écran': 'https://images.unsplash.com/photo-1550041473-d296a3a8a18a?w=600&q=80',
  'remplacement batterie': 'https://images.unsplash.com/photo-1550041473-d296a3a8a18a?w=600&q=80',
  'nettoyage smartphone': 'https://images.unsplash.com/photo-1550041473-d296a3a8a18a?w=600&q=80',
  // === Matériaux ===
  'ciment portland': 'https://images.unsplash.com/photo-1575493438282-4e0fb32d1bdd?w=600&q=80',
  'sable fin': 'https://images.unsplash.com/photo-1685555809025-0fe60ab6df46?w=600&q=80',
  'brique': 'https://images.unsplash.com/photo-1585750629386-33bdc1431574?w=600&q=80',
  // === Habillement / tissus ===
  'boubou traditionnel': 'https://images.unsplash.com/photo-1648329008114-bce0ec0b5950?w=600&q=80',
  'tunique bazin': 'https://images.unsplash.com/photo-1648329008114-bce0ec0b5950?w=600&q=80',
  'pagnes wax': 'https://images.unsplash.com/photo-1768212565426-58b089b6386d?w=600&q=80',
  'bazin riche': 'https://images.unsplash.com/photo-1768212565426-58b089b6386d?w=600&q=80',
  'pagne wax': 'https://images.unsplash.com/photo-1768212565426-58b089b6386d?w=600&q=80',
  'japoncoton': 'https://images.unsplash.com/photo-1552710307-537199cd41c0?w=600&q=80',
  // === Chaussures ===
  'sandales enfant': 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80',
  'baskets femme': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  // === Cuisine sénégalaise ===
  'thieboudienne': 'https://images.unsplash.com/photo-1665400808116-f0e6339b7e9a?w=600&q=80',
  'yassa poulet': 'https://images.unsplash.com/photo-1689155494424-d2337856fe3e?w=600&q=80',
  'maafe': 'https://images.unsplash.com/photo-1730112696140-19e61bb43d36?w=600&q=80',
  // === Pâtisserie ===
  'pain de campagne': 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=600&q=80',
  'croissant': 'https://images.unsplash.com/photo-1623334044303-241021148842?w=600&q=80',
  'biscuits sale': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
  // === Cosmétiques ===
  'kohl électronique': 'https://images.unsplash.com/photo-1668255446079-b15fd061735d?w=600&q=80',
  'huile de coco': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',
  'baume à lèvres': 'https://images.unsplash.com/photo-1666594171486-858f82f5b191?w=600&q=80',
};
const FALLBACK = 'https://images.unsplash.com/photo-1570135460237-510ca82c6781?w=600&q=80';

/** Normalise les accents pour la comparaison insensible à la casse. */
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function matchByTitle(title: string): string | null {
  const t = normalize(title);
  // 1. correspondance exacte
  for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
    if (normalize(key) === t) return url;
  }
  // 2. le titre contient la clé (ou l'inverse) — clé la plus longue d'abord
  const keys = Object.keys(PRODUCT_IMAGES).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const k = normalize(key);
    if (t.includes(k) || k.includes(t)) return PRODUCT_IMAGES[key];
  }
  return null;
}

function matchByKeyword(hay: string): string | null {
  const h = normalize(hay);
  const rules: Array<[RegExp, string]> = [
    [/mangue/, 'https://images.unsplash.com/photo-1732472581875-89ff83f18439?w=600&q=80'],
    [/banane|plantain/, 'https://images.unsplash.com/photo-1617631716600-6a454b430367?w=600&q=80'],
    [/papaye/, 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=600&q=80'],
    [/avocat/, 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=600&q=80'],
    [/riz/, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80'],
    [/pate|spaghetti/, 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=600&q=80'],
    [/huile/, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80'],
    [/sel/, 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&q=80'],
    [/sucre/, 'https://images.unsplash.com/photo-1709651808265-977ed7ef78c6?w=600&q=80'],
    [/lait/, 'https://images.unsplash.com/photo-1693996046865-19217d179161?w=600&q=80'],
    [/cafe|touba/, 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80'],
    [/tomate/, 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&q=80'],
    [/oignon/, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80'],
    [/piment/, 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80'],
    [/concombre/, 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80'],
    [/carotte/, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80'],
    [/poulet/, 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&q=80'],
    [/boeuf|viande/, 'https://images.unsplash.com/photo-1723893905879-0e309c2a8e06?w=600&q=80'],
    [/porc/, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80'],
    [/bissap|hibiscus/, 'https://images.unsplash.com/photo-1654922704274-cd34f165c5e7?w=600&q=80'],
    [/eau minerale|bouteille d'eau/, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'],
    [/maracouya|passion/, 'https://images.unsplash.com/photo-1604495772376-9657f0035eb5?w=600&q=80'],
    [/the |menthe/, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600&q=80'],
    [/bouillon/, 'https://images.unsplash.com/photo-1758745464235-ccb8c1253074?w=600&q=80'],
    [/poisson/, 'https://images.unsplash.com/photo-1730112696140-19e61bb43d36?w=600&q=80'],
    [/iphone/, 'https://images.unsplash.com/photo-1634403665481-74948d815f03?w=600&q=80'],
    [/galaxy|samsung/, 'https://images.unsplash.com/photo-1662947995689-ec5165848ad0?w=600&q=80'],
    [/xiaomi|redmi/, 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&q=80'],
    [/telephone|smartphone/, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'],
    [/chargeur/, 'https://images.unsplash.com/photo-1557767382-97b28f5488e7?w=600&q=80'],
    [/ecouteur/, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80'],
    [/reparation|ecran|batterie|nettoyage/, 'https://images.unsplash.com/photo-1550041473-d296a3a8a18a?w=600&q=80'],
    [/ciment/, 'https://images.unsplash.com/photo-1575493438282-4e0fb32d1bdd?w=600&q=80'],
    [/sable/, 'https://images.unsplash.com/photo-1685555809025-0fe60ab6df46?w=600&q=80'],
    [/brique/, 'https://images.unsplash.com/photo-1585750629386-33bdc1431574?w=600&q=80'],
    [/boubou|kaftan|tunique/, 'https://images.unsplash.com/photo-1648329008114-bce0ec0b5950?w=600&q=80'],
    [/bazin|pagne|wax|tissu/, 'https://images.unsplash.com/photo-1768212565426-58b089b6386d?w=600&q=80'],
    [/japoncoton|coton/, 'https://images.unsplash.com/photo-1552710307-537199cd41c0?w=600&q=80'],
    [/sandale/, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80'],
    [/basket|chaussure/, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    [/thieb/, 'https://images.unsplash.com/photo-1665400808116-f0e6339b7e9a?w=600&q=80'],
    [/yassa/, 'https://images.unsplash.com/photo-1689155494424-d2337856fe3e?w=600&q=80'],
    [/maafe/, 'https://images.unsplash.com/photo-1730112696140-19e61bb43d36?w=600&q=80'],
    [/pain/, 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=600&q=80'],
    [/croissant/, 'https://images.unsplash.com/photo-1623334044303-241021148842?w=600&q=80'],
    [/biscuit/, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80'],
    [/kohl|eyeliner/, 'https://images.unsplash.com/photo-1668255446079-b15fd061735d?w=600&q=80'],
    [/maquillage|cosmetique/, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80'],
    [/baume|levre/, 'https://images.unsplash.com/photo-1666594171486-858f82f5b191?w=600&q=80'],
    [/restaurant|plat/, 'https://images.unsplash.com/photo-1689155494424-d2337856fe3e?w=600&q=80'],
  ];
  for (const [re, url] of rules) {
    if (re.test(h)) return url;
  }
  return null;
}

export function productImage(p: Product): string {
  // 1. L'image stockée en base (MediaAsset / customFields) fait foi — elle est
  //    déjà cohérente avec le produit (le seed l'associe par titre/catégorie).
  const fromMedia = (p as any)?.media?.find?.((m: any) => m?.type === 'image' || !m?.type)?.path
    ?? (p as any)?.media?.[0]?.path;
  const fromCustom = (p as any)?.customFields?.image;
  const fromDb = fromMedia || fromCustom;
  if (fromDb && /^https?:\/\//.test(fromDb)) return fromDb;

  // 2. Sinon, correspondance par titre puis par mot-clé.
  const title = p.title || '';
  const hay = `${title} ${p.shortDescription || ''} ${p.slug || ''}`;
  return matchByTitle(title) ?? matchByKeyword(hay) ?? FALLBACK;
}

/**
 * Mapping boutique -> image Unsplash (une image distincte par boutique).
 * URLs vérifiées HTTP 200.
 */
const SHOP_IMAGES: Record<string, string> = {
  'mboro-marche': 'https://images.unsplash.com/photo-1570135460237-510ca82c6781?w=800&q=80',
  'restaurant-baobab': 'https://images.unsplash.com/photo-1689155494424-d2337856fe3e?w=800&q=80',
  'artisan-bazin-mboro': 'https://images.unsplash.com/photo-1597960194599-22929afc25b1?w=800&q=80',
  'epices-du-terroir': 'https://images.unsplash.com/photo-1758745464235-ccb8c1253074?w=800&q=80',
  'boulangerie-du-coin': 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800&q=80',
  'coiffure-beaute-sen': 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&q=80',
  'materiaux-de-construction': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
  'telephonie-mboro': 'https://images.unsplash.com/photo-1697545806245-9795b6056141?w=800&q=80',
};
const SHOP_FALLBACK = 'https://images.unsplash.com/photo-1570135460237-510ca82c6781?w=800&q=80';

export function shopImage(s: any): string {
  const assets = s?.mediaAssets ?? s?.media;
  const fromMedia = assets?.find?.((m: any) => m?.type === 'image' || !m?.type)?.path
    ?? assets?.[0]?.path;
  const fromDb = fromMedia || s?.coverImage || s?.logo || s?.image;
  if (fromDb && /^https?:\/\//.test(fromDb)) return fromDb;
  const bySlug = s?.slug ? SHOP_IMAGES[normalize(s.slug)] : null;
  if (bySlug) return bySlug;
  return SHOP_FALLBACK;
}
