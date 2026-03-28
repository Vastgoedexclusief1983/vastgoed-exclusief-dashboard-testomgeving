// app/api/ai/usage/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getUsage } from '@/lib/ai/usage';

function getAgentIdFromSession(session: any): string | null {
  return session?.user?.email ?? null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const agentId = getAgentIdFromSession(session);

  if (!agentId) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  // ✅ Geen limit meegeven -> usage.ts pakt monthlyAiLimit uit DB (fallback 50)
  const usage = await getUsage(agentId);
  return NextResponse.json(usage);
}
