'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createPropertySchema, CreatePropertyInput } from '@/lib/validations/property';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  SerializedProperty,
  PROPERTY_TYPES,
  ENERGY_LABELS,
  PROVINCES,
  AMENITIES,
  PARKING_TYPES,
} from '@/types/property';
import { useTranslations } from 'next-intl';
import { PROPERTY_TYPE_LABELS } from '@/lib/utils/propertyTypeLabels';

interface PropertyFormProps {
  property?: SerializedProperty;
  mode: 'create' | 'edit';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Bestand kon niet worden gelezen.'));
      }
    };

    reader.onerror = () => reject(new Error('Bestand kon niet worden gelezen.'));
    reader.readAsDataURL(file);
  });
}

export function PropertyForm({ property, mode }: PropertyFormProps) {
  const router = useRouter();
  const t = useTranslations('propertyForm');
  const tCommon = useTranslations('common');

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState<string>(
    property?.images?.find((img) => img.isPrimary)?.url ||
      property?.images?.[0]?.url ||
      ''
  );

  const form = useForm<CreatePropertyInput>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      createdAt: property?.createdAt || new Date().toISOString().split('T')[0],
      address: property?.basicInfo.address || '',
      postalCode: property?.basicInfo.postalCode || '',
      city: property?.basicInfo.city || '',
      province: property?.basicInfo.province,
      propertyType: property?.basicInfo.propertyType,
      constructionYear:
        property?.basicInfo.constructionYear || new Date().getFullYear(),
      basePrice: property?.basicInfo.basePrice || 0,
      energyLabel: property?.basicInfo.energyLabel,
      location: property?.basicInfo.location || '',
      livingArea: property?.dimensions.livingArea || 0,
      lotSize: property?.dimensions.lotSize || 0,
      bedrooms: property?.dimensions.bedrooms || 0,
      bathrooms: property?.dimensions.bathrooms || 0,
      luxuryFeatures: {
        amenities: property?.luxuryFeatures?.amenities || [],
        parking: {
          available: property?.luxuryFeatures?.parking?.available ?? false,
          spaces: property?.luxuryFeatures?.parking?.spaces ?? 0,
          type: property?.luxuryFeatures?.parking?.type,
        },
      },
      images: property?.images || [],
    },
  });

  async function handleMainImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecteer een geldig afbeeldingsbestand.');
      return;
    }

    try {
      setIsUploadingImage(true);

      const base64 = await fileToBase64(file);

      const response = await fetch('/api/upload/property-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64 }),
      });

      const result = await response.json();

      if (!response.ok || !result?.url) {
        toast.error(result?.error || 'Upload mislukt.');
        return;
      }

      const uploadedImage = {
        url: result.url as string,
        alt: form.getValues('address') || 'Hoofdfoto woning',
        isPrimary: true,
      };

      setMainImageUrl(result.url);

      form.setValue('images', [uploadedImage], {
        shouldValidate: true,
        shouldDirty: true,
      });

      toast.success('Hoofdfoto succesvol geüpload.');
    } catch (error) {
      toast.error('Upload mislukt.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  }

  async function onSubmit(data: CreatePropertyInput) {
    setIsLoading(true);

    try {
      const payload: CreatePropertyInput = {
        ...data,
        images: mainImageUrl
          ? [
              {
                url: mainImageUrl,
                alt: data.address || 'Hoofdfoto woning',
                isPrimary: true,
              },
            ]
          : [],
      };

      const url =
        mode === 'create' ? '/api/properties' : `/api/properties/${property?._id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || tCommon('error'));
        setIsLoading(false);
        return;
      }

      toast.success(
        mode === 'create' ? t('propertyCreated') : t('propertyUpdated')
      );
      router.push('/properties');
      router.refresh();
      setIsLoading(false);
    } catch (error) {
      toast.error(tCommon('error'));
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h3 className="mb-4 text-lg font-medium">Hoofdfoto woning</h3>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-2">
              <FormLabel>Upload hoofdfoto</FormLabel>
              <FormDescription>
                Upload hier de hoofdafbeelding van de woning. Deze foto wordt
                gebruikt op de woningkaart en in website beheer.
              </FormDescription>
            </div>

            <Input
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              disabled={isLoading || isUploadingImage}
            />

            {isUploadingImage ? (
              <p className="text-sm text-muted-foreground">
                Afbeelding wordt geüpload...
              </p>
            ) : null}

            {mainImageUrl ? (
              <div className="overflow-hidden rounded-lg border">
                <div className="relative h-64 w-full bg-muted">
                  <Image
                    src={mainImageUrl}
                    alt="Hoofdfoto woning"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Nog geen hoofdfoto geselecteerd.
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">{t('basicInformation')}</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aanmaakdatum</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('address')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('addressPlaceholder')}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('postalCode')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234 AB"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('city')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('cityPlaceholder')}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('province')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectProvince')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROVINCES.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('propertyType')}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectType')} />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {PROPERTY_TYPE_LABELS[
                            type as keyof typeof PROPERTY_TYPE_LABELS
                          ] ?? type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="constructionYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('constructionYear')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2020"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('basePrice')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="350000"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="energyLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('energyLabel')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectEnergyLabel')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENERGY_LABELS.map((label) => (
                        <SelectItem key={label} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('locationSurroundings')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('locationPlaceholder')}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">{t('dimensions')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="livingArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('livingArea')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="120"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lotSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lotSize')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="250"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('bedrooms')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="3"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('bathrooms')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">{t('additionalFeatures')}</h3>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="luxuryFeatures.amenities"
              render={() => (
                <FormItem>
                  <FormLabel>{t('amenities')}</FormLabel>
                  <FormDescription>{t('selectAmenities')}</FormDescription>
                  <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3">
                    {AMENITIES.map((amenity) => (
                      <FormField
                        key={amenity}
                        control={form.control}
                        name="luxuryFeatures.amenities"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(amenity)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  const updated = checked
                                    ? [...current, amenity]
                                    : current.filter((val) => val !== amenity);
                                  field.onChange(updated);
                                }}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer font-normal">
                              {amenity}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-medium">{t('parking.title')}</h4>

              <FormField
                control={form.control}
                name="luxuryFeatures.parking.available"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">
                      {t('parking.available')}
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('luxuryFeatures.parking.available') && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="luxuryFeatures.parking.spaces"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('parking.spaces')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            disabled={isLoading}
                            value={field.value || 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="luxuryFeatures.parking.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('parking.type')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PARKING_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading || isUploadingImage}>
            {isLoading
              ? mode === 'create'
                ? t('creating')
                : t('updating')
              : mode === 'create'
              ? t('createProperty')
              : t('updateProperty')}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/properties')}
            disabled={isLoading || isUploadingImage}
          >
            {tCommon('cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
