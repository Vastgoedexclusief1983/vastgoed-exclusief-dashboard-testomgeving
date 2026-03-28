import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth/auth-options';
import { getUserFeatures, setUserFeature } from '@/lib/features';
import { FeatureKey } from '@/types/features';

/**
 * /api/custom-features/access
 * - GET: returns features for the logged-in user
 * - PATCH (admin only): updates a user's feature toggle
 */

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const features = await getUserFeatures(email);
  return NextResponse.json({ features }, { status: 200 });
}

const PatchSchema = z.object({
  email: z.string().email(),
  feature: z.enum(['aiAssistant', 'waardebepaling', 'website']),
  enabled: z.boolean(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, feature, enabled } = parsed.data;

  // Cast is safe because the zod enum matches FeatureKey union
  const updated = await setUserFeature(email, feature as FeatureKey, enabled);

  return NextResponse.json({ email, features: updated }, { status: 200 });
}
