'use client';

import { useState } from 'react';

type Props = {
  open: boolean;
  onAccepted?: () => void;
};

export function LegalAcceptanceModal({ open, onAccepted }: Props) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

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
        throw new Error(json?.error || 'Het opslaan van de acceptatie is mislukt.');
      }

      onAccepted?.();
    } catch (err: any) {
      setError(err?.message || 'Er ging iets mis bij het opslaan van je akkoord.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-2xl font-semibold text-slate-900">
            Bevestig de juridische documenten
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Voor toegang tot het dashboard vragen wij je eenmalig akkoord te geven op de
            toepasselijke voorwaarden, privacyverklaring, verwerkersovereenkomst en disclaimer.
          </p>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-medium text-slate-900">Je gaat akkoord met:</div>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Algemene voorwaarden</li>
              <li>Privacyverklaring</li>
              <li>Verwerkersovereenkomst</li>
              <li>Disclaimer</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm leading-6 text-slate-700">
              Ik heb de documenten gelezen en ga akkoord met de voorwaarden voor het gebruik van
              het platform.
            </span>
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Dit akkoord wordt opgeslagen bij het account van de makelaar.
          </p>

          <button
            type="button"
            onClick={handleAccept}
            disabled={!checked || loading}
            className="inline-flex items-center justify-center rounded-2xl bg-[#102c54] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2545] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Akkoord opslaan…' : 'Akkoord en doorgaan'}
          </button>
        </div>
      </div>
    </div>
  );
}
