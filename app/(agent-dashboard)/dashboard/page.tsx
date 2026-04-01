import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { requireAuth } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongodb';
import Property from '@/lib/db/models/Property';
import {
  Building2,
  Home,
  TrendingUp,
  Clock,
  Plus,
  Eye,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';
import { getPropertyTypeLabel } from '@/lib/utils/propertyTypeLabels';
import { needsLegalAcceptance } from '@/lib/legal/versions';
import { LegalAcceptancePanel } from '@/components/legal/LegalAcceptancePanel';

type AgentStats = {
  totalProperties: number;
  propertyTypes: { type: string; count: number }[];
  recentProperties: number;
  totalValue: number;
  recentPropertiesList: {
    _id: string;
    address: string;
    city: string;
    propertyType: string;
    price: number;
    createdAt: string;
  }[];
};

async function getAgentStats(agentId: string): Promise<AgentStats> {
  await dbConnect();

  const totalProperties = await Property.countDocuments({ agentId });

  const propertyTypesAgg: Array<{ _id: string | null; count: number }> =
    await Property.aggregate([
      { $match: { agentId } },
      { $group: { _id: '$basicInfo.propertyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentProperties = await Property.countDocuments({
    agentId,
    createdAt: { $gte: thirtyDaysAgo },
  });

  const recentPropertiesList = await Property.find({ agentId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const totalValueAgg: Array<{ _id: null; total: number }> =
    await Property.aggregate([
      { $match: { agentId } },
      { $group: { _id: null, total: { $sum: '$basicInfo.basePrice' } } },
    ]);

  return {
    totalProperties,
    propertyTypes: propertyTypesAgg
      .filter((p) => !!p._id)
      .map((p) => ({ type: String(p._id), count: p.count })),
    recentProperties,
    totalValue: totalValueAgg[0]?.total || 0,
    recentPropertiesList: recentPropertiesList.map((p: any) => ({
      _id: p._id.toString(),
      address: p.basicInfo.address,
      city: p.basicInfo.city,
      propertyType: p.basicInfo.propertyType,
      price: p.basicInfo.basePrice,
      createdAt: p.createdAt.toISOString(),
    })),
  };
}

export default async function AgentDashboardPage() {
  const user = await requireAuth();
  const stats = await getAgentStats(user.id);
  const t = await getTranslations('agentDashboard');

  const showLegalAcceptance = needsLegalAcceptance(
    (user as any)?.legalAcceptance
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return t('daysAgo', { days: diffDays });
    if (diffDays < 30) {
      return t('weeksAgo', { weeks: Math.floor(diffDays / 7) });
    }
    return t('monthsAgo', { months: Math.floor(diffDays / 30) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-1 text-gray-500">{t('subtitle')}</p>
        </div>

        <Link href="/properties/new">
          <Button className="gap-2 bg-brand-700 hover:bg-brand-800">
            <Plus className="h-4 w-4" />
            {t('addProperty')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('totalProperties')}
          value={stats.totalProperties}
          icon={Building2}
          iconColor="blue"
          trend={
            <Link href="/properties">
              <p className="flex cursor-pointer items-center gap-1 text-xs text-blue-600 hover:underline">
                <Eye className="h-3 w-3" />
                {t('viewAllProperties')}
              </p>
            </Link>
          }
        />

        <StatsCard
          title={t('portfolioValue')}
          value={formatPrice(stats.totalValue)}
          description={t('totalListingValue')}
          icon={TrendingUp}
          iconColor="green"
        />

        <StatsCard
          title={t('recentAdditions')}
          value={stats.recentProperties}
          description={t('inLast30Days')}
          icon={Clock}
          iconColor="purple"
        />

        <StatsCard
          title={t('avgPropertyValue')}
          value={
            stats.totalProperties > 0
              ? formatPrice(stats.totalValue / stats.totalProperties)
              : '€0'
          }
          description={t('averageListingPrice')}
          icon={Home}
          iconColor="orange"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {t('propertyTypes')}
                </CardTitle>
                <p className="mt-1 text-sm text-gray-500">
                  {t('portfolioBreakdown')}
                </p>
              </div>
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {stats.propertyTypes.length > 0 ? (
              <div className="space-y-4">
                {stats.propertyTypes.map((type, index) => {
                  const typeLabel =
                    getPropertyTypeLabel(type.type) || type.type;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2 shadow-sm">
                          <Home className="h-5 w-5 text-brand-700" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {typeLabel}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Math.round(
                              (type.count / stats.totalProperties) * 100
                            )}
                            % {t('ofPortfolio')}
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {type.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Building2 className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                <p className="text-sm">{t('noPropertiesYet')}</p>
                <Link href="/properties/new">
                  <Button className="mt-4 bg-brand-700 hover:bg-brand-800">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addFirstProperty')}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {t('recentProperties')}
                </CardTitle>
                <p className="mt-1 text-sm text-gray-500">
                  {t('latestListings')}
                </p>
              </div>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {stats.recentPropertiesList.length > 0 ? (
              <div className="space-y-3">
                {stats.recentPropertiesList.map((property) => (
                  <Link key={property._id} href={`/properties/${property._id}`}>
                    <div className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {property.address}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded bg-white px-2 py-0.5 text-xs text-gray-600">
                            {getPropertyTypeLabel(property.propertyType) ||
                              property.propertyType}
                          </span>
                          <span className="text-xs text-gray-500">
                            {property.city}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(property.price)}
                        </p>
                        <p className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(property.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}

                <Link href="/properties">
                  <Button variant="outline" className="mt-2 w-full">
                    {t('viewAllProperties')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Clock className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                <p className="text-sm">{t('noRecentProperties')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showLegalAcceptance && (
        <Card className="border-[#102c54]/10 shadow-sm">
          <CardHeader className="border-b bg-[#102c54]/[0.03]">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[#102c54]/10 p-3 text-[#102c54]">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Juridische documenten bevestigen
                </CardTitle>
                <p className="mt-1 text-sm text-gray-600">
                  Geef hieronder eenmalig akkoord op de toepasselijke
                  voorwaarden, privacyverklaring, verwerkersovereenkomst en
                  disclaimer. Daarna verdwijnt dit blok automatisch uit je
                  dashboard.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <LegalAcceptancePanel />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
