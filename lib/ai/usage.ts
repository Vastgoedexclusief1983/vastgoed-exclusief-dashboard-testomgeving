// lib/ai/usage.ts
import clientPromise from '@/lib/mongodb';

export const DEFAULT_MONTHLY_LIMIT = 50;

function periodKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

type UsageDoc = {
  agentId: string;
  period: string;
  count: number;
  createdAt?: Date;
  updatedAt?: Date;
};

type UserDoc = {
  email: string;
  monthlyAiLimit?: number;
};

async function resolveMonthlyLimit(agentId: string): Promise<number> {
  const client = await clientPromise;
  const db = client.db('VastgoedExclusief_DB');
  const users = db.collection<UserDoc>('users');

  // agentId = email in jouw setup
  const u = await users.findOne(
    { email: agentId },
    { projection: { monthlyAiLimit: 1 } }
  );

  const n = u?.monthlyAiLimit;
  return Number.isFinite(n as number) && (n as number) > 0
    ? (n as number)
    : DEFAULT_MONTHLY_LIMIT;
}

function normalizeLimit(n: unknown, fallback: number) {
  const v = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

/**
 * Als `limit` wordt meegegeven, gebruiken we die (override).
 * Als `limit` niet wordt meegegeven, pakken we per gebruiker monthlyAiLimit uit de DB (fallback 50).
 */
export async function getUsage(agentId: string, limit?: number) {
  const client = await clientPromise;
  const db = client.db('VastgoedExclusief_DB');
  const col = db.collection<UsageDoc>('ai_usage');

  const effectiveLimit =
    typeof limit === 'number'
      ? normalizeLimit(limit, DEFAULT_MONTHLY_LIMIT)
      : await resolveMonthlyLimit(agentId);

  const period = periodKey();
  const doc = await col.findOne({ agentId, period });

  const count = doc?.count ?? 0;
  const remaining = Math.max(0, effectiveLimit - count);

  return { agentId, period, count, limit: effectiveLimit, remaining };
}

export async function consumeOne(agentId: string, limit?: number) {
  const client = await clientPromise;
  const db = client.db('VastgoedExclusief_DB');
  const col = db.collection<UsageDoc>('ai_usage');

  const effectiveLimit =
    typeof limit === 'number'
      ? normalizeLimit(limit, DEFAULT_MONTHLY_LIMIT)
      : await resolveMonthlyLimit(agentId);

  const period = periodKey();
  const now = new Date();

  const res: any = await col.findOneAndUpdate(
    { agentId, period, count: { $lt: effectiveLimit } },
    {
      $inc: { count: 1 },
      $set: { updatedAt: now },
      $setOnInsert: { agentId, period, createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Mongo driver kan teruggeven: { value: doc } of direct doc (afhankelijk van wrapper)
  const doc: UsageDoc | null = res?.value ?? res ?? null;

  if (!doc) {
    const usage = await getUsage(agentId, effectiveLimit);
    return { ok: false as const, ...usage };
  }

  const newCount = doc.count ?? 0;
  const remaining = Math.max(0, effectiveLimit - newCount);

  return {
    ok: true as const,
    agentId,
    period,
    count: newCount,
    limit: effectiveLimit,
    remaining,
  };
}
