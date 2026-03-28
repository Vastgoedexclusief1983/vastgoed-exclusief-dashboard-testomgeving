'use client';

import { useState } from 'react';
import type { FeatureKey, UserFeatures } from '@/types/features';
import { FEATURE_LABELS } from '@/types/features';

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  features: UserFeatures;
};

export default function AccessTable({ rows }: { rows: Row[] }) {
  const [state, setState] = useState<Row[]>(rows);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  async function toggle(userId: string, key: FeatureKey) {
    const row = state.find((r) => r.id === userId);
    if (!row) return;

    const next = !row.features[key];
    const token = `${userId}:${key}`;

    // optimistic UI
    setState((prev) =>
      prev.map((r) =>
        r.id === userId ? { ...r, features: { ...r.features, [key]: next } } : r
      )
    );
    setSaving((s) => ({ ...s, [token]: true }));

    try {
      const res = await fetch(`/api/admin/users/${userId}/features`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },

        // ✅ email meegeven als fallback zodat backend altijd de juiste user kan vinden
        body: JSON.stringify({ key, enabled: next, email: row.email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.error ??
          `Opslaan mislukt (${res.status}).`;

        throw new Error(msg);
      }
    } catch (e: any) {
      // rollback
      setState((prev) =>
        prev.map((r) =>
          r.id === userId
            ? { ...r, features: { ...r.features, [key]: !next } }
            : r
        )
      );

      alert(e?.message ?? 'Opslaan mislukt');
    } finally {
      setSaving((s) => ({ ...s, [token]: false }));
    }
  }

  const keys: FeatureKey[] = ['aiAssistant', 'waardebepaling', 'website'];

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b text-xs font-semibold text-muted-foreground">
        <div className="col-span-5">Gebruiker</div>
        <div className="col-span-2">Rol</div>
        <div className="col-span-5">Modules</div>
      </div>

      {state.map((r) => (
        <div
          key={r.id}
          className="grid grid-cols-12 gap-2 px-4 py-3 border-b items-center"
        >
          <div className="col-span-5">
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.email}</div>
          </div>

          <div className="col-span-2 text-sm">{r.role}</div>

          <div className="col-span-5 flex flex-wrap gap-2">
            {keys.map((k) => {
              const on = r.features[k];
              const token = `${r.id}:${k}`;
              const busy = !!saving[token];

              return (
                <button
                  key={k}
                  onClick={() => toggle(r.id, k)}
                  disabled={busy}
                  className={`px-3 py-1 rounded-md text-sm border ${
                    on
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-gray-50'
                  } ${busy ? 'opacity-60' : ''}`}
                >
                  {FEATURE_LABELS[k]}: {on ? 'Aan' : 'Uit'}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
