'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
  Search,
  Building2,
  MapPin,
  Loader2,
  X,
  BedDouble,
  Bath,
  ChevronDown,
  ChevronUp,
  Check,
  List,
} from 'lucide-react';
import { PropertyDetails, PropertyType, EnergyLabel, LocationType } from '@/types/property-valuation';

interface SearchResult {
  _id: string;
  propertyCode: string | null;
  title: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  plotSize?: number;
  yearBuilt?: number;
  energyLabel?: string;
  location?: string;
}

interface PropertySearchProps {
  onSelectProperty: (property: Partial<PropertyDetails>) => void;
  initialPropertyId?: string;
}

export function PropertySearch({ onSelectProperty, initialPropertyId }: PropertySearchProps) {
  const [query, setQuery] = useState('');
  const [allProperties, setAllProperties] = useState<SearchResult[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<SearchResult | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const t = useTranslations('valuation.propertySearch');

  // Fetch all properties on mount
  useEffect(() => {
    fetchAllProperties();
  }, []);

  // Auto-select property when initialPropertyId is provided and properties are loaded
  useEffect(() => {
    if (initialPropertyId && allProperties.length > 0 && !initialLoaded) {
      const property = allProperties.find(p => p._id === initialPropertyId);
      if (property) {
        setSelectedProperty(property);
        setInitialLoaded(true);
      }
    }
  }, [initialPropertyId, allProperties, initialLoaded]);

  // Filter properties based on search query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredProperties(allProperties);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = allProperties.filter(
        (p) =>
          (p.propertyCode && p.propertyCode.toLowerCase().includes(lowerQuery)) ||
          (p.title && p.title.toLowerCase().includes(lowerQuery)) ||
          (p.address && p.address.toLowerCase().includes(lowerQuery)) ||
          (p.city && p.city.toLowerCase().includes(lowerQuery)) ||
          (p.province && p.province.toLowerCase().includes(lowerQuery)) ||
          (p.postalCode && p.postalCode.toLowerCase().includes(lowerQuery))
      );
      setFilteredProperties(filtered);
    }
  }, [query, allProperties]);

  const fetchAllProperties = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/properties/search?limit=100');
      if (response.ok) {
        const data = await response.json();
        setAllProperties(data);
        setFilteredProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapPropertyType = (type: string): PropertyType => {
    const typeMap: Record<string, PropertyType> = {
      'penthouse': 'Apartment',
      'villa': 'Villa',
      'detached': 'House',
      'apartment': 'Apartment',
      'flat': 'Apartment',
      'condo': 'Condo',
      'country': 'House',
      'country house': 'House',
      'semi-detached': 'Townhouse',
      'semi': 'Townhouse',
      'townhouse': 'Townhouse',
      'house': 'House',
    };
    const lowerType = (type || '').toLowerCase();
    return typeMap[lowerType] || 'House';
  };

  const mapEnergyLabel = (label: string): EnergyLabel => {
    const validLabels: EnergyLabel[] = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Niet bekend'];
    const cleanLabel = (label || '').trim();
    return validLabels.includes(cleanLabel as EnergyLabel) ? (cleanLabel as EnergyLabel) : 'Niet bekend';
  };

  const handleSelectProperty = (property: SearchResult) => {
    setSelectedProperty(property);
    setShowList(false);
    setQuery('');

    const mappedProperty: Partial<PropertyDetails> & { _id?: string } = {
      propertyId: property._id,
      propertyCode: property.propertyCode || '',
      address: property.address || '',
      postalCode: property.postalCode || '',
      cityTown: property.city || '',
      province: property.province || '',
      propertyType: mapPropertyType(property.propertyType),
      baseAskingPrice: property.price || 0,
      energyLabel: mapEnergyLabel(property.energyLabel || ''),
      location: 'Quiet neighborhood' as LocationType,
      yearBuilt: property.yearBuilt || new Date().getFullYear(),
      livingArea: property.size || 0,
      plotArea: property.plotSize || 0,
      numberOfBedrooms: property.bedrooms || 1,
      numberOfBathrooms: property.bathrooms || 1,
      parkingSpaces: false,
    };

    onSelectProperty(mappedProperty);
  };

  const clearSelection = () => {
    setSelectedProperty(null);
    setQuery('');
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return '€0';
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Selected Property Display */}
      {selectedProperty ? (
        <Card className="p-4 border-2 border-green-200 bg-green-50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{selectedProperty.title || t('selectedProperty')}</h4>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {selectedProperty.address || 'No address'}, {selectedProperty.city || 'Unknown'}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {selectedProperty.propertyType || 'Property'}
                  </Badge>
                  <span className="text-sm font-medium text-green-700">
                    {formatCurrency(selectedProperty.price)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-green-600 mt-3">
            {t('propertyDataLoaded')}
          </p>
        </Card>
      ) : (
        <>
          {/* Toggle Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowList(!showList)}
            className="w-full justify-between border-2 border-dashed border-[#102c54]/30 hover:border-[#102c54] hover:bg-[#102c54]/5 hover:text-[#102c54]"
          >
            <span className="flex items-center gap-2">
              <List className="h-4 w-4" />
              {showList ? t('hidePropertyList') : t('selectFromExisting')}
              {allProperties.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {allProperties.length} {t('properties')}
                </Badge>
              )}
            </span>
            {showList ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {/* Property List */}
          {showList && (
            <Card className="border-2 border-[#102c54]/20 overflow-hidden">
              {/* Search within list */}
              <div className="p-4 border-b bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('filterPlaceholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t('showing', { count: filteredProperties.length, total: allProperties.length })}
                </p>
              </div>

              {/* Property List */}
              <div className="max-h-96 overflow-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#102c54]" />
                    <p className="text-sm text-gray-500 mt-2">{t('loadingProperties')}</p>
                  </div>
                ) : filteredProperties.length > 0 ? (
                  <div className="divide-y">
                    {filteredProperties.map((property) => (
                      <button
                        key={property._id}
                        type="button"
                        onClick={() => handleSelectProperty(property)}
                        className="w-full px-4 py-4 text-left hover:bg-[#102c54]/5 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[#102c54]/10 transition-colors">
                            <Building2 className="h-4 w-4 text-gray-500 group-hover:text-[#102c54]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 truncate group-hover:text-[#102c54]">
                                {property.title || 'Unnamed Property'}
                              </h4>
                              {property.propertyCode && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  {property.propertyCode}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {property.address || 'No address'}, {property.city || 'Unknown'}
                              </span>
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {property.propertyType || 'Property'}
                              </Badge>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <BedDouble className="h-3 w-3" />
                                {property.bedrooms || 0} {t('beds')}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Bath className="h-3 w-3" />
                                {property.bathrooms || 0} {t('baths')}
                              </span>
                              <span className="text-xs text-gray-500">
                                {property.size || 0} m²
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4 shrink-0">
                          <div className="font-bold text-[#102c54] text-lg">
                            {formatCurrency(property.price)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {t('clickToSelect')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="font-medium">{t('noPropertiesFound')}</p>
                    {query && (
                      <p className="text-sm mt-1">
                        {t('tryDifferentSearch')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {!showList && (
            <p className="text-xs text-gray-500 text-center">
              {t('orEnterManually')}
            </p>
          )}
        </>
      )}
    </div>
  );
}
