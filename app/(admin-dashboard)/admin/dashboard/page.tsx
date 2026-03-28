import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { requireAuth } from '@/lib/auth/session';
import { canViewAllProperties } from '@/lib/auth/permissions';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Property from '@/lib/db/models/Property';
import { Users, Building2, UserCheck, TrendingUp, Home, BarChart3, ArrowUpRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AdminAnalytics } from '@/components/dashboard/AdminAnalytics';
import { getTranslations } from 'next-intl/server';

async function getAdminStats() {
  await dbConnect();

  const activeFilter = { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }, { isDeleted: null }] };

  const totalAgents = await User.countDocuments({ role: 'agent' });
  const activeAgents = await User.countDocuments({ role: 'agent', isActive: true });
  const totalProperties = await Property.countDocuments(activeFilter);

  // Get recent properties (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentProperties = await Property.countDocuments({
    ...activeFilter,
    createdAt: { $gte: sevenDaysAgo }
  });

  const topAgents = await Property.aggregate([
    { $match: activeFilter },
    { $group: { _id: '$agentId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const agentIds = topAgents.map(a => a._id);
  const agentDetails = await User.find({ _id: { $in: agentIds } })
    .select('firstName lastName agentCode')
    .lean();

  const topAgentsWithDetails = topAgents.map(agent => {
    const details = agentDetails.find(d => d._id.toString() === agent._id.toString());
    return {
      name: details ? `${details.firstName} ${details.lastName}` : 'Unknown',
      agentCode: details?.agentCode || 'N/A',
      properties: agent.count,
    };
  });

  const provinceData = await Property.aggregate([
    { $match: activeFilter },
    { $group: { _id: '$basicInfo.province', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const propertyTypeData = await Property.aggregate([
    { $match: activeFilter },
    { $group: { _id: '$basicInfo.propertyType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyData = await Property.aggregate([
    { $match: { ...activeFilter, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const priceRangeData = await Property.aggregate([
    { $match: activeFilter },
    {
      $bucket: {
        groupBy: '$basicInfo.basePrice',
        boundaries: [0, 250000, 500000, 750000, 1000000, 1500000, 2000000, 5000000, Infinity],
        default: 'Other',
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const energyLabelData = await Property.aggregate([
    { $match: activeFilter },
    { $group: { _id: '$basicInfo.energyLabel', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const valueStats = await Property.aggregate([
    { $match: activeFilter },
    {
      $group: {
        _id: null,
        totalValue: { $sum: '$basicInfo.basePrice' },
        avgPrice: { $avg: '$basicInfo.basePrice' },
      },
    },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const priceRangeLabels: Record<number | string, string> = {
    0: '< €250K',
    250000: '€250K-500K',
    500000: '€500K-750K',
    750000: '€750K-1M',
    1000000: '€1M-1.5M',
    1500000: '€1.5M-2M',
    2000000: '€2M-5M',
    5000000: '> €5M',
    Other: 'Other',
  };

  return {
    totalAgents,
    activeAgents,
    totalProperties,
    recentProperties,
    topAgents: topAgentsWithDetails,
    analytics: {
      provinceData: provinceData.map(p => ({ province: p._id || 'Unknown', count: p.count })),
      propertyTypeData: propertyTypeData.map(p => ({ type: p._id || 'Unknown', count: p.count })),
      monthlyData: monthlyData.map(m => ({
        month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
        properties: m.count,
      })),
      priceRangeData: priceRangeData.map(p => ({
        range: priceRangeLabels[p._id] || 'Other',
        count: p.count,
      })),
      energyLabelData: energyLabelData.map(e => ({ label: e._id || 'Unknown', count: e.count })),
      totalValue: valueStats[0]?.totalValue || 0,
      avgPrice: valueStats[0]?.avgPrice || 0,
    },
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminDashboardPage() {
  const user = await requireAuth();
  const t = await getTranslations('dashboard');

  if (!canViewAllProperties(user.role)) {
    notFound();
  }

  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#102c54] via-[#1a3d6e] to-[#102c54] p-8 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">{t('welcome')}</p>
              <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
              <p className="text-white/60 max-w-md">
                {t('detailedInsights')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 min-w-[180px]">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">{t('totalPortfolioValue')}</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.analytics.totalValue)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 min-w-[180px]">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">{t('averagePrice')}</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.analytics.avgPrice)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Link href="/admin/agents">
              <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                <Users className="h-4 w-4" />
                {t('viewAgents')}
              </Button>
            </Link>
            <Link href="/admin/properties">
              <Button className="gap-2 bg-white text-[#102c54] hover:bg-white/90">
                <Building2 className="h-4 w-4" />
                {t('viewProperties')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('totalAgents')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAgents}</p>
                <p className="text-xs text-gray-500 mt-2">{stats.activeAgents} {t('activeAgents').toLowerCase()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('activeAgents')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeAgents}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600 font-medium">
                    {stats.totalAgents > 0 ? Math.round((stats.activeAgents / stats.totalAgents) * 100) : 0}% {t('ofTotal')}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('totalProperties')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProperties}</p>
                <p className="text-xs text-green-600 font-medium mt-2">+{stats.recentProperties} {t('recentProperties')}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('avgPropertiesPerAgent')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalAgents > 0 ? Math.round(stats.totalProperties / stats.totalAgents) : 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">{t('propertiesPerAgent')}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#102c54] rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('portfolioAnalytics')}</h2>
            <p className="text-sm text-gray-500">{t('detailedInsights')}</p>
          </div>
        </div>
        <AdminAnalytics
          provinceData={stats.analytics.provinceData}
          propertyTypeData={stats.analytics.propertyTypeData}
          monthlyData={stats.analytics.monthlyData}
          priceRangeData={stats.analytics.priceRangeData}
          energyLabelData={stats.analytics.energyLabelData}
          totalValue={stats.analytics.totalValue}
          avgPrice={stats.analytics.avgPrice}
        />
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">{t('topPerformingAgents')}</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">{t('agentsWithMostListings')}</p>
            </div>
            <div className="p-2 bg-[#102c54]/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-[#102c54]" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {stats.topAgents.length > 0 ? (
            <div className="space-y-3">
              {stats.topAgents.map((agent, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-[#102c54]/20 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-white text-sm font-bold shadow-sm ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                      'bg-[#102c54]'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{agent.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{agent.agentCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#102c54]">{agent.properties}</p>
                      <p className="text-xs text-gray-500">{t('propertiesPerAgent').split(' ')[0].toLowerCase()}</p>
                    </div>
                    <Home className="h-5 w-5 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-medium">{t('noDataAvailable')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('agentPerformanceWillAppear')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
