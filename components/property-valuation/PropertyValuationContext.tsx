'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  PropertyDetails,
  SliderValues,
  ValuationResult,
  defaultSliderValues,
  defaultPropertyDetails,
  RoomType,
  CustomFeature,
} from '@/types/property-valuation';
import { calculateValuation, calculateMaxSliderValue } from '@/lib/valuation-calculator';

export type { CustomFeature };

interface PropertyValuationContextType {
  // Property Details (Tab 1)
  propertyDetails: PropertyDetails;
  setPropertyDetails: (details: PropertyDetails) => void;
  updatePropertyDetail: <K extends keyof PropertyDetails>(key: K, value: PropertyDetails[K]) => void;

  // Features (Tab 2)
  selectedFeatures: string[];
  setSelectedFeatures: (features: string[]) => void;
  toggleFeature: (featureId: string) => void;
  clearFeatures: () => void;

  // Custom Features
  customFeatures: CustomFeature[];
  addCustomFeature: (feature: Omit<CustomFeature, 'id'>) => void;
  removeCustomFeature: (id: string) => void;
  setCustomFeatures: (features: CustomFeature[]) => void;

  // Sliders (Tab 2)
  sliderValues: SliderValues;
  setSliderValue: (room: RoomType, value: number) => void;
  setSliderValues: (values: SliderValues) => void;
  getMaxSliderValue: (room: RoomType) => number;

  // Valuation Result
  valuation: ValuationResult | null;

  // Tab Navigation
  activeTab: number;
  setActiveTab: (tab: number) => void;
  canProceedToTab2: boolean;
  canProceedToTab3: boolean;

  // Load saved valuation
  loadSavedValuation: (propertyId: string) => Promise<void>;

  // Initial property ID from URL
  initialPropertyId?: string;

  // Reset
  resetAll: () => void;
}

const PropertyValuationContext = createContext<PropertyValuationContextType | undefined>(undefined);

interface PropertyValuationProviderProps {
  children: React.ReactNode;
  initialPropertyId?: string;
}

