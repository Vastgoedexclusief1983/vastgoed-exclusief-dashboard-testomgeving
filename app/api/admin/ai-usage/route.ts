// app/api/admin/ai-usage/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import clientPromise from '@/lib/mongodb';

type UserDoc = {
  email: string;
  name?: string | null;
  role?: string | null;
  monthlyAiLimit?: number;
};

function isAdminRole(role: unknown) {
  return String(role ?? '').toLowerCase() === 'admin';
}

function periodKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;

    if (!email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    // ✅ Admin-check via DB (robust, niet afhankelijk van session.role)
    const client = await clientPromise;
    const db = client.db('VastgoedExclusief_DB');
    const users = db.collection<UserDoc>('users');

    const me = await users.findOne({ email }, { projection: { role: 1 } });
    if (!isAdminRole(me?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // optioneel: ?period=2026-02
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') || periodKey()).trim();

    const usage = db.collection('ai_usage');

    // ai_usage docs: { agentId(email), period, count, createdAt, updatedAt }
    // We joinen met users om naam + monthlyAiLimit te tonen
    const rows = await usage
      .aggregate([
        { $match: { period } },
        {
          $lookup: {
            from: 'users',
            localField: 'agentId',
            foreignField: 'email',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            agentId: 1,
            period: 1,
            count: 1,
            updatedAt: 1,
            name: '$user.name',
            monthlyAiLimit: '$user.monthlyAiLimit',
            role: '$user.role',
          },
        },
        { $sort: { count: -1, agentId: 1 } },
      ])
      .toArray();

    return NextResponse.json({ ok: true, period, rows });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Failed', details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
