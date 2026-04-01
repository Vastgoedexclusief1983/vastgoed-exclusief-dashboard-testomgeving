import { requireFeature } from '@/lib/requireFeature';
export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireFeature('aiAssistant');
  return children;
} 
