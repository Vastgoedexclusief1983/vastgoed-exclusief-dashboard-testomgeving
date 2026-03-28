import { Feature, RoomType, CustomFeature } from '@/types/property-valuation';

export interface PropertyDetails {
  propertyId?: string;
  propertyCode?: string;
  address: string;
  postalCode: string;
  cityTown: string;
  province: string;
  propertyType: string;
  location: string;
  baseAskingPrice: number;
  energyLabel: string;
  yearBuilt: number;
  livingArea: number;
  plotArea: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  parkingSpaces: boolean;
}

export interface RoomBreakdown {
  room: RoomType;
  selectedFeatureCount: number;
  totalFeatureCount: number;
  selectedPoints: number;
  maxPoints: number;
  upgradePercent: number;
  upgradeValueEuro: number;
}

export interface Valuation {
  basePrice: number;
  totalUpgradePercent: number;
  upgradeValueEuro: number;
  finalPrice: number;
  roomBreakdowns: RoomBreakdown[];
}

export interface ChartImages {
  pieChart: string | null;
  barChart: string | null;
}

export interface PDFReportData {
  propertyDetails: PropertyDetails;
  valuation: Valuation;
  selectedFeaturesCount: number;
  selectedFeaturesByRoom: Record<RoomType, Feature[]>;
  customFeatures: CustomFeature[];
  sliderValues: Record<RoomType, number>;
  agentName?: string;
  agentCompanyName?: string;
  chartImages?: ChartImages;
}

export interface PDFTranslations {
  title: string;
  generatedOn: string;
  propertyCode: string;
  preparedBy: string;
  baseAskingPrice: string;
  addedValue: string;
  finalValuation: string;
  propertyDetails: string;
  address: string;
  propertyType: string;
  location: string;
  basePrice: string;
  energyLabel: string;
  yearBuilt: string;
  livingArea: string;
  plotArea: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  available: string;
  notAvailable: string;
  selectedFeatures: string;
  addedFeatures: string;
  weight: string;
  roomValueAnalysis: string;
  room: string;
  features: string;
  points: string;
  slider: string;
  percentImpact: string;
  euroValue: string;
  total: string;
  disclaimer: string;
  rooms: Record<string, string>;
  visualAnalysis?: string;
  priceComposition?: string;
  roomImpact?: string;
  basePriceLabel?: string;
  addedValueLabel?: string;
}
