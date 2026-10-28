/**
 * Dictionnaire de synonymes bilingues Wolof <-> Français pour la recherche de produits.
 * Ex: "ceeb" trouve "riz", "yapp" trouve "viande", "dibi" trouve "mouton" ou "poulet".
 */

export const LOCAL_SYNONYMS: Record<string, string[]> = {
  // Riz
  ceeb: ['riz', 'basmati', 'riz parfumé', 'thieb'],
  riz: ['ceeb', 'basmati', 'thieb'],
  thieb: ['ceeb', 'riz', 'thieboudienne', 'ceebu jën'],
  thieboudienne: ['ceeb', 'riz', 'poisson', 'thieb'],

  // Viandes & Grillades
  yapp: ['viande', 'bœuf', 'mouton', 'dibi', 'viandes'],
  viande: ['yapp', 'bœuf', 'mouton', 'dibi'],
  dibi: ['mouton', 'viande', 'grillade', 'poulet'],
  ginaar: ['poulet', 'yassa', 'volaille'],
  poulet: ['ginaar', 'yassa', 'volaille', 'dibi'],
  yassa: ['poulet', 'oignon', 'citron', 'ginaar'],
  maafe: ['bœuf', 'arachide', 'sauce'],

  // Poisson
  jen: ['poisson', 'bouillon de poissons', 'thieb'],
  jën: ['poisson', 'thieboudienne'],
  poisson: ['jen', 'jën', 'bouillon de poissons'],

  // Légumes & condiments
  soble: ['oignon', 'oignons rouges'],
  oignon: ['soble', 'oignons rouges'],
  kaani: ['piment', 'piments verts', 'piments'],
  piment: ['kaani', 'piments'],
  tamaate: ['tomate', 'tomates fraîches'],
  tomate: ['tamaate', 'tomates'],

  // Boissons & Épicerie
  bissap: ['jus de bissap', 'hibiscus', 'boisson'],
  cafe: ['café touba', 'café'],
  café: ['touba', 'café touba'],
  touba: ['café', 'café touba'],
  sucre: ['sucre brut', 'canne'],
  diw: ['huile', 'huile arachide'],
  huile: ['diw', 'arachide'],
  xorom: ['sel', 'sel cuisine'],
  sel: ['xorom', 'cuisine'],
  meew: ['lait', 'lait en poudre'],
  lait: ['meew', 'poudre'],

  // Tissus & Habillement
  bazin: ['tunique bazin', 'tissu', 'boubou'],
  wax: ['pagne wax', 'tissu', 'pagne'],
  pagne: ['wax', 'bazin'],
  boubou: ['boubou traditionnel', 'tunique', 'bazin'],

  // Matériaux
  ciment: ['ciment portland', 'matériaux'],
  sable: ['sable fin', 'chantier'],
  brique: ['briques', 'construction'],

  // Téléphonie
  telephone: ['téléphone portable', 'smartphone', 'iphone', 'samsung'],
  téléphone: ['telephone portable', 'iphone', 'samsung', 'xiaomi'],
};

/**
 * Étend une requête de recherche avec ses synonymes locaux.
 */
export function expandSearchQuery(q: string): string[] {
  if (!q) return [];
  const clean = q.trim().toLowerCase();
  const variants = new Set<string>();
  variants.add(clean);

  // Normalisation sans accents
  const noAccent = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  variants.add(noAccent);

  // Recherche dans le dictionnaire
  for (const [key, synonyms] of Object.entries(LOCAL_SYNONYMS)) {
    const keyNorm = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (clean === key || noAccent === keyNorm || clean.includes(key) || key.includes(clean)) {
      synonyms.forEach((s) => variants.add(s));
    }
  }

  return Array.from(variants);
}
