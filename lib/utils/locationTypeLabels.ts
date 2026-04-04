// lib/utils/locationTypeLabels.ts

export const LOCATION_TYPE_LABELS = {
  'Open view': 'Open uitzicht',
  'Quiet neighborhood': 'Rustige woonwijk',
  'On busy road': 'Aan drukke weg',
  Waterfront: 'Aan het water',
  Rural: 'Landelijk gelegen',
} as const;

export type LocationTypeKey = keyof typeof LOCATION_TYPE_LABELS;

const NORMALIZATION_MAP: Record<string, LocationTypeKey> = {
  'open view': 'Open view',
  'quiet neighborhood': 'Quiet neighborhood',
  'on busy road': 'On busy road',
  waterfront: 'Waterfront',
  rural: 'Rural',
};

export function getLocationTypeLabel(input?: string | null): string {
  if (!input) return '';

  const trimmed = input.trim();

  if (trimmed in LOCATION_TYPE_LABELS) {
    return LOCATION_TYPE_LABELS[trimmed as LocationTypeKey];
  }

  const lower = trimmed.toLowerCase();

  if (lower in NORMALIZATION_MAP) {
    const normalizedKey = NORMALIZATION_MAP[lower];
    return LOCATION_TYPE_LABELS[normalizedKey];
  }

  return trimmed;
}
