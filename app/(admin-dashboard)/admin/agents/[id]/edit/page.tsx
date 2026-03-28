import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentForm } from '@/components/agents/AgentForm';
import { Badge } from '@/components/ui/badge';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { SerializedAgent } from '@/types/agent';
import { getTranslations } from 'next-intl/server';

async function getAgent(id: string): Promise<SerializedAgent | null> {
  await dbConnect();
  const agent = await User.findOne({ _id: id, role: 'agent' })
    .select('-password')
    .lean();

  if (!agent) {
    return null;
  }

  return {
    ...agent,
    _id: agent._id.toString(),
    agentCode: agent.agentCode || '',
    createdAt: agent.createdAt.toISOString(),
    updatedAt: agent.updatedAt.toISOString(),
    lastLogin: agent.lastLogin ? agent.lastLogin.toISOString() : undefined,
  };
}

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgent(id);
  const t = await getTranslations('agents');
  const tCommon = await getTranslations('common');

  if (!agent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('editAgent')}</h1>
          <p className="text-muted-foreground">
            {t('updateAgentInfo')} {agent.firstName} {agent.lastName}
          </p>
        </div>
        <Badge variant={agent.isActive ? 'default' : 'secondary'}>
          {agent.isActive ? tCommon('active') : tCommon('inactive')}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('agentDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentForm agent={agent} mode="edit" />
        </CardContent>
      </Card>
    </div>
  );
}
