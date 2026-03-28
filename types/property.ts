export const PROPERTY_TYPES = [
  'House',
  'Villa',
  'CountryHouse',
  'Mansion',
  'SemiDetached',
  'TerracedHouse',
  'Apartment',
  'Penthouse',
  'HolidayHome',
  'Farmhouse',
  'MonumentalBuilding',
] as const;

export const PROPERTY_TYPE_LABELS: Record<(typeof PROPERTY_TYPES)[number], string> = {
  House: 'Vrijstaande woning',
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
};

export const ENERGY_LABELS = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Niet bekend'] as const;

export const PROVINCES = [
  'Groningen',
  'Friesland',
  'Drenthe',
  'Overijssel',
  'Flevoland',
  'Gelderland',
  'Utrecht',
  'Noord-Holland',
  'Zuid-Holland',
  'Zeeland',
  'Noord-Brabant',
  'Limburg',
] as const;

export const PARKING_TYPES = ['Garage', 'Carport', 'Driveway', 'Street'] as const;

export interface PropertyImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface LuxuryFeatures {
  amenities?: string[];
  parking?: {
    available?: boolean;
    spaces?: number;
    type?: typeof PARKING_TYPES[number];
  };
}

export interface ValuationData {
  finalPrice?: number;
  addedValue?: number;
  addedValuePercent?: number;
  selectedFeatures?: string[];
  customFeatures?: {
    name: string;
    room: string;
    weight: number;
  }[];
  sliderValues?: {
    Kitchen: number;
    Bathroom: number;
    'Living Room': number;
    Outdoor: number;
    Bedroom: number;
    Extras: number;
  };
  valuatedAt?: Date;
  valuatedBy?: string;
}

export interface IProperty {
  _id: string;
  propertyCode?: string;
  agentId: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  basicInfo: {
    address: string;
    postalCode: string;
    city: string;
    province: typeof PROVINCES[number];
    propertyType: typeof PROPERTY_TYPES[number];
    constructionYear: number;
    basePrice: number;
    energyLabel: typeof ENERGY_LABELS[number];
    location: string;
  };
  dimensions: {
    livingArea: number;
    lotSize: number;
    bedrooms: number;
    bathrooms: number;
  };
  luxuryFeatures?: LuxuryFeatures;
  images?: PropertyImage[];
  valuation?: ValuationData;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedValuationData {
  finalPrice?: number;
  addedValue?: number;
  addedValuePercent?: number;
  selectedFeatures?: string[];
  customFeatures?: {
    name: string;
    room: string;
    weight: number;
  }[];
  sliderValues?: {
    Kitchen: number;
    Bathroom: number;
    'Living Room': number;
    Outdoor: number;
    Bedroom: number;
    Extras: number;
  };
  valuatedAt?: string;
  valuatedBy?: string;
}

export interface SerializedProperty {
  _id: string;
  propertyCode?: string;
  agentId: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  basicInfo: {
    address: string;
    postalCode: string;
    city: string;
    province: typeof PROVINCES[number];
    propertyType: typeof PROPERTY_TYPES[number];
    constructionYear: number;
    basePrice: number;
    energyLabel: typeof ENERGY_LABELS[number];
    location: string;
  };
  dimensions: {
    livingArea: number;
    lotSize: number;
    bedrooms: number;
    bathrooms: number;
  };
  luxuryFeatures?: LuxuryFeatures;
  images?: PropertyImage[];
  valuation?: SerializedValuationData;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyWithAgent extends IProperty {
  agent?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    agentCode: string;
  };
}

export const AMENITIES = [
  'Zwembad',
  'Poolhouse',
  'Sauna',
  'Jacuzzi',
  'Wellnessruimte',
  'Fitnessruimte',
  'Thuisbioscoop',
  'Wijnkelder',
  'Wijnkamer',
  'Smart home systeem',
  'Domotica',
  'Beveiligingssysteem',
  'Alarmsysteem',
  'Garage',
  'Dubbele garage',
  'Carport',
  'Eigen oprit',
  'Aangelegde tuin',
  'Grote tuin',
  'Terras',
  'Overdekt terras',
  'Dakterras',
  'Balkon',
  'Gastenverblijf',
  'Gastenkamer',
  'Thuiswerkruimte',
  'Kantoorruimte',
  'Open haard',
  'Design haard',
  'Lift',
  'Aan vaarwater',
  'Eigen aanlegsteiger',
  'Uitzicht op water',
  'Elektrische toegangspoort',
  'Eigen oprijlaan',
  'Zonnepanelen',
  'Warmtepomp',
  'Vloerverwarming',
  'paardenverblijf',
  'boothuis',
  'walkin closet',
  'en suite badkamer',
] as const;

export interface CreatePropertyInput {
  address: string;
  postalCode: string;
  city: string;
  province: string;
  propertyType: string;
  constructionYear: number;
  basePrice: number;
  energyLabel: string;
  location: string;
  livingArea: number;
  lotSize: number;
  bedrooms: number;
  bathrooms: number;
  luxuryFeatures?: LuxuryFeatures;
  images?: PropertyImage[];
}

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {}
