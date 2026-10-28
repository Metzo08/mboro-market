/**
 * Liste des communes, quartiers et repères typiques de la région de Thiès et Mboro.
 * Permet un adressage local sans forcer de numéro de rue.
 */

export interface CommuneData {
  name: string;
  quarters: string[];
  popularLandmarks: string[];
}

export const THIES_COMMUNES: Record<string, CommuneData> = {
  Mboro: {
    name: 'Mboro',
    quarters: [
      'Mboro-sur-Mer',
      'Centre-Ville / Marché',
      'Quartier Escale',
      'Cité ICS',
      'Diamaguène',
      'Médina',
      'Darou Salam',
      'Kourah',
    ],
    popularLandmarks: [
      'Près du Marché Central',
      'Face à la Grande Mosquée',
      'À côté de la Station Total',
      'Derrière la Mairie',
      'Près du Dispensaire / Hôpital',
      'Au niveau de l’arrêt des Taxis / Jakarta',
      'Près de l’école primaire',
    ],
  },
  'Thiès-Nord': {
    name: 'Thiès-Nord',
    quarters: [
      'Grand Standing',
      'Nguinth',
      'Médina Fall',
      'Takhikao',
      'Sampathé',
      'Peycouck',
    ],
    popularLandmarks: [
      'Près du Rond-point Nguinth',
      'Face à l’Hôpital Régional',
      'À côté de la Pharmacie',
      'Derrière le Stade Lat Dior',
    ],
  },
  'Thiès-Est': {
    name: 'Thiès-Est',
    quarters: [
      'Quartier Escale',
      'Cité Lamy',
      'Dixième',
      'Mbour 1',
      'Mbour 2',
      'Diamaguène',
      'Diakhao',
    ],
    popularLandmarks: [
      'Près du Marché Central de Thiès',
      'Face à la Gare ferroviaire',
      'Près de la Place de France',
      'À côté de la Banque / Wari',
    ],
  },
  'Thiès-Ouest': {
    name: 'Thiès-Ouest',
    quarters: [
      'Cité Senghor',
      'Fahu',
      'Thialy',
      'Silmang',
      'Randoulène',
    ],
    popularLandmarks: [
      'Près de l’Université Iba Der Thiam',
      'Face à la Gendarmerie',
      'Près de la Station Shell',
    ],
  },
  Khombole: {
    name: 'Khombole',
    quarters: ['Escale', 'Darou', 'Diamaguène'],
    popularLandmarks: ['Près du Marché', 'Face à la Mosquée'],
  },
  Tivaouane: {
    name: 'Tivaouane',
    quarters: ['Centre', 'Kouly', 'Médina'],
    popularLandmarks: ['Près des Zawiyas', 'Gare routière'],
  },
};
