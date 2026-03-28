import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import {
  DEFAULT_ADMIN_FEATURES,
  DEFAULT_AGENT_FEATURES,
  FeatureMap,
} from '@/types/features';

export type UserRole = 'ADMIN' | 'AGENT' | 'admin' | 'agent';

export type DbUser = {
  _id?: any;
  email: string;
  name?: string | null;
  role: UserRole; // we slaan altijd 'ADMIN' of 'AGENT' op
  features: FeatureMap;
  createdAt?: Date;
  updatedAt?: Date;
};

const DB_NAME = 'VastgoedExclusief_DB';
const COL_NAME = 'users';

function normalizeEmail(email: string) {
  return String(email || '').trim().toLowerCase();
}

/** ADMIN_EMAILS uit Vercel: "a@b.nl,b@c.nl" */
function getAdminEmailSet() {
  const raw = process.env.ADMIN_EMAILS || '';
  const emails = raw
    .split(',')
    .map((e) => normalizeEmail(e))
    .filter(Boolean);
  return new Set(emails);
}

/** ✅ Normaliseert elke variant naar 'ADMIN' of 'AGENT' */
function normalizeRole(role: unknown): 'ADMIN' | 'AGENT' {
  return String(role ?? '').toLowerCase() === 'admin' ? 'ADMIN' : 'AGENT';
}

/** Default features per rol */
function defaultsForRole(role: unknown): FeatureMap {
  return normalizeRole(role) === 'ADMIN'
    ? { ...DEFAULT_ADMIN_FEATURES }
    : { ...DEFAULT_AGENT_FEATURES };
}

/** Merge defaults + bestaande features */
function mergeFeatures(role: unknown, features?: FeatureMap | null): FeatureMap {
  return { ...defaultsForRole(role), ...(features ?? {}) };
}

async function usersCol() {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<DbUser>(COL_NAME);
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const col = await usersCol();
  const normalizedEmail = normalizeEmail(email);

  const u = await col.findOne({ email: normalizedEmail });
  if (!u) return null;

  const role = normalizeRole(u.role);
  return {
    ...u,
    email: normalizedEmail,
    role,
    features: mergeFeatures(role, u.features),
  } as DbUser;
}

/**
 * ✅ Zorgt dat elke ingelogde gebruiker een user-record heeft.
 * - Nieuwe users default = AGENT met DEFAULT_AGENT_FEATURES
 * - Bestaande users: normaliseert role + merge defaults
 * - ✅ FORCEERT ADMIN als email in ADMIN_EMAILS staat
 */
export async function ensureUserByEmail(params: {
  email: string;
  name?: string | null;
}): Promise<DbUser> {
  const col = await usersCol();

  const email = normalizeEmail(params.email);
  const name = params.name ?? null;

  if (!email) throw new Error('ensureUserByEmail: email ontbreekt');

  const adminSet = getAdminEmailSet();
  const isAdminEmail = adminSet.has(email);

  const existing = await col.findOne({ email });

  // Bepaal gewenste role:
  // - als admin email => altijd ADMIN
  // - anders => normaliseer bestaande role, of default AGENT
  const desiredRole: 'ADMIN' | 'AGENT' = isAdminEmail
    ? 'ADMIN'
    : normalizeRole(existing?.role ?? 'AGENT');

  // Features moeten altijd kloppen met role + merges
  const desiredFeatures = mergeFeatures(desiredRole, existing?.features ?? null);

  const now = new Date();

  if (existing) {
    // behoud bestaande naam als die al bestaat, anders vul met session-name
    const nextName = existing.name ?? name;

    await col.updateOne(
      { email },
      {
        $set: {
          name: nextName,
          role: desiredRole,
          features: desiredFeatures,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return {
      ...existing,
      email,
      name: nextName,
      role: desiredRole,
      features: desiredFeatures,
      updatedAt: now,
    } as DbUser;
  }

  // Nieuwe user
  const doc: DbUser = {
    email,
    name,
    role: desiredRole, // ✅ kan ADMIN zijn als jij voor het eerst inlogt
    features: desiredFeatures,
    createdAt: now,
    updatedAt: now,
  };

  await col.insertOne(doc as any);
  return doc;
}

/** (OPTIONEEL) Features op basis van email */
export async function getUserFeaturesByEmail(email: string): Promise<FeatureMap> {
  const u = await getUserByEmail(email);
  if (!u) return { ...DEFAULT_AGENT_FEATURES };

  const role = normalizeRole(u.role);
  return mergeFeatures(role, u.features);
}

/**
 * ✅ update feature op basis van userId (ObjectId)
 * Dit matcht jouw endpoint: /api/admin/users/[id]/features
 */
export async function setUserFeatureById(
  userId: string,
  key: keyof FeatureMap,
  enabled: boolean
): Promise<FeatureMap> {
  const col = await usersCol();

  const _id = new ObjectId(userId);
  const existing = await col.findOne({ _id });

  if (!existing) {
    throw new Error('User not found');
  }

  // ✅ admin email blijft admin, ook via feature toggles
  const adminSet = getAdminEmailSet();
  const isAdminEmail = adminSet.has(normalizeEmail(existing.email));

  const role: 'ADMIN' | 'AGENT' = isAdminEmail ? 'ADMIN' : normalizeRole(existing.role);

  const next = mergeFeatures(role, existing.features ?? null);
  (next as any)[key] = enabled;

  await col.updateOne(
    { _id },
    {
      $set: {
        role,
        features: next,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: false }
  );

  return next;
}

/** Update rol + reset features naar defaults van die rol */
export async function setUserRole(emailInput: string, role: UserRole) {
  const col = await usersCol();

  const email = normalizeEmail(emailInput);

  // ✅ Forceer ADMIN als email in ADMIN_EMAILS staat
  const adminSet = getAdminEmailSet();
  const forcedRole: 'ADMIN' | 'AGENT' = adminSet.has(email)
    ? 'ADMIN'
    : normalizeRole(role);

  const features =
    forcedRole === 'ADMIN'
      ? { ...DEFAULT_ADMIN_FEATURES }
      : { ...DEFAULT_AGENT_FEATURES };

  await col.updateOne(
    { email },
    {
      $set: { role: forcedRole, features, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
}

/**
 * ✅ Nodig voor Admin → "Toegang per makelaar"
 * Geeft rows terug die passen bij AccessTable:
 * { id, name, email, role, features }
 */
export async function listAgentsBasic(): Promise<
  Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    features: FeatureMap;
  }>
> {
  const col = await usersCol();

  const docs = await col
    .find(
      { role: { $in: ['ADMIN', 'AGENT', 'admin', 'agent'] } },
      { projection: { email: 1, name: 1, role: 1, features: 1 } }
    )
    .sort({ email: 1 })
    .toArray();

  const adminSet = getAdminEmailSet();

  return docs.map((u) => {
    const email = normalizeEmail(u.email);

    // ✅ Forceer admin label in UI als email admin is
    const role: 'ADMIN' | 'AGENT' = adminSet.has(email)
      ? 'ADMIN'
      : normalizeRole(u.role);

    return {
      id: u._id?.toString?.() ?? String(u._id),
      name: (u.name ?? email) as string,
      email,
      role: role.toLowerCase(), // UI toont "admin"/"agent"
      features: mergeFeatures(role, u.features),
    };
  });
}

