// lib/utils/propertyTypeLabels.ts

export const PROPERTY_TYPE_LABELS = {
  House: 'Woonhuis',
  Villa: 'Villa',
  CountryHouse: 'Landhuis',
  Mansion: 'Herenhuis',
  SemiDetached: '2-onder-1-kap woning',
  TerracedHouse: 'Tussenwoning',
  Apartment: 'Appartement',
  Penthouse: 'Penthouse',
  HolidayHome: 'Recreatiewoning',
  Farmhouse: 'Woonboerderij',
  MonumentalBuilding: 'Monumentaal pand',

  // legacy / oude waarden
  Condo: 'Appartement',
  Townhouse: 'Stadsvilla',
  Land: 'Bouwgrond',
  Commercial: 'Commercieel vastgoed',
} as const;

export type PropertyTypeKey = keyof typeof PROPERTY_TYPE_LABELS;

/**
 * Normalisatie mapping (voor API / lowercase / varianten)
 */
const NORMALIZATION_MAP: Record<string, PropertyTypeKey> = {
  // lowercase api / frontend varianten
  house: 'House',
  villa: 'Villa',
  countryhouse: 'CountryHouse',
  mansion: 'Mansion',
  semidetached: 'SemiDetached',
  terracedhouse: 'TerracedHouse',
  apartment: 'Apartment',
  penthouse: 'Penthouse',
  holidayhome: 'HolidayHome',
  farmhouse: 'Farmhouse',
  monumentalbuilding: 'MonumentalBuilding',

  // varianten / synoniemen
  flat: 'Apartment',
  condo: 'Condo',
  townhouse: 'Townhouse',
  land: 'Land',
  commercial: 'Commercial',
};

/**
 * Veilig label ophalen voor elk type input
 */
export function getPropertyTypeLabel(input?: string | null): string {
  if (!input) return '';

  const trimmed = input.trim();

  // 1. Directe match (beste case)
  if (trimmed in PROPERTY_TYPE_LABELS) {
    return PROPERTY_TYPE_LABELS[trimmed as PropertyTypeKey];
  }

  // 2. Lowercase normalisatie
  const lower = trimmed.toLowerCase();

  if (lower in NORMALIZATION_MAP) {
    const normalizedKey = NORMALIZATION_MAP[lower];
    return PROPERTY_TYPE_LABELS[normalizedKey];
  }

  // 3. Fallback (toon netjes met hoofdletter)
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
