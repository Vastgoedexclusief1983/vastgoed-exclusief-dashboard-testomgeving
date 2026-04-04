'use client';

import { getLocationTypeLabel } from '@/lib/utils/locationTypeLabels';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePropertyValuation } from './PropertyValuationContext';
import { PropertySearch } from './PropertySearch';
import {
  propertyDetailsSchema,
  PropertyDetailsFormData,
} from '@/lib/validations/property-valuation';
import {
  PROPERTY_TYPES,
  ENERGY_LABELS,
  LOCATION_TYPES,
  PropertyDetails,
} from '@/types/property-valuation';
import { getPropertyTypeLabel } from '@/lib/utils/propertyTypeLabels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import {
  Building2,
  MapPin,
  Euro,
  Zap,
  Calendar,
  Maximize,
  BedDouble,
  Bath,
  Car,
  ArrowRight,
  Search,
} from 'lucide-react';

export function BasicDetailsForm() {
  const {
    propertyDetails,
    setPropertyDetails,
    setActiveTab,
    loadSavedValuation,
    initialPropertyId,
  } = usePropertyValuation();

  const t = useTranslations('valuation.basicDetails');
  const tSearch = useTranslations('valuation.propertySearch');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PropertyDetailsFormData>({
    resolver: zodResolver(propertyDetailsSchema),
    defaultValues: propertyDetails,
    mode: 'onChange',
    shouldFocusError: false,
  });

  useEffect(() => {
    if (propertyDetails.propertyId) {
      reset(propertyDetails);
    }
  }, [propertyDetails, reset]);

  const onSubmit = (data: PropertyDetailsFormData) => {
    setPropertyDetails(data as PropertyDetails);
    setActiveTab(1);
  };

  const handleProceed = () => {
    const formData = watch();
    if (
      formData.propertyId &&
      formData.baseAskingPrice &&
      formData.baseAskingPrice > 0
    ) {
      setPropertyDetails(formData as PropertyDetails);
      setActiveTab(1);
    }
  };

  const handleSelectChange = (
    field: keyof PropertyDetailsFormData,
    value: string
  ) => {
    setValue(field, value, { shouldValidate: true });
  };

  const handlePropertySelect = async (property: Partial<PropertyDetails>) => {
    if (property.propertyId)
      setValue('propertyId', property.propertyId, { shouldValidate: true });
    if (property.propertyCode !== undefined)
      setValue('propertyCode', property.propertyCode, { shouldValidate: true });
    if (property.address)
      setValue('address', property.address, { shouldValidate: true });
    if (property.postalCode)
      setValue('postalCode', property.postalCode, { shouldValidate: true });
    if (property.cityTown)
      setValue('cityTown', property.cityTown, { shouldValidate: true });
    if (property.province)
      setValue('province', property.province, { shouldValidate: true });
    if (property.propertyType)
      setValue('propertyType', property.propertyType, { shouldValidate: true });
    if (property.baseAskingPrice)
      setValue('baseAskingPrice', property.baseAskingPrice, {
        shouldValidate: true,
      });
    if (property.energyLabel)
      setValue('energyLabel', property.energyLabel, { shouldValidate: true });
    if (property.location)
      setValue('location', property.location, { shouldValidate: true });
    if (property.yearBuilt)
      setValue('yearBuilt', property.yearBuilt, { shouldValidate: true });
    if (property.livingArea)
      setValue('livingArea', property.livingArea, { shouldValidate: true });
    if (property.plotArea !== undefined)
      setValue('plotArea', property.plotArea, { shouldValidate: true });
    if (property.numberOfBedrooms)
      setValue('numberOfBedrooms', property.numberOfBedrooms, {
        shouldValidate: true,
      });
    if (property.numberOfBathrooms)
      setValue('numberOfBathrooms', property.numberOfBathrooms, {
        shouldValidate: true,
      });
    if (property.parkingSpaces !== undefined)
      setValue('parkingSpaces', property.parkingSpaces, {
        shouldValidate: true,
      });

    if (property.propertyId) {
      await loadSavedValuation(property.propertyId);
    }
  };

  const watchedParkingSpaces = watch('parkingSpaces');
  const watchedPropertyType = watch('propertyType');
  const watchedEnergyLabel = watch('energyLabel');
  const watchedLocation = watch('location');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-l-4 border-l-[#FF0000]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-[#102c54]">
            <Search className="h-5 w-5" />
            {tSearch('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PropertySearch
            onSelectProperty={handlePropertySelect}
            initialPropertyId={initialPropertyId}
          />
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[#102c54]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-[#102c54]">
            <Building2 className="h-5 w-5" />
            {t('propertyIdentification')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="propertyId">{t('propertyId')} *</Label>
            <Input
              id="propertyId"
              placeholder={t('propertyIdPlaceholder')}
              {...register('propertyId')}
              className={errors.propertyId ? 'border-red-500' : ''}
            />
            {errors.propertyId && (
              <p className="text-sm text-red-500">
                {errors.propertyId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyType">{t('propertyType')}</Label>
            <Select
              value={watchedPropertyType}
              onValueChange={(value) =>
                handleSelectChange('propertyType', value)
              }
            >
              <SelectTrigger
                className={errors.propertyType ? 'border-red-500' : ''}
              >
                <SelectValue placeholder={t('selectPropertyType')} />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getPropertyTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyType && (
              <p className="text-sm text-red-500">
                {errors.propertyType.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[#102c54]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-[#102c54]">
            <MapPin className="h-5 w-5" />
            {t('locationDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">{t('address')}</Label>
            <Input
              id="address"
              placeholder={t('addressPlaceholder')}
              {...register('address')}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">{t('postalCode')}</Label>
            <Input
              id="postalCode"
              placeholder={t('postalCodePlaceholder')}
              {...register('postalCode')}
              className={errors.postalCode ? 'border-red-500' : ''}
            />
            {errors.postalCode && (
              <p className="text-sm text-red-500">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cityTown">{t('cityTown')}</Label>
            <Input
              id="cityTown"
              placeholder={t('cityPlaceholder')}
              {...register('cityTown')}
              className={errors.cityTown ? 'border-red-500' : ''}
            />
            {errors.cityTown && (
              <p className="text-sm text-red-500">{errors.cityTown.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">{t('province')}</Label>
            <Input
              id="province"
              placeholder={t('provincePlaceholder')}
              {...register('province')}
              className={errors.province ? 'border-red-500' : ''}
            />
            {errors.province && (
              <p className="text-sm text-red-500">{errors.province.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('locationType')}</Label>
            <Select
              value={watchedLocation}
              onValueChange={(value) => handleSelectChange('location', value)}
            >
              <SelectTrigger
                className={errors.location ? 'border-red-500' : ''}
              >
                <SelectValue placeholder={t('selectLocationType')} />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[#102c54]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-[#102c54]">
            <Euro className="h-5 w-5" />
            {t('financialEnergy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="baseAskingPrice">{t('baseAskingPrice')} *</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="baseAskingPrice"
                type="number"
                placeholder="500000"
                className={`pl-10 ${
                  errors.baseAskingPrice ? 'border-red-500' : ''
                }`}
                {...register('baseAskingPrice', { valueAsNumber: true })}
              />
            </div>
            {errors.baseAskingPrice && (
              <p className="text-sm text-red-500">
                {errors.baseAskingPrice.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="energyLabel">{t('energyLabel')}</Label>
            <Select
              value={watchedEnergyLabel}
              onValueChange={(value) =>
                handleSelectChange('energyLabel', value)
              }
            >
              <SelectTrigger
                className={errors.energyLabel ? 'border-red-500' : ''}
              >
                <SelectValue placeholder={t('selectEnergyLabel')} />
              </SelectTrigger>
              <SelectContent>
                {ENERGY_LABELS.map((label) => (
                  <SelectItem key={label} value={label}>
                    <div className="flex items-center gap-2">
                      <Zap
                        className={`h-4 w-4 ${
                          label.startsWith('A')
                            ? 'text-green-500'
                            : label === 'B' || label === 'C'
                            ? 'text-yellow-500'
                            : label === 'Niet bekend'
                            ? 'text-gray-400'
                            : 'text-red-500'
                        }`}
                      />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.energyLabel && (
              <p className="text-sm text-red-500">
                {errors.energyLabel.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearBuilt">{t('yearBuilt')}</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="yearBuilt"
                type="number"
                placeholder="2020"
                className={`pl-10 ${errors.yearBuilt ? 'border-red-500' : ''}`}
                {...register('yearBuilt', { valueAsNumber: true })}
              />
            </div>
            {errors.yearBuilt && (
              <p className="text-sm text-red-500">{errors.yearBuilt.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[#102c54]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-[#102c54]">
            <Maximize className="h-5 w-5" />
            {t('propertySpecs')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="livingArea">{t('livingArea')}</Label>
            <Input
              id="livingArea"
              type="number"
              placeholder="150"
              {...register('livingArea', { valueAsNumber: true })}
              className={errors.livingArea ? 'border-red-500' : ''}
            />
            {errors.livingArea && (
              <p className="text-sm text-red-500">
                {errors.livingArea.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plotArea">{t('plotArea')}</Label>
            <Input
              id="plotArea"
              type="number"
              placeholder="500"
              {...register('plotArea', { valueAsNumber: true })}
              className={errors.plotArea ? 'border-red-500' : ''}
            />
            {errors.plotArea && (
              <p className="text-sm text-red-500">{errors.plotArea.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfBedrooms">{t('bedrooms')}</Label>
            <div className="relative">
              <BedDouble className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="numberOfBedrooms"
                type="number"
                placeholder="3"
                className={`pl-10 ${
                  errors.numberOfBedrooms ? 'border-red-500' : ''
                }`}
                {...register('numberOfBedrooms', { valueAsNumber: true })}
              />
            </div>
            {errors.numberOfBedrooms && (
              <p className="text-sm text-red-500">
                {errors.numberOfBedrooms.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfBathrooms">{t('bathrooms')}</Label>
            <div className="relative">
              <Bath className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="numberOfBathrooms"
                type="number"
                placeholder="2"
                className={`pl-10 ${
                  errors.numberOfBathrooms ? 'border-red-500' : ''
                }`}
                {...register('numberOfBathrooms', { valueAsNumber: true })}
              />
            </div>
            {errors.numberOfBathrooms && (
              <p className="text-sm text-red-500">
                {errors.numberOfBathrooms.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-6">
            <Checkbox
              id="parkingSpaces"
              checked={watchedParkingSpaces}
              onCheckedChange={(checked) =>
                setValue('parkingSpaces', checked as boolean, {
                  shouldValidate: true,
                })
              }
            />
            <Label
              htmlFor="parkingSpaces"
              className="flex cursor-pointer items-center gap-2"
            >
              <Car className="h-4 w-4 text-gray-500" />
              {t('parkingSpaces')}
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleProceed}
          className="bg-[#102c54] px-8 py-3 text-lg text-white hover:bg-[#102c54]/90"
        >
          {t('continueToFeatures')}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
