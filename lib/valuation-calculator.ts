import {
  Feature,
  RoomType,
  SliderValues,
  RoomBreakdown,
  ValuationResult,
  ROOM_TYPES,
} from '@/types/property-valuation';
import { propertyFeatures, getFeaturesByRoom, getMaxPointsForRoom } from './property-features';

// Constants
const MAX_ADDED_VALUE_PER_ROOM = 0.06; // 6% max per room
const SLIDER_INCREASE_PER_FEATURE = 10; // 10% per selected feature

/**
 * Calculate the maximum slider value for a room based on selected features
 * Each selected feature allows +10% slider value, capped at 100%
 */
export function calculateMaxSliderValue(
  room: RoomType,
  selectedFeatureIds: string[]
): number {
  const roomFeatures = getFeaturesByRoom(room);
  const selectedCount = roomFeatures.filter((f) =>
    selectedFeatureIds.includes(f.id)
  ).length;

  return Math.min(selectedCount * SLIDER_INCREASE_PER_FEATURE, 100);
}

/**
 * Get selected points for a room
 */
export function getSelectedPointsForRoom(
  room: RoomType,
  selectedFeatureIds: string[]
): number {
  const roomFeatures = getFeaturesByRoom(room);
  return roomFeatures
    .filter((f) => selectedFeatureIds.includes(f.id))
    .reduce((sum, f) => sum + f.weight, 0);
}

/**
 * Calculate room upgrade percentage
 * Formula: (SelectedPoints / MaxPoints) × SliderValue × MaxAddedValueForRoom
 */
export function calculateRoomUpgradePercent(
  room: RoomType,
  selectedFeatureIds: string[],
  sliderValue: number
): number {
  const maxPoints = getMaxPointsForRoom(room);
  const selectedPoints = getSelectedPointsForRoom(room, selectedFeatureIds);

  if (maxPoints === 0 || selectedPoints === 0) return 0;

  const sliderFraction = sliderValue / 100;
  const pointsFraction = selectedPoints / maxPoints;

  return pointsFraction * sliderFraction * MAX_ADDED_VALUE_PER_ROOM;
}

/**
 * Calculate room breakdown
 */
export function calculateRoomBreakdown(
  room: RoomType,
  selectedFeatureIds: string[],
  sliderValue: number,
  basePrice: number
): RoomBreakdown {
  const roomFeatures = getFeaturesByRoom(room);
  const selectedFeatureCount = roomFeatures.filter((f) =>
    selectedFeatureIds.includes(f.id)
  ).length;

  const maxPoints = getMaxPointsForRoom(room);
  const selectedPoints = getSelectedPointsForRoom(room, selectedFeatureIds);
  const maxSliderValue = calculateMaxSliderValue(room, selectedFeatureIds);
  const upgradePercent = calculateRoomUpgradePercent(room, selectedFeatureIds, sliderValue);
  const upgradeValueEuro = basePrice * upgradePercent;

  return {
    room,
    selectedPoints,
    maxPoints,
    sliderValue,
    maxSliderValue,
    upgradePercent,
    upgradeValueEuro,
    selectedFeatureCount,
    totalFeatureCount: roomFeatures.length,
  };
}

/**
 * Calculate full valuation result
 */
export function calculateValuation(
  basePrice: number,
  selectedFeatureIds: string[],
  sliderValues: SliderValues
): ValuationResult {
  const roomBreakdowns: RoomBreakdown[] = ROOM_TYPES.map((room) =>
    calculateRoomBreakdown(room, selectedFeatureIds, sliderValues[room], basePrice)
  );

  const totalUpgradePercent = roomBreakdowns.reduce(
    (sum, rb) => sum + rb.upgradePercent,
    0
  );

  const upgradeValueEuro = basePrice * totalUpgradePercent;
  const finalPrice = basePrice + upgradeValueEuro;

  return {
    basePrice,
    totalUpgradePercent,
    upgradeValueEuro,
    finalPrice,
    roomBreakdowns,
  };
}

/**
 * Get selected features with full details
 */
export function getSelectedFeaturesDetails(
  selectedFeatureIds: string[]
): Feature[] {
  return propertyFeatures.filter((f) => selectedFeatureIds.includes(f.id));
}

/**
 * Get selected features grouped by room
 */
export function getSelectedFeaturesByRoom(
  selectedFeatureIds: string[]
): Record<RoomType, Feature[]> {
  const result: Record<RoomType, Feature[]> = {
    Kitchen: [],
    Bathroom: [],
    'Living Room': [],
    Outdoor: [],
    Bedroom: [],
    Extras: [],
  };

  const selectedFeatures = getSelectedFeaturesDetails(selectedFeatureIds);
  selectedFeatures.forEach((f) => {
    result[f.room].push(f);
  });

  return result;
}

/**
 * Format currency (Euro)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}
