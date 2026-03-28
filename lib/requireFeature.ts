import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import type { FeatureKey } from '@/types/features';

/**
 * Feature gating is UITGESCHAKELD.
 * - Iedereen die is ingelogd mag overal bij.
 * - We houden deze functie bewust in stand zodat bestaande imports niet breken.
 */
export async function requireFeature(_feature: FeatureKey) {
  const session = await getServerSession(authOptions);

  // Alleen login check behouden
  const email = session?.user?.email;
  if (!email) {
    redirect('/login');
  }

  // Geen feature checks meer
  return;
}
