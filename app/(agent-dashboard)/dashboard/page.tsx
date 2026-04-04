import AgentWorkflowCard from '@/components/dashboard/AgentWorkflowCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongodb';
import Property from '@/lib/db/models/Property';
import {
  Building2,
  Home,
  Clock,
  Plus,
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
    <div className="space-y-8 pb-6">
      <section className="relative overflow-hidden rounded-[34px] border border-white/15 shadow-[0_25px_80px_rgba(16,44,84,0.22)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/High-end-real-estate-avondfotografie-IMG_6632-1280x720.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative flex min-h-[400px] flex-col justify-between px-8 py-8 lg:min-h-[470px] lg:px-10 lg:py-10">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-white/30 bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.10)]">
                Vastgoed Exclusief Dashboard
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.28)] md:text-5xl xl:text-6xl">
                {t('title')}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-white/95 drop-shadow-[0_2px_14px_rgba(0,0,0,0.22)] md:text-lg">
                {t('subtitle')}
              </p>
            </div>

            <Link href="/properties/new">
              <Button className="gap-2 rounded-full border border-white/30 bg-white/14 px-6 text-white shadow-lg backdrop-blur-md hover:bg-white/22">
                <Plus className="h-4 w-4" />
                {t('addProperty')}
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3 xl:max-w-4xl">
            <div className="rounded-[24px] border border-white/20 bg-white/12 p-5 text-white backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.12)]">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/75">
                Totaal woningen
              </div>
              <div className="mt-3 text-3xl font-semibold">
                {stats.totalProperties}
              </div>
              <div className="mt-2 text-sm text-white/82">
                Actieve portefeuille in overzicht
              </div>
            </div>

            <div className="rounded-[24px] border border-white/20 bg-white/12 p-5 text-white backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.12)]">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/75">
                Portefeuille waarde
              </div>
              <div className="mt-3 text-3xl font-semibold">
                {formatPrice(stats.totalValue)}
              </div>
              <div className="mt-2 text-sm text-white/82">
                Totale aanbodwaarde van uw woningen
              </div>
            </div>

            <div className="rounded-[24px] border border-white/20 bg-white/12 p-5 text-white backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.12)]">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/75">
                Recente toevoegingen
              </div>
              <div className="mt-3 text-3xl font-semibold">
                {stats.recentProperties}
              </div>
              <div className="mt-2 text-sm text-white/82">
                Nieuwe woningen in de laatste 30 dagen
              </div>
            </div>
          </div>
        </div>
      </section>

      <AgentWorkflowCard
        totalProperties={stats.totalProperties}
        totalValuations={stats.recentProperties}
        totalMediaItems={0}
        totalPublishedProperties={0}
        totalPromotions={0}
        className="px-1"
      />

      <div className="relative z-10 px-1">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(16,44,84,0.12)]">
            <CardHeader className="border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-[#102c54]">
                    {t('propertyTypes')}
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    {t('portfolioBreakdown')}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[#102c54] shadow-sm">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="bg-white pt-6">
              {stats.propertyTypes.length > 0 ? (
                <div className="space-y-4">
                  {stats.propertyTypes.map((type, index) => {
                    const typeLabel =
                      getPropertyTypeLabel(type.type) || type.type;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-[0_8px_24px_rgba(16,44,84,0.05)] transition hover:bg-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                            <Home className="h-5 w-5 text-[#102c54]" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#102c54]">
                              {typeLabel}
                            </p>
                            <p className="text-xs text-slate-500">
                              {Math.round(
                                (type.count / stats.totalProperties) * 100
                              )}
                              % {t('ofPortfolio')}
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-semibold text-[#102c54]">
                          {type.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500">
                  <Building2 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                  <p className="text-sm">{t('noPropertiesYet')}</p>
                  <Link href="/properties/new">
                    <Button className="mt-4 rounded-full bg-[#102c54] text-white hover:bg-[#0c2342]">
                      <Plus className="mr-2 h-4 w-4" />
                      {t('addFirstProperty')}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(16,44,84,0.12)]">
            <CardHeader className="border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-[#102c54]">
                    {t('recentProperties')}
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    {t('latestListings')}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[#102c54] shadow-sm">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="bg-white pt-6">
              {stats.recentPropertiesList.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentPropertiesList.map((property) => (
                    <Link key={property._id} href={`/properties/${property._id}`}>
                      <div className="flex cursor-pointer items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-[0_8px_24px_rgba(16,44,84,0.05)] transition hover:bg-slate-100">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#102c54]">
                            {property.address}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                              {getPropertyTypeLabel(property.propertyType) ||
                                property.propertyType}
                            </span>
                            <span className="text-xs text-slate-500">
                              {property.city}
                            </span>
                          </div>
                        </div>

                        <div className="ml-4 text-right">
                          <p className="text-sm font-semibold text-[#102c54]">
                            {formatPrice(property.price)}
                          </p>
                          <p className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(property.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}

                  <Link href="/properties">
                    <Button
                      variant="outline"
                      className="mt-3 w-full rounded-full border-slate-300 bg-white text-[#102c54] hover:bg-slate-50"
                    >
                      Bekijk alle woningen
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500">
                  <Clock className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                  <p className="text-sm">{t('noRecentProperties')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showLegalAcceptance && (
          <Card className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(16,44,84,0.12)]">
            <CardHeader className="border-b border-slate-200 bg-white">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[#102c54] shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle className="text-xl font-semibold text-[#102c54]">
                    Juridische documenten bevestigen
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Geef hieronder eenmalig akkoord op de toepasselijke
                    voorwaarden, privacyverklaring, verwerkersovereenkomst en
                    disclaimer. Daarna verdwijnt dit blok automatisch uit je
                    dashboard.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="bg-white pt-6">
              <LegalAcceptancePanel />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
