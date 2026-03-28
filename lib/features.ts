import clientPromise from '@/lib/mongodb';
import {
  DEFAULT_ADMIN_FEATURES,
  DEFAULT_AGENT_FEATURES,
  FeatureKey,
  FeatureMap,
} from '@/types/features';

const DB_NAME = 'VastgoedExclusief_DB';
const COL = 'users';

function defaultsForRole(role: string | undefined): FeatureMap {
  return role?.toLowerCase() === 'admin'
    ? { ...DEFAULT_ADMIN_FEATURES }
    : { ...DEFAULT_AGENT_FEATURES };
}

export async function getUserFeatures(email: string): Promise<FeatureMap> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const col = db.collection(COL);

  const user = await col.findOne<{ role?: string; features?: FeatureMap }>({
    email,
  });

  if (!user) return { ...DEFAULT_AGENT_FEATURES };

  return {
    ...defaultsForRole(user.role),
    ...(user.features ?? {}),
  };
}

export async function setUserFeature(
  email: string,
  key: FeatureKey,
  enabled: boolean
): Promise<FeatureMap> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const col = db.collection(COL);

  const existing = await col.findOne<{ role?: string; features?: FeatureMap }>({
    email,
  });

  const next = {
    ...defaultsForRole(existing?.role),
    ...(existing?.features ?? {}),
    [key]: enabled,
  };

  await col.updateOne(
    { email },
    {
      $set: {
        features: next,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  return next;
}
