import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentForm } from '@/components/agents/AgentForm';
import { getTranslations } from 'next-intl/server';

export default async function NewAgentPage() {
  const t = await getTranslations('agents');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('newAgent')}</h1>
        <p className="text-muted-foreground">{t('manageAgents')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('agentDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
