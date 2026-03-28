import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AgentTable } from '@/components/agents/AgentTable';
import { Plus, Search, Filter } from 'lucide-react';

import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Property from '@/lib/db/models/Property';

import mongoose from 'mongoose';
import { getTranslations } from 'next-intl/server';

// ✅ Helper: ObjectId safe converter
function toObjectIdSafe(value: any) {
  try {
    if (!value) return null;
    if (value instanceof mongoose.Types.ObjectId) return value;
    if (mongoose.Types.ObjectId.isValid(String(value))) {
      return new mongoose.Types.ObjectId(String(value));
    }
    return null;
  } catch {
    return null;
  }
}

async function getAgents() {
  await dbConnect();

  const agents = await User.find({ role: { $regex: /^agent$/i } })
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  const agentIdsObject = agents
    .map((a: any) => toObjectIdSafe(a._id))
    .filter(Boolean);

  const agentIdsString = agents.map((a: any) => String(a._id));

  const propertyCounts = await Property.aggregate([
    {
      $match: {
        $or: [
          { agentId: { $in: agentIdsString } },
          { agentId: { $in: agentIdsObject } },
        ],
      },
    },
    { $group: { _id: '$agentId', count: { $sum: 1 } } },
  ]);

  const propertyCountMap = new Map(
    propertyCounts.map((p: any) => [String(p._id), p.count])
  );

  return agents.map((a: any) => ({
    ...a,
    _id: String(a._id),
    monthlyAiLimit:
      typeof a.monthlyAiLimit === 'number' && Number.isFinite(a.monthlyAiLimit)
        ? a.monthlyAiLimit
        : 50,
    propertyCount: propertyCountMap.get(String(a._id)) ?? 0,
  }));
}

export default async function AdminAgentsPage() {
  const t = await getTranslations('agents').catch(() => null);
  const agents = await getAgents();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t ? t('title') : 'Makelaars beheren'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t
              ? t('subtitle')
              : 'Beheer aangesloten makelaars, bekijk hun status en stel AI-credits per maand in.'}
          </p>
        </div>

        <Link href="/admin/agents/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t ? t('add') : 'Makelaar toevoegen'}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>
            {t
              ? t('hintSearch')
              : 'Zoek, beheer en pas het maandelijkse AI-creditlimiet per makelaar aan.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" type="button">
            <Filter className="h-4 w-4" />
            {t ? t('filter') : 'Filter'}
          </Button>
        </div>
      </div>

      <AgentTable agents={agents as any} />
    </div>
  );
}
