'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
  Sparkles,
} from 'lucide-react';
import { IProperty, PropertyWithAgent } from '@/types/property';
import { PROPERTY_TYPE_LABELS } from '@/lib/utils/propertyTypeLabels';

interface PropertyCardProps {
  property: IProperty | PropertyWithAgent;
  showAgent?: boolean;
}

/**
 * Type-safe helper om woningtype te vertalen.
 * Ondersteunt zowel:
 * - property.basicInfo.propertyType (jouw Mongoose model)
 * - property.propertyType (sommige “flat” API resultaten)
 */
function getPropertyTypeLabelFromProperty(
  p: IProperty | PropertyWithAgent
): string {
  // Gebruik een veilige “unknown -> record” cast zodat TS niet breekt,
  // maar je runtime wel robuust blijft bij verschillende vormen.
  const anyP = p as unknown as Record<string, any>;

  const rawType: string | undefined =
    anyP?.basicInfo?.propertyType ?? anyP?.propertyType;

  if (!rawType) return '';

  // Key-safe indexing (voorkomt TS indexing errors)
  return (
    PROPERTY_TYPE_LABELS[rawType as keyof typeof PROPERTY_TYPE_LABELS] ??
    rawType
  );
}

export function PropertyCard({
  property,
  showAgent = false,
}: PropertyCardProps) {
  const router = useRouter();

  const anyP = property as unknown as Record<string, any>;

  // Robuuste getters (zodat het zowel werkt voor “flat” als “nested” data)
  const address: string =
    anyP?.basicInfo?.address ?? anyP?.address ?? '';

  const city: string =
    anyP?.basicInfo?.city ?? anyP?.city ?? '';

  const price: number =
    anyP?.basicInfo?.basePrice ?? anyP?.price ?? 0;

  const livingArea: number =
    anyP?.dimensions?.livingArea ?? anyP?.livingArea ?? 0;

  // In jouw schema heet dit vaak lotSize (perceel)
  const plotArea: number =
    anyP?.dimensions?.lotSize ?? anyP?.plotArea ?? anyP?.lotSize ?? 0;

  const bedrooms: number =
    anyP?.dimensions?.bedrooms ?? anyP?.bedrooms ?? 0;

  const bathrooms: number =
    anyP?.dimensions?.bathrooms ?? anyP?.bathrooms ?? 0;

  const luxuryTags: string[] =
    anyP?.luxuryTags ?? anyP?.matchedTags ?? [];

  const matchScore: number | undefined =
    anyP?.matchScore;

  const agent = 'agent' in property ? (property as any).agent : undefined;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);

  const propertyTypeLabel = getPropertyTypeLabelFromProperty(property);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/properties/${anyP?._id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold">
            {propertyTypeLabel}
          </CardTitle>

          {typeof matchScore === 'number' && (
            <Badge
              variant="secondary"
              className={
                matchScore >= 8
                  ? 'bg-blue-100 text-blue-700'
                  : matchScore >= 6
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-red-100 text-red-700'
              }
            >
              Match {matchScore}/10
            </Badge>
          )}
        </div>

        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>
            {address}
            {city ? ` • ${city}` : ''}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xl font-bold">{formatPrice(price)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Maximize className="h-4 w-4 text-muted-foreground" />
            <span>Woonopp. {livingArea} m²</span>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>Perceel {plotArea} m²</span>
          </div>

          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span>Slaapkamers {bedrooms}</span>
          </div>

          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span>Badkamers {bathrooms}</span>
          </div>
        </div>

        {Array.isArray(luxuryTags) && luxuryTags.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Luxe-tags</p>
            <div className="flex flex-wrap gap-1">
              {luxuryTags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {showAgent && agent && (
        <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Car className="h-3 w-3" />
            {agent?.name ?? 'Makelaar'}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
