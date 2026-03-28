import { requireAuth } from '@/lib/auth/session';
import { getDashboardPropertiesForAgent } from '@/lib/data/properties';
import WebsitePageClient from './WebsitePageClient';

export default async function WebsitePage() {
  const session = await requireAuth();

  const agentId = String(
    (session as any)?.id ||
      (session as any)?._id ||
      ''
  );

  const agentName = String(
    (session as any)?.name ||
      `${(session as any)?.firstName || ''} ${(session as any)?.lastName || ''}`.trim() ||
      (session as any)?.companyName ||
      'Makelaar'
  );

  const agentEmail = String((session as any)?.email || '');

  const initialProperties = agentId
    ? await getDashboardPropertiesForAgent(agentId)
    : [];

  return (
    <WebsitePageClient
      initialProperties={initialProperties}
      agentName={agentName}
      agentEmail={agentEmail}
    />
  );
}
