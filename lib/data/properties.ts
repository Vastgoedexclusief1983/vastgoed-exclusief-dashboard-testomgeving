import dbConnect from '@/lib/db/mongodb';
import Property from '@/lib/db/models/Property';

export type PropertyStatus =
  | 'gepubliceerd'
  | 'onder-bod'
  | 'verkocht'
  | 'concept';

export type DashboardProperty = {
  id: string;
  propertyCode: string;
  title: string;
  address: string;
  city: string;
  province: string;
  price: string;
  priceValue: number;
  livingArea: string;
  plotArea: string;
  bedrooms: string;
  bathrooms: string;
  energyLabel: string;
  propertyType: string;
  status: PropertyStatus;
  image: string;
  luxuryTags: string[];
  createdAt: string;
  websiteUrl?: string;
};

export async function getPropertiesByAgent(agentId: string) {
  await dbConnect();

  const properties = await Property.find({
    agentId,
    isDeleted: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .lean();

  return properties;
}

function safeString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  const str = String(value).trim();
  return str || fallback;
}

function safeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}

function safeNumberString(value: unknown, fallback = '—'): string {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return String(num);
}

function formatPrice(value: unknown): string {
  const num = Number(value);

  if (Number.isNaN(num) || num <= 0) {
    return 'Prijs op aanvraag';
  }

  return (
    new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(num) + ' k.k.'
  );
}

function formatDate(value: unknown): string {
  const date = value ? new Date(String(value)) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return 'Onbekend';
  }

  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function mapPropertyTypeLabel(type: unknown): string {
  const value = safeString(type);

  switch (value) {
    case 'House':
      return 'Woning';
    case 'Villa':
      return 'Villa';
    case 'CountryHouse':
      return 'Landhuis';
    case 'Mansion':
      return 'Herenhuis';
    case 'SemiDetached':
      return 'Twee-onder-een-kapwoning';
    case 'TerracedHouse':
      return 'Tussenwoning';
    case 'Apartment':
      return 'Appartement';
    case 'Penthouse':
      return 'Penthouse';
    case 'HolidayHome':
      return 'Recreatiewoning';
    case 'Farmhouse':
      return 'Woonboerderij';
    case 'MonumentalBuilding':
      return 'Monumentaal pand';
    case 'Condo':
      return 'Condo';
    case 'Townhouse':
      return 'Stadswoning';
    case 'Land':
      return 'Bouwgrond';
    case 'Commercial':
      return 'Commercieel vastgoed';
    default:
      return value || 'Woning';
  }
}

function normalizeStatus(doc: any): PropertyStatus {
  const raw = safeString(doc?.status).toLowerCase();

  if (
    raw === 'gepubliceerd' ||
    raw === 'published' ||
    raw === 'actief' ||
    raw === 'active'
  ) {
    return 'gepubliceerd';
  }

  if (raw === 'onder-bod' || raw === 'under_offer') {
    return 'onder-bod';
  }

  if (raw === 'verkocht' || raw === 'sold') {
    return 'verkocht';
  }

  return 'concept';
}

function getImage(doc: any): string {
  const candidate =
    doc?.images?.[0]?.url ||
    doc?.images?.[0] ||
    doc?.media?.images?.[0]?.url ||
    doc?.media?.gallery?.[0]?.url ||
    doc?.featuredImage ||
    doc?.coverImage ||
    doc?.mainImage ||
    '';

  return (
    safeString(candidate) ||
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'
  );
}

function getLuxuryTags(doc: any): string[] {
  const amenities = doc?.luxuryFeatures?.amenities;

  if (Array.isArray(amenities)) {
    return amenities
      .map((item) => safeString(item))
      .filter(Boolean)
      .slice(0, 6);
  }

  return [];
}

function mapPropertyToDashboard(doc: any): DashboardProperty {
  const propertyTypeRaw = doc?.basicInfo?.propertyType;
  const propertyTypeLabel = mapPropertyTypeLabel(propertyTypeRaw);

  const address = safeString(doc?.basicInfo?.address, 'Adres onbekend');
  const city = safeString(doc?.basicInfo?.city, 'Plaats onbekend');
  const province = safeString(doc?.basicInfo?.province, '');
  const basePrice = safeNumber(doc?.basicInfo?.basePrice, 0);

  return {
    id: String(doc?._id),
    propertyCode: safeString(doc?.propertyCode, ''),
    title: propertyTypeLabel,
    address,
    city,
    province,
    price: formatPrice(basePrice),
    priceValue: basePrice,
    livingArea: safeNumberString(doc?.dimensions?.livingArea),
    plotArea: safeNumberString(doc?.dimensions?.lotSize),
    bedrooms: safeNumberString(doc?.dimensions?.bedrooms),
    bathrooms: safeNumberString(doc?.dimensions?.bathrooms),
    energyLabel: safeString(doc?.basicInfo?.energyLabel, '—'),
    propertyType: propertyTypeLabel,
    status: normalizeStatus(doc),
    image: getImage(doc),
    luxuryTags: getLuxuryTags(doc),
    createdAt: formatDate(doc?.createdAt),
    websiteUrl: '',
  };
}

export async function getDashboardPropertiesForAgent(
  agentId: string
): Promise<DashboardProperty[]> {
  const properties = await getPropertiesByAgent(agentId);
  return properties.map(mapPropertyToDashboard);
}
