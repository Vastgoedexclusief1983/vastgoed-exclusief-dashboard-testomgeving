// app/(admin-dashboard)/admin/ai-usage/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import mongoose from 'mongoose';

// ✅ zorg dat dit overzicht nooit cached (anders zie je afschrijving te laat)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function periodKey(d = new Date()) {
  // "YYYY-MM"
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalizeEmail(v: unknown) {
  return String(v ?? '').trim().toLowerCase();
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default async function AdminAiUsagePage() {
  const session = await getServerSession(authOptions);
  const emailRaw = (session?.user as any)?.email;

  if (!emailRaw) redirect('/login');

  const email = normalizeEmail(emailRaw);

  await dbConnect();

  // Check admin
  const me = await User.findOne({ email }).select('role').lean();
  const role = String((me as any)?.role ?? '').toLowerCase();

  if (role !== 'admin') {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-semibold">AI Credits – Overzicht</h1>
        <p className="mt-2 text-sm text-red-600">Geen toegang.</p>
      </div>
    );
  }

  const period = periodKey();

  // Agents
  const agents = await User.find({ role: { $regex: /^agent$/i } })
    .select('name email monthlyAiLimit aiMonthlyLimit')
    .sort({ createdAt: -1 })
    .lean();

  // ✅ canonical agentEmails (lowercase/trim) + keep original email for display
  const agentRows = agents
    .map((a: any) => {
      const emailOriginal = String(a.email || '').trim();
      const emailNorm = normalizeEmail(emailOriginal);
      return {
        name: a.name ?? '—',
        emailOriginal,
        emailNorm,
        monthlyAiLimit: a.monthlyAiLimit,
        aiMonthlyLimit: a.aiMonthlyLimit,
      };
    })
    .filter((a) => a.emailNorm.length > 0);

  // Usage docs uit collectie ai_usage
  const coll = mongoose.connection.collection('ai_usage');

  /**
   * ✅ Case-insensitive match op agentId:
   * - Hiermee pak je ook records waar agentId bijv. hoofdletters heeft.
   * - Let op: het lost niet "raisa@hotmail.com" vs "raisa.g@hotmail.com" op (dat zijn echt 2 verschillende accounts)
   *   maar voorkomt wél dat je data mist door casing/spaties.
   */
  const agentIdRegexList = agentRows.map((a) => new RegExp(`^${escapeRegex(a.emailNorm)}$`, 'i'));

  const docs = await coll
    .find({ period, agentId: { $in: agentIdRegexList } })
    .project({ agentId: 1, count: 1 })
    .toArray();

  // ✅ normalize agentId keys in map
  const usageMap = new Map<string, number>();
  for (const d of docs as any[]) {
    const key = normalizeEmail(d?.agentId);
    const add = Number(d?.count ?? 0) || 0;
    usageMap.set(key, (usageMap.get(key) ?? 0) + add);
  }

  const rows = agentRows.map((a) => {
    const used = usageMap.get(a.emailNorm) ?? 0;

    // probeer beide veldnamen, fallback 50
    const limit = Number(a.monthlyAiLimit ?? a.aiMonthlyLimit ?? 50) || 50;

    const remaining = Math.max(0, limit - used);
    const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;

    return {
      name: a.name,
      email: a.emailOriginal || a.emailNorm,
      used,
      limit,
      remaining,
      pct,
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">AI Credits – Overzicht</h1>
        <p className="text-sm text-muted-foreground">
          Per makelaar • periode: <span className="font-medium">{period}</span>
        </p>
      </div>

      <div className="rounded-xl border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Makelaar</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Gebruikt</th>
                <th className="px-4 py-3 font-medium">Limiet</th>
                <th className="px-4 py-3 font-medium">Over</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const isLow = r.remaining <= Math.max(3, Math.round(r.limit * 0.1));
                return (
                  <tr key={r.email} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                    <td className="px-4 py-3">{r.used}</td>
                    <td className="px-4 py-3">{r.limit}</td>
                    <td className="px-4 py-3">{r.remaining}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-40">
                          <div className="h-2 w-full rounded bg-muted">
                            <div
                              className="h-2 rounded bg-foreground"
                              style={{ width: `${clamp(r.pct, 0, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className={isLow ? 'text-red-600' : 'text-muted-foreground'}>
                          {r.pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!rows.length && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                    Geen makelaars gevonden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Tip: als je later meerdere maanden wilt kunnen kiezen, maak je hier een month selector en query je op period.
      </div>
    </div>
  );
}
