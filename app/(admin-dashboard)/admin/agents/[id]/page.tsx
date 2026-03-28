import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { requireAuth } from '@/lib/auth/session';
import { canViewAllProperties } from '@/lib/auth/permissions';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Property from '@/lib/db/models/Property';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Building2,
  TrendingUp,
  MapPin,
  Edit,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { PropertyTable } from '@/components/properties/PropertyTable';
import { getTranslations } from 'next-intl/server';

async function getAgent(id: string) {
  await dbConnect();

  const agent = await User.findById(id).select('-password').lean();

  if (!agent || agent.role !== 'agent') {
    return null;
  }

  // Get agent's properties
  const properties = await Property.find({ agentId: id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Get stats
  const totalProperties = await Property.countDocuments({ agentId: id });

  const totalValue = await Property.aggregate([
    { $match: { agentId: id } },
    { $group: { _id: null, total: { $sum: '$basicInfo.basePrice' } } },
  ]);

  const uniqueCities = await Property.distinct('basicInfo.city', { agentId: id });

  const propertyTypes = await Property.aggregate([
    { $match: { agentId: id } },
    { $group: { _id: '$basicInfo.propertyType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ]);

  return {
    agent: {
      ...agent,
      _id: agent._id.toString(),
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
      lastLogin: agent.lastLogin ? agent.lastLogin.toISOString() : null,
    },
    properties: properties.map((p: any) => {
      const serialized: any = {
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
    stats: {
      totalProperties,
      totalValue: totalValue[0]?.total || 0,
      avgValue: totalProperties > 0 ? (totalValue[0]?.total || 0) / totalProperties : 0,
      cityCount: uniqueCities.length,
      topTypes: propertyTypes.map(p => ({ type: p._id, count: p.count })),
    },
  };
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();

  if (!canViewAllProperties(user.role)) {
    notFound();
  }

  const { id } = await params;
  const data = await getAgent(id);
  const t = await getTranslations('agents');
  const tCommon = await getTranslations('common');
  const tDashboard = await getTranslations('agentDashboard');
  const tProfile = await getTranslations('profile');
  const tProperties = await getTranslations('properties');

  if (!data) {
    notFound();
  }

  const { agent, properties, stats } = data;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/agents">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('agentDetails')}</h1>
            <p className="text-gray-500 mt-1">{t('manageAgents')}</p>
          </div>
        </div>
        <Link href={`/admin/agents/${agent._id}/edit`}>
          <Button className="gap-2 bg-brand-700 hover:bg-brand-800">
            <Edit className="h-4 w-4" />
            {t('editAgent')}
          </Button>
        </Link>
      </div>

      {/* Agent Info Card */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-700 to-brand-900 text-white font-bold text-3xl shadow-lg">
              {agent.firstName[0]}{agent.lastName[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {agent.firstName} {agent.lastName}
                </h2>
                <Badge
                  variant={agent.isActive ? 'default' : 'secondary'}
                  className={agent.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                >
                  {agent.isActive ? tCommon('active') : tCommon('inactive')}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('email')}</p>
                    <p className="font-medium text-gray-900">{agent.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('agentCode')}</p>
                    <p className="font-medium text-gray-900">{agent.agentCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{tProfile('memberSince')}</p>
                    <p className="font-medium text-gray-900">{formatDate(agent.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{tProfile('lastLogin')}: {formatDate(agent.lastLogin)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={tDashboard('totalProperties')}
          value={stats.totalProperties}
          description={tProperties('allProperties')}
          icon={Building2}
          iconColor="blue"
        />

        <StatsCard
          title={tDashboard('portfolioValue')}
          value={formatPrice(stats.totalValue)}
          description={tDashboard('totalListingValue')}
          icon={TrendingUp}
          iconColor="green"
        />

        <StatsCard
          title={tDashboard('avgPropertyValue')}
          value={formatPrice(stats.avgValue)}
          description={tDashboard('averageListingPrice')}
          icon={Building2}
          iconColor="purple"
        />

        <StatsCard
          title={tProperties('location')}
          value={stats.cityCount}
          description={tProperties('city')}
          icon={MapPin}
          iconColor="orange"
        />
      </div>

      {/* Top Property Types */}
      {stats.topTypes.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">{tProperties('topTypes')}:</span>
          <div className="flex gap-2">
            {stats.topTypes.map((type, index) => (
              <Badge key={index} variant="secondary" className="bg-brand-50 text-brand-700">
                {type.type} ({type.count})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recent Properties */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{tProperties('myProperties')}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {stats.totalProperties === 0 ? tProperties('noProperties') : `${Math.min(10, properties.length)} ${tCommon('of')} ${stats.totalProperties} ${tCommon('properties')}`}
              </p>
            </div>
            {stats.totalProperties > 0 && (
              <Link href={`/admin/properties?agent=${agent._id}`}>
                <Button variant="outline" size="sm">
                  {tProperties('allProperties')}
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="p-6">
          {properties.length > 0 ? (
            <PropertyTable properties={properties} currentPage={1} totalPages={1} isAdmin={true} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-3" />
              <p className="text-sm">{tProperties('noProperties')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
