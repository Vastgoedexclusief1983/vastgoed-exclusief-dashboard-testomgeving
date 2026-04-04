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

  if (trimmed in PROPERTY_TYPE_LABELS) {
    return PROPERTY_TYPE_LABELS[trimmed as PropertyTypeKey];
  }

  const lower = trimmed.toLowerCase();

  if (lower in NORMALIZATION_MAP) {
    const normalizedKey = NORMALIZATION_MAP[lower];
    return PROPERTY_TYPE_LABELS[normalizedKey];
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export const LOCATION_TYPE_LABELS = {
  'Open view': 'Open uitzicht',
  'Quiet neighborhood': 'Rustige woonwijk',
  'On busy road': 'Aan drukke weg',
  Waterfront: 'Aan het water',
  Rural: 'Landelijk gelegen',
} as const;

export type LocationTypeKey = keyof typeof LOCATION_TYPE_LABELS;

const LOCATION_NORMALIZATION_MAP: Record<string, LocationTypeKey> = {
  'open view': 'Open view',
  'quiet neighborhood': 'Quiet neighborhood',
  'on busy road': 'On busy road',
  waterfront: 'Waterfront',
  rural: 'Rural',
};

/**
 * Veilig label ophalen voor locatietype
 */
export function getLocationTypeLabel(input?: string | null): string {
  if (!input) return '';

  const trimmed = input.trim();

  if (trimmed in LOCATION_TYPE_LABELS) {
    return LOCATION_TYPE_LABELS[trimmed as LocationTypeKey];
  }

  const lower = trimmed.toLowerCase();

  if (lower in LOCATION_NORMALIZATION_MAP) {
    const normalizedKey = LOCATION_NORMALIZATION_MAP[lower];
    return LOCATION_TYPE_LABELS[normalizedKey];
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
