/**
 * Module d'intelligence Wolof <-> Français pour le copilote marchand.
 * Traduction authentique et génération de réponses contextuelles locales.
 */

export const WOLOF_LEXICON: Record<string, string> = {
  // Salutations
  bonjour: 'salaamalekum',
  salut: 'na nga def',
  'comment vas-tu': 'na nga def',
  'je vais bien': 'mangi fi rekk',
  merci: 'jërëjëf',
  'au revoir': 'ba beneen yoon',
  bienvenue: 'dalal ak jamm',

  // Commerce & boutique
  boutique: 'butik bi',
  magasin: 'butik bi',
  produit: 'jumtukaay bi',
  produits: 'jumtukaay yi',
  marchandise: 'marsandiis bi',
  vente: 'jaay mi',
  achat: 'jënd bi',
  commander: 'komande',
  commande: 'komande bi',
  commandes: 'komande yi',
  client: 'kiliyaan bi',
  clients: 'kiliyaan yi',

  // Prix & argent
  prix: 'njëg li',
  argent: 'xaalis bi',
  combien: 'ñaata',
  'c’est cher': 'dafa seer',
  'ce n’est pas cher': 'seerul',
  payer: 'fey',
  paiement: 'fey gi',

  // Stock & disponibilité
  stock: 'es-tok bi',
  disponible: 'am na',
  'en rupture': 'jeex na',
  reste: 'des na',
  'il y a': 'am na',
  'il n’y a pas': 'amul',

  // Livraison & repères
  livraison: 'yóbbu bi',
  livrer: 'yóbbu',
  retrait: 'jëli ci butik bi',
  maison: 'kër gi',
  marché: 'marse bi',
  près: 'ci wetu',
  face: 'ci kanamu',
};

/**
 * Génère une réponse Wolof naturelle selon l'intention détectée.
 */
export function buildWolofResponse(intent: string, data: { shopName: string; details?: string; products?: Array<{ title: string; price: number; stock: number }> }): string {
  const { shopName, products } = data;
  const fmt = (n: number) => new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

  switch (intent) {
    case 'GREETING':
      return `Salaamalekum ! Dalal ak jamm ci ${shopName}. Naka laa la mën a dimbalee tay ? Wax ma sa laaj ci njëg yi, es-tok bi walla yóbbu bi.`;

    case 'PRICES':
      if (!products || products.length === 0) {
        return `Amul jumtukaay ci butik bi ${shopName} léegi.`;
      }
      const priceList = products.slice(0, 5).map(p => `• *${p.title}* : ${fmt(p.price)}`).join('\n');
      return `Yii ñooy njëg yi ci ${shopName} :\n${priceList}\n\nNdax bëgg nga komande benn ?`;

    case 'STOCK':
      if (!products || products.length === 0) {
        return `Amul dara ci es-tok bi léegi.`;
      }
      const stockList = products.slice(0, 5).map(p => `• *${p.title}* : ${p.stock > 0 ? `am na ${p.stock}` : 'jeex na'}`).join('\n');
      return `Li am ci es-tok bi léegi :\n${stockList}`;

    case 'DELIVERY':
      return `Ci wàllu yóbbu bi, ${shopName} mën na la yóbbal sa komande ci Thiès, Mboro ak li ko wër. Waxal sa kër ak repère bi (marse, jàkka...).`;

    case 'DRAFT_PRODUCT':
      return `D'accord ! Mën naa la bindal annonce bi. Wax ma turu jumtukaay bi, ñaata lay jar ak ñaata nga am ci es-tok bi.`;

    default:
      if (products && products.length > 0) {
        const samples = products.slice(0, 3).map(p => `• ${p.title} (${fmt(p.price)})`).join('\n');
        return `Ci ${shopName}, li am léegi mooy :\n${samples}\n\nLaajal ma njëg yi, es-tok bi walla yóbbu bi !`;
      }
      return `Jërëjëf ! Amuma leeral yii ci ${shopName}. Ndax mën nga laaj beneen mbir ?`;
  }
}
