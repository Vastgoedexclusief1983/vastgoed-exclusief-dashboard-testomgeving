import { PropertyTable } from '@/components/properties/PropertyTable';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import dbConnect from '@/lib/db/mongodb';
import Property from '@/lib/db/models/Property';
import User from '@/lib/db/models/User';
import { Badge } from '@/components/ui/badge';
import { PROPERTY_TYPES, PROVINCES } from '@/types/property';
import { getTranslations } from 'next-intl/server';

interface FilterParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  propertyType?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
}

async function getProperties(params: FilterParams) {
  await dbConnect();

  const { page, limit, search, status = 'active', propertyType, province, minPrice, maxPrice } = params;
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (status === 'active') {
    filter.$or = [{ isDeleted: false }, { isDeleted: { $exists: false } }, { isDeleted: null }];
  } else if (status === 'deleted') {
    filter.isDeleted = true;
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    const searchConditions = [
      { propertyCode: searchRegex },
      { 'basicInfo.address': searchRegex },
      { 'basicInfo.city': searchRegex },
      { 'basicInfo.postalCode': searchRegex },
    ];

    if (filter.$or) {
      filter.$and = [
        { $or: filter.$or },
        { $or: searchConditions }
      ];
      delete filter.$or;
    } else {
      filter.$or = searchConditions;
    }
  }

  if (propertyType && propertyType !== 'all') {
    filter['basicInfo.propertyType'] = propertyType;
  }

  if (province && province !== 'all') {
    filter['basicInfo.province'] = province;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter['basicInfo.basePrice'] = {};
    if (minPrice !== undefined) {
      filter['basicInfo.basePrice'].$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      filter['basicInfo.basePrice'].$lte = maxPrice;
    }
  }

  const totalProperties = await Property.countDocuments(filter);
  const properties = await Property.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const agentIds = [...new Set(properties.map((p: any) => p.agentId))];
  const agents = await User.find({ _id: { $in: agentIds } })
    .select('firstName lastName email agentCode')
    .lean();

  const agentMap = new Map(agents.map((a: any) => [a._id.toString(), a]));

  const notDeletedMatch = { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }, { isDeleted: null }] };

  const propertyTypes = await Property.aggregate([
    { $match: notDeletedMatch },
    { $group: { _id: '$basicInfo.propertyType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ]);

  const totalValue = await Property.aggregate([
    { $match: notDeletedMatch },
    { $group: { _id: null, total: { $sum: '$basicInfo.basePrice' } } },
  ]);

  const uniqueCities = await Property.distinct('basicInfo.city', notDeletedMatch);

  const deletedCount = await Property.countDocuments({ isDeleted: true });
  const activeCount = await Property.countDocuments(notDeletedMatch);

  return {
    properties: properties.map((p: any) => {
      const serialized: any = {
        ...p,
        _id: p._id.toString(),
        agentId: p.agentId.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        deletedAt: p.deletedAt ? p.deletedAt.toISOString() : null,
        agent: agentMap.get(p.agentId.toString())
          ? {
              ...agentMap.get(p.agentId.toString()),
              _id: agentMap.get(p.agentId.toString())!._id.toString(),
            }
          : undefined,
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
      avgValue: activeCount > 0 ? (totalValue[0]?.total || 0) / activeCount : 0,
      topTypes: propertyTypes.map(p => ({ type: p._id, count: p.count })),
      cityCount: uniqueCities.length,
      deletedCount,
      activeCount,
    },
  };
}

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    propertyType?: string;
    province?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const status = (params.status || 'active') as 'active' | 'deleted' | 'all';
  const propertyType = params.propertyType || 'all';
  const province = params.province || 'all';
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  const { properties, totalProperties, totalPages, currentPage, stats } = await getProperties({
    page,
    limit: 10,
    search,
    status,
    propertyType,
    province,
    minPrice,
    maxPrice,
  });

  const t = await getTranslations('properties');
  const tCommon = await getTranslations('common');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('allProperties')}</h1>
          <p className="text-gray-500 mt-1">
            {t('manageProperties')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-50 text-green-700">
              {stats.activeCount} {tCommon('active')}
            </Badge>
            <Badge variant="secondary" className="bg-red-50 text-red-700">
              {stats.deletedCount} {tCommon('deleted')}
            </Badge>
          </div>
          {stats.topTypes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">{t('topTypes')}:</span>
              <div className="flex gap-2">
                {stats.topTypes.slice(0, 2).map((type, index) => (
                  <Badge key={index} variant="outline" className="text-gray-600">
                    {type.type} ({type.count})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <PropertyFilters
        currentSearch={search}
        currentStatus={status}
        currentPropertyType={propertyType}
        currentProvince={province}
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        propertyTypes={PROPERTY_TYPES as unknown as string[]}
        provinces={PROVINCES as unknown as string[]}
      />

      {/* Properties Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('propertyList')}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {totalProperties} {t('propertiesFound')}
                {status === 'deleted' && ` ${t('showingDeleted')}`}
                {status === 'all' && ` ${t('showingAll')}`}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <PropertyTable
            properties={properties}
            currentPage={currentPage}
            totalPages={totalPages}
            isAdmin={true}
          />
        </div>
      </div>
    </div>
  );
}
