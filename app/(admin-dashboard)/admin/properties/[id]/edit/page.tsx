import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { Badge } from '@/components/ui/badge';
import dbConnect from '@/lib/db/mongodb';
import Property from '@/lib/db/models/Property';
import { SerializedProperty } from '@/types/property';
import { getTranslations } from 'next-intl/server';

async function getProperty(id: string): Promise<SerializedProperty | null> {
  await dbConnect();
  const property = await Property.findById(id).lean();

  if (!property) {
    return null;
  }

  return {
    ...property,
    _id: property._id.toString(),
    agentId: property.agentId.toString(),
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    deletedAt: property.deletedAt ? property.deletedAt.toISOString() : null,
    valuation: property.valuation ? {
      ...property.valuation,
      valuatedAt: property.valuation.valuatedAt ? property.valuation.valuatedAt.toISOString() : undefined,
      customFeatures: property.valuation.customFeatures?.map((cf: any) => ({
        name: cf.name,
        room: cf.room,
        weight: cf.weight,
      })) || [],
    } : undefined,
  };
}

export default async function AdminEditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);
  const t = await getTranslations('properties');

  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('editProperty')}</h1>
          <p className="text-muted-foreground">{property.basicInfo.address}</p>
        </div>
        <Badge variant="secondary">{property.basicInfo.propertyType}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('propertyDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyForm property={property} mode="edit" />
        </CardContent>
      </Card>
    </div>
  );
}
