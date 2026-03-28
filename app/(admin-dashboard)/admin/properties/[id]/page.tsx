import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireAuth } from '@/lib/auth/session';
import { canViewAllProperties } from '@/lib/auth/permissions';
import dbConnect from '@/lib/db/mongodb';
import Property from '@/lib/db/models/Property';
import User from '@/lib/db/models/User';
import { ArrowLeft, MapPin, Calendar, Bed, Bath, Maximize, Home, Zap, Edit, User as UserIcon, TrendingUp, Calculator, Clock, CheckCircle2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getFeatureById } from '@/lib/property-features';

async function getProperty(id: string) {
  await dbConnect();
  const property = await Property.findById(id).lean();

  if (!property) {
    return null;
  }

  const agent = await User.findById(property.agentId)
    .select('firstName lastName email agentCode')
    .lean();

  return {
    ...property,
    _id: property._id.toString(),
    agentId: property.agentId.toString(),
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    valuation: property.valuation ? {
      ...property.valuation,
      valuatedAt: property.valuation.valuatedAt ? property.valuation.valuatedAt.toISOString() : undefined,
      customFeatures: property.valuation.customFeatures?.map((cf: any) => ({
        name: cf.name,
        room: cf.room,
        weight: cf.weight,
      })) || [],
    } : undefined,
    agent: agent ? {
      ...agent,
      _id: agent._id.toString(),
    } : null,
  };
}

export default async function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();

  if (!canViewAllProperties(user.role)) {
    notFound();
  }

  const { id } = await params;
  const property = await getProperty(id);
  const t = await getTranslations('properties');
  const tLuxury = await getTranslations('luxuryFeatures');
  const tForm = await getTranslations('propertyForm');
  const tAgents = await getTranslations('agents');
  const tValuation = await getTranslations('valuation');

  if (!property) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/properties">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{property.basicInfo.address}</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{property.basicInfo.city}, {property.basicInfo.province}</span>
            </div>
          </div>
        </div>
        <Link href={`/admin/properties/${property._id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            {t('editProperty')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('price')}</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(property.basicInfo.basePrice)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('propertyType')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.basicInfo.propertyType}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('energyLabel')}</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.basicInfo.energyLabel}</div>
          </CardContent>
        </Card>

        {property.agent && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{tAgents('agent')}</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{property.agent.firstName} {property.agent.lastName}</div>
              <p className="text-xs text-muted-foreground mt-1">{property.agent.agentCode}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{tForm('basicInformation')}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-500">Address</label>
            <p className="text-gray-900 mt-1">{property.basicInfo.address}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Postal Code</label>
            <p className="text-gray-900 mt-1">{property.basicInfo.postalCode}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">City</label>
            <p className="text-gray-900 mt-1">{property.basicInfo.city}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Province</label>
            <p className="text-gray-900 mt-1">{property.basicInfo.province}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Construction Year</label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <p className="text-gray-900">{property.basicInfo.constructionYear}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Location/Surroundings</label>
            <p className="text-gray-900 mt-1">{property.basicInfo.location}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Dimensions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Living Area</label>
            <div className="flex items-center gap-2 mt-1">
              <Maximize className="h-4 w-4 text-gray-500" />
              <p className="text-gray-900 font-semibold">{property.dimensions.livingArea} m²</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Lot Size</label>
            <div className="flex items-center gap-2 mt-1">
              <Maximize className="h-4 w-4 text-gray-500" />
              <p className="text-gray-900 font-semibold">{property.dimensions.lotSize} m²</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Bedrooms</label>
            <div className="flex items-center gap-2 mt-1">
              <Bed className="h-4 w-4 text-gray-500" />
              <p className="text-gray-900 font-semibold">{property.dimensions.bedrooms}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Bathrooms</label>
            <div className="flex items-center gap-2 mt-1">
              <Bath className="h-4 w-4 text-gray-500" />
              <p className="text-gray-900 font-semibold">{property.dimensions.bathrooms}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Valuation Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{tValuation('savedValuation')}</h2>
          <a href={`/admin/property-valuation?propertyId=${property._id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Calculator className="h-4 w-4" />
              {property.valuation?.finalPrice ? tValuation('editValuation') : tValuation('createValuation')}
            </Button>
          </a>
        </div>

        {property.valuation?.finalPrice ? (
          <div className="space-y-6">
            {/* Valuation Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Home className="h-4 w-4" />
                  {tValuation('basePrice')}
                </div>
                <p className="text-xl font-bold text-gray-900">{formatPrice(property.basicInfo.basePrice)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  {tValuation('addedValue')}
                </div>
                <p className="text-xl font-bold text-green-700">
                  +{formatPrice(property.valuation.addedValue || 0)}
                  <span className="text-sm font-normal ml-2">
                    (+{(property.valuation.addedValuePercent || 0).toFixed(1)}%)
                  </span>
                </p>
              </div>
              <div className="bg-brand-50 rounded-lg p-4 border-2 border-brand-200">
                <div className="flex items-center gap-2 text-sm text-brand-600 mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  {tValuation('finalValuation')}
                </div>
                <p className="text-xl font-bold text-brand-700">{formatPrice(property.valuation.finalPrice)}</p>
              </div>
            </div>

            {/* Selected Features */}
            {property.valuation.selectedFeatures && property.valuation.selectedFeatures.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">{tValuation('selectedFeatures')}</h3>
                <div className="flex flex-wrap gap-2">
                  {property.valuation.selectedFeatures
                    .filter((featureId: string) => !featureId.startsWith('custom-'))
                    .map((featureId: string) => {
                      const feature = getFeatureById(featureId);
                      return (
                        <Badge key={featureId} variant="secondary" className="bg-brand-50 text-brand-700">
                          {feature?.name || featureId}
                        </Badge>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Custom Features */}
            {property.valuation.customFeatures && property.valuation.customFeatures.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Custom Features</h3>
                <div className="flex flex-wrap gap-2">
                  {property.valuation.customFeatures.map((cf: any, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700">
                      {cf.name} ({cf.room})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Valuated Date */}
            {property.valuation.valuatedAt && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    {tValuation('valuatedOn')}: {new Date(property.valuation.valuatedAt).toLocaleDateString('nl-NL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">{tValuation('noValuation')}</p>
            <a href={`/admin/property-valuation?propertyId=${property._id}`}>
              <Button className="gap-2 bg-brand-700 hover:bg-brand-800">
                <Calculator className="h-4 w-4" />
                {tValuation('createValuation')}
              </Button>
            </a>
          </div>
        )}
      </div>

      {property.luxuryFeatures && (property.luxuryFeatures.parking?.available || (property.luxuryFeatures.amenities && property.luxuryFeatures.amenities.length > 0)) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{tLuxury('title')}</h2>

          {property.luxuryFeatures.parking?.available && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">{tLuxury('parking')}</h3>
              <div className="flex gap-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  {property.luxuryFeatures.parking.spaces} {tLuxury('parkingSpaces')}
                </Badge>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {property.luxuryFeatures.parking.type}
                </Badge>
              </div>
            </div>
          )}

          {property.luxuryFeatures.amenities && property.luxuryFeatures.amenities.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{tLuxury('amenities')}</h3>
              <div className="flex flex-wrap gap-2">
                {property.luxuryFeatures.amenities.map((amenity: string) => (
                  <Badge key={amenity} variant="secondary" className="bg-gray-50 text-gray-700">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
