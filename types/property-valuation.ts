// Property Valuation Types
export type PropertyType =
  | 'House'
  | 'Villa'
  | 'CountryHouse'
  | 'Mansion'
  | 'SemiDetached'
  | 'TerracedHouse'
  | 'Apartment'
  | 'Penthouse'
  | 'HolidayHome'
  | 'Farmhouse'
  | 'MonumentalBuilding'
  | 'Condo'
  | 'Townhouse'
  | 'Land'
  | 'Commercial';


export type EnergyLabel = 'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'Niet bekend';

export type LocationType = 'Open view' | 'Quiet neighborhood' | 'On busy road' | 'Waterfront' | 'Rural';

export type RoomType = 'Kitchen' | 'Bathroom' | 'Living Room' | 'Outdoor' | 'Bedroom' | 'Extras';

export interface PropertyDetails {
  propertyId: string;
  propertyCode?: string;
  address: string;
  postalCode: string;
  cityTown: string;
  province: string;
  propertyType: PropertyType;
  baseAskingPrice: number;
  energyLabel: EnergyLabel;
  location: LocationType;
  yearBuilt: number;
  livingArea: number;
  plotArea: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  parkingSpaces: boolean;
}

export interface Feature {
  id: string;
  room: RoomType;
  name: string;
  weight: number; // 1-5
}

export interface CustomFeature {
  id: string;
  name: string;
  room: RoomType;
  weight: number;
}

export interface SelectedFeature extends Feature {
  selected: boolean;
}

export interface SliderValues {
  Kitchen: number;
  Bathroom: number;
  'Living Room': number;
  Outdoor: number;
  Bedroom: number;
  Extras: number;
}

export interface RoomBreakdown {
  room: RoomType;
  selectedPoints: number;
  maxPoints: number;
  sliderValue: number;
  maxSliderValue: number;
  upgradePercent: number;
  upgradeValueEuro: number;
  selectedFeatureCount: number;
  totalFeatureCount: number;
}

export interface ValuationResult {
  basePrice: number;
  totalUpgradePercent: number;
  upgradeValueEuro: number;
  finalPrice: number;
  roomBreakdowns: RoomBreakdown[];
}

export interface PropertyValuationState {
  propertyDetails: PropertyDetails | null;
  selectedFeatures: string[]; // Feature IDs
  sliderValues: SliderValues;
  valuation: ValuationResult | null;
}

// Default values
export const defaultSliderValues: SliderValues = {
  Kitchen: 0,
  Bathroom: 0,
  'Living Room': 0,
  Outdoor: 0,
  Bedroom: 0,
  Extras: 0,
};

export const defaultPropertyDetails: PropertyDetails = {
  propertyId: '',
  propertyCode: '',
  address: '',
  postalCode: '',
  cityTown: '',
  province: '',
  propertyType: 'Apartment',
  baseAskingPrice: 0,
  energyLabel: 'Niet bekend',
  location: 'Quiet neighborhood',
  yearBuilt: new Date().getFullYear(),
  livingArea: 0,
  plotArea: 0,
  numberOfBedrooms: 1,
  numberOfBathrooms: 1,
  parkingSpaces: false,
};

export const PROPERTY_TYPES: PropertyType[] = [
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
];

export const ENERGY_LABELS: EnergyLabel[] = [
  'A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Niet bekend'
];

export const LOCATION_TYPES: LocationType[] = [
  'Open view',
  'Quiet neighborhood',
  'On busy road',
  'Waterfront',
  'Rural',
];

export const ROOM_TYPES: RoomType[] = [
  'Kitchen',
  'Bathroom',
  'Living Room',
  'Outdoor',
  'Bedroom',
  'Extras',
];