export function PropertyValuationProvider({ children, initialPropertyId }: PropertyValuationProviderProps) {
  // Tab 1: Property Details
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>(defaultPropertyDetails);

  // Tab 2: Features & Sliders
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sliderValues, setSliderValues] = useState<SliderValues>(defaultSliderValues);

  // Custom Features
  const [customFeatures, setCustomFeatures] = useState<CustomFeature[]>([]);

  // Tab Navigation
  const [activeTab, setActiveTab] = useState(0);

  // Update single property detail
  const updatePropertyDetail = useCallback(<K extends keyof PropertyDetails>(
    key: K,
    value: PropertyDetails[K]
  ) => {
    setPropertyDetails((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Toggle feature selection
  const toggleFeature = useCallback((featureId: string) => {
    setSelectedFeatures((prev) => {
      if (prev.includes(featureId)) {
        return prev.filter((id) => id !== featureId);
      }
      return [...prev, featureId];
    });
  }, []);

  // Clear all features
  const clearFeatures = useCallback(() => {
    setSelectedFeatures([]);
    setSliderValues(defaultSliderValues);
    setCustomFeatures([]);
  }, []);

  // Add custom feature
  const addCustomFeature = useCallback((feature: Omit<CustomFeature, 'id'>) => {
    const newFeature: CustomFeature = {
      ...feature,
      id: `custom-${Date.now()}`,
    };
    setCustomFeatures((prev) => [...prev, newFeature]);
    // Also select the custom feature
    setSelectedFeatures((prev) => [...prev, newFeature.id]);
  }, []);

  // Remove custom feature
  const removeCustomFeature = useCallback((id: string) => {
    setCustomFeatures((prev) => prev.filter((f) => f.id !== id));
    setSelectedFeatures((prev) => prev.filter((fId) => fId !== id));
  }, []);

  // Set slider value for a room
  const setSliderValue = useCallback((room: RoomType, value: number) => {
    setSliderValues((prev) => ({ ...prev, [room]: value }));
  }, []);

  // Get max slider value for a room
  const getMaxSliderValue = useCallback(
    (room: RoomType) => calculateMaxSliderValue(room, selectedFeatures),
    [selectedFeatures]
  );

  // Calculate valuation whenever inputs change
  const valuation = useMemo(() => {
    if (!propertyDetails.baseAskingPrice || propertyDetails.baseAskingPrice <= 0) {
      return null;
    }
    return calculateValuation(propertyDetails.baseAskingPrice, selectedFeatures, sliderValues);
  }, [propertyDetails.baseAskingPrice, selectedFeatures, sliderValues]);

  // Tab validation - only require propertyId and baseAskingPrice to proceed
  const canProceedToTab2 = useMemo(() => {
    return (
      (propertyDetails.propertyId?.trim() || '') !== '' &&
      (propertyDetails.baseAskingPrice || 0) > 0
    );
  }, [propertyDetails]);

  const canProceedToTab3 = useMemo(() => {
    return canProceedToTab2 && selectedFeatures.length > 0;
  }, [canProceedToTab2, selectedFeatures]);

  // Reset everything
  const resetAll = useCallback(() => {
    setPropertyDetails(defaultPropertyDetails);
    setSelectedFeatures([]);
    setSliderValues(defaultSliderValues);
    setCustomFeatures([]);
    setActiveTab(0);
  }, []);

  // Load saved valuation from database
  const loadSavedValuation = useCallback(async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/valuation`);
      if (response.ok) {
        const data = await response.json();
        if (data.valuation) {
          // Load selected features
          if (data.valuation.selectedFeatures && data.valuation.selectedFeatures.length > 0) {
            setSelectedFeatures(data.valuation.selectedFeatures);
          }
          // Load custom features
          if (data.valuation.customFeatures && data.valuation.customFeatures.length > 0) {
            const customFeaturesWithIds = data.valuation.customFeatures.map((cf: any, index: number) => ({
              ...cf,
              id: `custom-loaded-${index}`,
            }));
            setCustomFeatures(customFeaturesWithIds);
          }
          // Load slider values
          if (data.valuation.sliderValues) {
            setSliderValues({
              ...defaultSliderValues,
              ...data.valuation.sliderValues,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved valuation:', error);
    }
  }, []);

  // Load full property data (including valuation) by ID
  const loadPropertyById = useCallback(async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (response.ok) {
        const result = await response.json();

        // API returns { success: true, data: property }
        const property = result.data || result;

        if (!property) {
          console.error('No property data found');
          return;
        }

        setPropertyDetails({
          propertyId: property._id,
          propertyCode: property.propertyCode || '',
          propertyType: property.basicInfo?.propertyType || 'House',
          address: property.basicInfo?.address || '',
          postalCode: property.basicInfo?.postalCode || '',
          cityTown: property.basicInfo?.city || '',
          province: property.basicInfo?.province || '',
          location: property.basicInfo?.location || 'Quiet neighborhood',
          baseAskingPrice: property.basicInfo?.basePrice || 0,
          energyLabel: property.basicInfo?.energyLabel || 'Niet bekend',
          yearBuilt: property.basicInfo?.constructionYear || new Date().getFullYear(),
          livingArea: property.dimensions?.livingArea || 0,
          plotArea: property.dimensions?.lotSize || 0,
          numberOfBedrooms: property.dimensions?.bedrooms || 0,
          numberOfBathrooms: property.dimensions?.bathrooms || 0,
          parkingSpaces: !!property.luxuryFeatures?.parking?.spaces,
        });

        // Load valuation data if exists
        if (property.valuation) {
          if (property.valuation.selectedFeatures && property.valuation.selectedFeatures.length > 0) {
            setSelectedFeatures(property.valuation.selectedFeatures);
          }
          if (property.valuation.customFeatures && property.valuation.customFeatures.length > 0) {
            const customFeaturesWithIds = property.valuation.customFeatures.map((cf: any, index: number) => ({
              ...cf,
              id: `custom-loaded-${index}`,
            }));
            setCustomFeatures(customFeaturesWithIds);
          }
          if (property.valuation.sliderValues) {
            setSliderValues({
              ...defaultSliderValues,
              ...property.valuation.sliderValues,
            });
          }
        }
      } else {
        console.error('Failed to load property:', response.status);
      }
    } catch (error) {
      console.error('Error loading property:', error);
    }
  }, []);

  useEffect(() => {
    if (initialPropertyId) {
      const loadProperty = async () => {
        try {
          const response = await fetch(`/api/properties/${initialPropertyId}`);
          if (response.ok) {
            const result = await response.json();
            const property = result.data || result;

            if (!property) return;

            setPropertyDetails({
              propertyId: property._id,
              propertyCode: property.propertyCode || '',
              propertyType: property.basicInfo?.propertyType || 'House',
              address: property.basicInfo?.address || '',
              postalCode: property.basicInfo?.postalCode || '',
              cityTown: property.basicInfo?.city || '',
              province: property.basicInfo?.province || '',
              location: property.basicInfo?.location || 'Quiet neighborhood',
              baseAskingPrice: property.basicInfo?.basePrice || 0,
              energyLabel: property.basicInfo?.energyLabel || 'Niet bekend',
              yearBuilt: property.basicInfo?.constructionYear || new Date().getFullYear(),
              livingArea: property.dimensions?.livingArea || 0,
              plotArea: property.dimensions?.lotSize || 0,
              numberOfBedrooms: property.dimensions?.bedrooms || 0,
              numberOfBathrooms: property.dimensions?.bathrooms || 0,
              parkingSpaces: !!property.luxuryFeatures?.parking?.spaces,
            });

            if (property.valuation) {
              if (property.valuation.selectedFeatures?.length > 0) {
                setSelectedFeatures(property.valuation.selectedFeatures);
              }
              if (property.valuation.customFeatures?.length > 0) {
                setCustomFeatures(property.valuation.customFeatures.map((cf: any, i: number) => ({
                  ...cf,
                  id: `custom-loaded-${i}`,
                })));
              }
              if (property.valuation.sliderValues) {
                setSliderValues({ ...defaultSliderValues, ...property.valuation.sliderValues });
              }
            }
          }
        } catch (error) {
          console.error('Error loading property:', error);
        }
      };
      loadProperty();
    }
  }, [initialPropertyId]);

  const value: PropertyValuationContextType = {
    propertyDetails,
    setPropertyDetails,
    updatePropertyDetail,
    selectedFeatures,
    setSelectedFeatures,
    toggleFeature,
    clearFeatures,
    customFeatures,
    addCustomFeature,
    removeCustomFeature,
    setCustomFeatures,
    sliderValues,
    setSliderValue,
    setSliderValues,
    getMaxSliderValue,
    valuation,
    activeTab,
    setActiveTab,
    canProceedToTab2,
    canProceedToTab3,
    loadSavedValuation,
    initialPropertyId,
    resetAll,
  };

  return (
    <PropertyValuationContext.Provider value={value}>
      {children}
    </PropertyValuationContext.Provider>
  );
}

export function usePropertyValuation() {
  const context = useContext(PropertyValuationContext);
  if (context === undefined) {
    throw new Error('usePropertyValuation must be used within a PropertyValuationProvider');
  }
  return context;
}
