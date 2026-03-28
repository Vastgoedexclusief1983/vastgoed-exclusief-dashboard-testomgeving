'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

type AcceptPayload = {
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptDpa: boolean;
};

export default function LegalAcceptPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = sp.get('next') || '/dashboard';

  const [state, setState] = useState<AcceptPayload>({
    acceptTerms: false,
    acceptPrivacy: false,
    acceptDpa: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => state.acceptTerms && state.acceptPrivacy && state.acceptDpa,
    [state]
  );

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/legal/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || 'Acceptatie mislukt.');
      }

      router.replace(nextUrl);
    } catch (e: any) {
      setError(e?.message || 'Er ging iets mis.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Bevestiging documenten
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Om het Vastgoed Exclusief Dashboard te gebruiken, vragen we je om onderstaande documenten te accepteren.
          Dit wordt vastgelegd bij je account (datum/tijd en documentversies).
        </p>

        <div className="mt-6 space-y-4">
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={state.acceptTerms}
              onChange={(e) => setState((s) => ({ ...s, acceptTerms: e.target.checked }))}
            />
            <span className="text-sm text-slate-700">
              Ik ga akkoord met de{' '}
              <Link className="underline" href="/legal/voorwaarden" target="_blank">
                Algemene Voorwaarden
              </Link>
              .
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={state.acceptPrivacy}
              onChange={(e) => setState((s) => ({ ...s, acceptPrivacy: e.target.checked }))}
            />
            <span className="text-sm text-slate-700">
              Ik heb de{' '}
              <Link className="underline" href="/legal/privacy" target="_blank">
                Privacyverklaring
              </Link>{' '}
              gelezen.
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={state.acceptDpa}
              onChange={(e) => setState((s) => ({ ...s, acceptDpa: e.target.checked }))}
            />
            <span className="text-sm text-slate-700">
              Ik accepteer de{' '}
              <Link className="underline" href="/legal/verwerkersovereenkomst" target="_blank">
                Verwerkersovereenkomst
              </Link>
              .
            </span>
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link className="text-sm text-slate-600 underline hover:text-slate-900" href={nextUrl}>
            Annuleren
          </Link>
          <Button type="button" disabled={!canSubmit || submitting} onClick={submit}>
            {submitting ? 'Opslaan…' : 'Akkoord en doorgaan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
