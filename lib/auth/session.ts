import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth-options';
import type { UserSession } from '@/types/auth';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const session = await getSession();

  if (!session?.user?.email) return null;

  return {
    id: (session.user as any).id,
    email: session.user.email!,
    role: (session.user as any).role,
    firstName: (session.user as any).firstName,
    lastName: (session.user as any).lastName,
    agentCode: (session.user as any).agentCode,
  };
}

export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireAdmin(): Promise<UserSession> {
  const user = await requireAuth();
  if (String(user.role).toLowerCase() !== 'admin') redirect('/geen-toegang');
  return user;
}
