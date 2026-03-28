import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

import clientPromise from '@/lib/mongodb';
import { requireApiAdmin } from '@/lib/access';
import type { FeatureKey, FeatureMap } from '@/types/features';
import { DEFAULT_ADMIN_FEATURES, DEFAULT_AGENT_FEATURES } from '@/types/features';

const DB_NAME = 'VastgoedExclusief_DB';
const USERS_COL = 'users';

const ALLOWED_KEYS: FeatureKey[] = ['aiAssistant', 'waardebepaling', 'website'];

function defaultsForRole(role: unknown): FeatureMap {
  return String(role ?? '').toLowerCase() === 'admin'
    ? { ...DEFAULT_ADMIN_FEATURES }
    : { ...DEFAULT_AGENT_FEATURES };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ belangrijk
) {
  const gate = await requireApiAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await params; // ✅ belangrijk

  const body = (await req.json().catch(() => null)) as
    | null
    | { key: FeatureKey; enabled: boolean };

  if (!body || !body.key || typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!ALLOWED_KEYS.includes(body.key)) {
    return NextResponse.json({ error: 'Invalid feature key' }, { status: 400 });
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const col = db.collection(USERS_COL);

  const user = await col.findOne({ _id: new ObjectId(id) });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const merged: FeatureMap = { ...defaultsForRole(user.role), ...(user.features ?? {}) };
  (merged as any)[body.key] = body.enabled;

  await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { features: merged, updatedAt: new Date() } }
  );

  return NextResponse.json({ ok: true, features: merged });
}
