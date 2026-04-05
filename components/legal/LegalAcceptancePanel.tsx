'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

export function LegalAcceptancePanel() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (!checked || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/legal/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acceptTerms: true,
          acceptPrivacy: true,
          acceptDpa: true,
          acceptDisclaimer: true,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          json?.error || 'Het opslaan van de acceptatie is mislukt.'
        );
      }

      setCompleted(true);

      setTimeout(() => {
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Er ging iets mis bij het opslaan van je akkoord.');
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-emerald-900">
              Akkoord succesvol opgeslagen
            </p>
            <p className="mt-1 text-sm text-emerald-800">
              Je dashboard wordt ververst. Dit bevestigingsblok verdwijnt
              automatisch.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#102c54]" />
            <h3 className="font-semibold text-slate-900">
              Je geeft akkoord op:
            </h3>
          </div>

          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Algemene voorwaarden</li>
            <li>• Privacyverklaring</li>
            <li>• Disclaimer</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[#102c54]/10 bg-[#102c54]/[0.03] p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#102c54]" />
            <h3 className="font-semibold text-slate-900">
              Belangrijk om te weten
            </h3>
          </div>

          <p className="text-sm leading-6 text-slate-700">
            Dit akkoord wordt opgeslagen op het account van de makelaar. Je
            hoeft dit maar één keer te bevestigen.
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm leading-6 text-slate-700">
          Ik heb de documenten gelezen en ga akkoord met de voorwaarden voor
          het gebruik van het platform.
        </span>
      </label>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Na akkoord verdwijnt dit blok automatisch uit je dashboard.
        </p>

        <button
          type="button"
          onClick={handleAccept}
          disabled={!checked || loading}
          className="inline-flex items-center justify-center rounded-2xl bg-[#102c54] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2545] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Akkoord opslaan…' : 'Akkoord geven'}
        </button>
      </div>
    </div>
  );
}
