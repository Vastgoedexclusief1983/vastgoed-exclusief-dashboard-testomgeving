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

  // oude waarden voor bestaande records / backward compatibility
  Condo: 'Condominium',
  Townhouse: 'Stadsvilla',
  Land: 'Bouwgrond',
  Commercial: 'Commercieel vastgoed',
} as const;

export type PropertyTypeKey = keyof typeof PROPERTY_TYPE_LABELS;

/**
 * Veilig label ophalen voor een woningtype dat uit DB/API kan komen als:
 * string | null | undefined (en soms met andere casing/varianten).
 */
export function getPropertyTypeLabel(input?: string | null): string {
  if (!input) return '';

  // Normaliseer veelvoorkomende varianten (optioneel uitbreiden)
  const normalized = input.trim();

  // Exacte match (House/Apartment/...)
  if (normalized in PROPERTY_TYPE_LABELS) {
    return PROPERTY_TYPE_LABELS[normalized as PropertyTypeKey];
  }

  // Fallback: toon originele waarde
  return normalized;
}
