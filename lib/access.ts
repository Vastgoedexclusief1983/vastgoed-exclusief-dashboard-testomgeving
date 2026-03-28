import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { ensureUserByEmail } from '@/lib/db/users';

function normalizeRole(role: unknown) {
  return String(role ?? '').toLowerCase();
}

function isAdminRole(role: unknown) {
  return normalizeRole(role) === 'admin';
}

/**
 * ✅ Source of truth: Session (NextAuth)
 * - We zorgen wél dat er een user record is (ensureUserByEmail),
 *   maar we vertrouwen role primair uit de session om "downgrade" bugs te voorkomen.
 */
export async function getCurrentUserOrRedirect() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) redirect('/login');

  // Zorg dat er een DB record is (maar voorkom dat dit je rol "verandert")
  const dbUser = await ensureUserByEmail({
    email,
    name: (session?.user as any)?.name ?? null,
  });

  // Combineer session + dbUser (session wint voor role/id als die bestaan)
  const sessionRole = (session?.user as any)?.role;
  const merged = {
    ...(dbUser as any),
    ...(session?.user as any),
    email,
    role: sessionRole ?? (dbUser as any)?.role ?? 'agent',
  };

  return merged;
}

/**
 * ✅ Alleen login check, geen feature blokkades.
 * Gebruik dit op "normale" pages.
 */
export async function requireAuth() {
  return await getCurrentUserOrRedirect();
}

/**
 * ✅ Alleen admin check.
 * Gebruik dit op /admin routes.
 */
export async function requireAdmin() {
  const user = await getCurrentUserOrRedirect();

  if (!isAdminRole((user as any).role)) {
    redirect('/dashboard'); // of '/geen-toegang' als je dat liever hebt
  }

  return user;
}

/**
 * ============================
 * API Guards (Route Handlers)
 * ============================
 */

export async function requireApiUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const dbUser = await ensureUserByEmail({
    email,
    name: (session?.user as any)?.name ?? null,
  });

  const sessionRole = (session?.user as any)?.role;

  const user = {
    ...(dbUser as any),
    ...(session?.user as any),
    email,
    role: sessionRole ?? (dbUser as any)?.role ?? 'agent',
  };

  return { ok: true as const, user };
}

export async function requireApiAdmin() {
  const r = await requireApiUser();
  if (!r.ok) return r;

  if (!isAdminRole((r.user as any).role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Forbidden', role: (r.user as any).role },
        { status: 403 }
      ),
    };
  }

  return r;
}
