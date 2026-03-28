// lib/luxury-features.ts

export type LuxuryFeatureKey =
  | 'Swimming Pool'
  | 'Wine Cellar'
  | 'Security System'
  | 'Balcony'
  | 'Gym'
  | 'Home Theater'
  | 'Solar Panels'
  | 'Terrace'
  | 'Sauna'
  | 'Smart Home'
  | 'Fireplace'
  | 'Garden'
  | 'Parking Available';

export const LUXURY_FEATURES: Array<{
  key: LuxuryFeatureKey;
  labelNl: string;
  category: 'Amenities' | 'Parking';
}> = [
  { key: 'Swimming Pool', labelNl: 'Zwembad', category: 'Amenities' },
  { key: 'Wine Cellar', labelNl: 'Wijnkelder', category: 'Amenities' },
  { key: 'Security System', labelNl: 'Beveiligingssysteem', category: 'Amenities' },
  { key: 'Balcony', labelNl: 'Balkon', category: 'Amenities' },
  { key: 'Gym', labelNl: 'Fitnessruimte', category: 'Amenities' },
  { key: 'Home Theater', labelNl: 'Thuisbioscoop', category: 'Amenities' },
  { key: 'Solar Panels', labelNl: 'Zonnepanelen', category: 'Amenities' },
  { key: 'Terrace', labelNl: 'Terras', category: 'Amenities' },
  { key: 'Sauna', labelNl: 'Sauna', category: 'Amenities' },
  { key: 'Smart Home', labelNl: 'Domotica', category: 'Amenities' },
  { key: 'Fireplace', labelNl: 'Open haard', category: 'Amenities' },
  { key: 'Garden', labelNl: 'Tuin', category: 'Amenities' },
  { key: 'Parking Available', labelNl: 'Parkeren beschikbaar', category: 'Parking' },
];

const LABEL_NL: Record<string, string> = Object.fromEntries(
  LUXURY_FEATURES.map((f) => [f.key, f.labelNl])
);

function norm(s: string) {
  return (s ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

const ALIASES_NL_TO_CANON: Record<string, LuxuryFeatureKey> = {
  zwembad: 'Swimming Pool',
  pool: 'Swimming Pool',
  wijnkelder: 'Wine Cellar',
  beveiliging: 'Security System',
  alarmsysteem: 'Security System',
  balkon: 'Balcony',
  fitness: 'Gym',
  gym: 'Gym',
  thuisbioscoop: 'Home Theater',
  bioscoop: 'Home Theater',
  zonnepanelen: 'Solar Panels',
  terras: 'Terrace',
  dakterras: 'Terrace',
  sauna: 'Sauna',
  domotica: 'Smart Home',
  smarthome: 'Smart Home',
  haard: 'Fireplace',
  openhaard: 'Fireplace',
  'open haard': 'Fireplace',
  tuin: 'Garden',
  parkeren: 'Parking Available',
  parkeergelegenheid: 'Parking Available',
};

export function luxuryFeatureLabelNl(key: string): string {
  return LABEL_NL[key] ?? key;
}

export function toCanonicalLuxuryFeature(tag: string): LuxuryFeatureKey | null {
  const t = norm(tag);
  if (!t) return null;
  const hit = ALIASES_NL_TO_CANON[t];
  if (hit) return hit;

  // als iemand al de EN key typt
  for (const f of LUXURY_FEATURES) {
    if (norm(f.key) === t) return f.key;
  }
  return null;
}

export function parseLuxuryTags(input: string): { canonical: LuxuryFeatureKey[]; unknown: string[] } {
  const parts = (input ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  const canonicalSet = new Set<LuxuryFeatureKey>();
  const unknown: string[] = [];

  for (const p of parts) {
    const c = toCanonicalLuxuryFeature(p);
    if (c) canonicalSet.add(c);
    else unknown.push(norm(p));
  }

  return { canonical: Array.from(canonicalSet), unknown };
}
