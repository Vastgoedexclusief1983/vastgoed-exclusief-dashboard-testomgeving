import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PropertyTable } from '@/components/properties/PropertyTable';
import { AgentPropertySearch } from '@/components/properties/AgentPropertySearch';
import { Plus, Building2 } from 'lucide-react';
import { requireAuth } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongodb';
import Property from '@/lib/db/models/Property';
import { getTranslations } from 'next-intl/server';

async function getProperties(agentId: string, page: number = 1, limit: number = 10, search: string = '') {
  await dbConnect();

  const skip = (page - 1) * limit;

  const filter: any = { agentId };

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { propertyCode: searchRegex },
      { 'basicInfo.address': searchRegex },
      { 'basicInfo.city': searchRegex },
      { 'basicInfo.postalCode': searchRegex },
    ];
  }

  const totalProperties = await Property.countDocuments(filter);
  const properties = await Property.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Get stats
  const propertyTypes = await Property.aggregate([
    { $match: { agentId } },
    { $group: { _id: '$basicInfo.propertyType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ]);

  const totalValue = await Property.aggregate([
    { $match: { agentId } },
    { $group: { _id: null, total: { $sum: '$basicInfo.basePrice' } } },
  ]);

  const uniqueCities = await Property.distinct('basicInfo.city', { agentId });

  return {
    properties: properties.map((p: any) => {
      const serialized = {
        ...p,
        _id: p._id.toString(),
        agentId: p.agentId.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };

      // Serialize valuation if it exists
      if (serialized.valuation) {
        serialized.valuation = {
          ...serialized.valuation,
          valuatedAt: serialized.valuation.valuatedAt
            ? serialized.valuation.valuatedAt.toISOString?.() || serialized.valuation.valuatedAt
            : undefined,
          // Remove _id from customFeatures subdocuments
          customFeatures: serialized.valuation.customFeatures?.map((cf: any) => ({
            name: cf.name,
            room: cf.room,
            weight: cf.weight,
          })) || [],
        };
      }

      return serialized;
    }),
    totalProperties,
    totalPages: Math.ceil(totalProperties / limit),
    currentPage: page,
    stats: {
      totalValue: totalValue[0]?.total || 0,
      avgValue: totalProperties > 0 ? (totalValue[0]?.total || 0) / totalProperties : 0,
      topTypes: propertyTypes.map(p => ({ type: p._id, count: p.count })),
      cityCount: uniqueCities.length,
    },
  };
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const { properties, totalProperties, totalPages, currentPage, stats } = await getProperties(user.id, page, 10, search);
  const t = await getTranslations('properties');
  const tAgent = await getTranslations('agentDashboard');
  const tCommon = await getTranslations('common');

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('myProperties')}</h1>
          <p className="text-gray-500 mt-1">
            {tAgent('subtitle')}
          </p>
        </div>
        <Link href="/properties/new">
          <Button className="gap-2 bg-brand-700 hover:bg-brand-800">
            <Plus className="h-4 w-4" />
            {tAgent('addProperty')}
          </Button>
        </Link>
      </div>

      {totalProperties === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <Building2 className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{tAgent('noPropertiesYet')}</h3>
            <p className="mb-6 mt-2 text-sm text-gray-500">
              {t('manageProperties')}
            </p>
            <Link href="/properties/new">
              <Button className="gap-2 bg-brand-700 hover:bg-brand-800">
                <Plus className="h-4 w-4" />
                {tAgent('addFirstProperty')}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Properties Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('propertyList')}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {totalProperties} {totalProperties === 1 ? tCommon('property') : tCommon('properties')} {t('propertiesFound').replace('gevonden', '').trim()}
                  </p>
                </div>
                <AgentPropertySearch placeholder={t('searchPlaceholder')} currentSearch={search} />
              </div>
            </div>
            <div className="p-6">
              <PropertyTable properties={properties} currentPage={currentPage} totalPages={totalPages} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
