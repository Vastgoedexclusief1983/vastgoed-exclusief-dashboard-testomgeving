'use client';

import React from 'react';
import { TrendingDown, Target, TrendingUp, Timer, Euro, Gauge, Sparkles } from 'lucide-react';

type ScenarioKey = 'conservative' | 'realistic' | 'ambitious';

export type Scenario = {
  key: ScenarioKey;
  title: string;
  badge: string;
  euroPerM2: number;   // €/m² scenario
  total: number;       // totaal scenario
  note: string;        // korte uitleg
  speedScore: number;  // 0-100 (verkoopsnelheid)
  yieldScore: number;  // 0-100 (opbrengst)
};

export function PositioningProCard({
  baseEuroPerM2,
  scenarios,
  spreadPct,
  referenceCount,
}: {
  baseEuroPerM2?: number | null; // median €/m² refs (voor context)
  scenarios: Scenario[];
  spreadPct?: number | null;     // uit computeRefStats (spreiding %)
  referenceCount?: number;       // references.length
}) {
  const safeRefCount = typeof referenceCount === 'number' ? referenceCount : scenarios?.length ?? 0;

  const recommendedKey = pickRecommendedScenario({
    spreadPct,
    referenceCount: safeRefCount,
  });

  const { certaintyScore, tightnessScore, label } = computeDynamisScores({
    spreadPct,
    referenceCount: safeRefCount,
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">Positioneringsadvies (3 scenario’s)</div>
          <div className="mt-1 text-xs text-slate-500">
            Gebaseerd op referenties {baseEuroPerM2 ? `(${formatEuro(Math.round(baseEuroPerM2))}/m²)` : ''}
            {typeof spreadPct === 'number' ? ` • Spreiding: ${Math.round(spreadPct)}%` : ''}
            {safeRefCount ? ` • Refs: ${safeRefCount}` : ''}
          </div>
        </div>

        <div className="text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
            <Gauge className="h-3.5 w-3.5" />
            Pro
          </span>
        </div>
      </div>

      {/* Dynamis mini-score (clean, optioneel maar pro) */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <Sparkles className="h-4 w-4 text-slate-700" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Dynamis-indicatie</div>
              <div className="text-xs text-slate-600">{label}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-600">Marktspanning</div>
            <div className="text-sm font-semibold tabular-nums text-slate-900">{tightnessScore}/100</div>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <MiniBar label="Zekerheid" score={certaintyScore} />
          <MiniBar label="Marktspanning" score={tightnessScore} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {scenarios.map((s) => {
          const ui = uiForScenario(s.key);
          const isRecommended = s.key === recommendedKey;

          return (
            <div
              key={s.key}
              className={[
                'relative overflow-hidden rounded-2xl border p-4',
                ui.cardBorder,
                ui.cardBg,
                // subtiele extra accent voor aanbevolen
                isRecommended ? 'ring-2 ring-slate-900/10 shadow-sm' : '',
              ].join(' ')}
            >
              {/* top accent */}
              <div className={`absolute left-0 top-0 h-1 w-full ${ui.accent}`} />

              {/* aanbevolen badge */}
              {isRecommended && (
                <div className="absolute right-3 top-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                    Aanbevolen
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl ${ui.iconBg}`}>
                    <ui.Icon className={`h-5 w-5 ${ui.iconText}`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ui.badge}`}>
                        {s.badge}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600">{s.note}</div>
                  </div>
                </div>
              </div>

              {/* totals (dominant) */}
              <div className="mt-4 rounded-xl bg-white/70 p-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Euro className="h-3.5 w-3.5" />
                    Indicatieve vraagprijs
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Target className="h-3.5 w-3.5" />
                    €/m²
                  </span>
                </div>

                <div className="mt-1 flex items-end justify-between gap-3">
                  <div className="text-lg font-bold text-slate-900 tabular-nums">{formatEuro(Math.round(s.total))}</div>
                  <div className="text-sm font-semibold text-slate-800 tabular-nums">
                    {formatEuro(Math.round(s.euroPerM2))}/m²
                  </div>
                </div>
              </div>

              {/* progress bars */}
              <div className="mt-4 space-y-3">
                <ScoreRow
                  icon={<Timer className="h-4 w-4" />}
                  label="Verkoopsnelheid"
                  value={clamp01(s.speedScore)}
                  barClass={ui.bar}
                />
                <ScoreRow
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Opbrengst"
                  value={clamp01(s.yieldScore)}
                  barClass={ui.bar}
                />
              </div>

              {/* micro footer */}
              <div className="mt-4 text-[11px] text-slate-500">
                Tip: kies {s.key === 'conservative' ? 'conservatief' : s.key === 'realistic' ? 'realistisch' : 'ambitieus'} bij{' '}
                {s.key === 'conservative'
                  ? 'snelle verkoop of hogere concurrentie.'
                  : s.key === 'realistic'
                    ? 'marktconforme positionering.'
                    : 'unieke woning en sterke presentatie.'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** ---------- Dynamis logic (simpel, stabiel, werkt direct) ---------- */
function pickRecommendedScenario({
  spreadPct,
  referenceCount,
}: {
  spreadPct?: number | null;
  referenceCount: number;
}): ScenarioKey {
  const spread = typeof spreadPct === 'number' ? spreadPct : null;
  const refs = Number.isFinite(referenceCount) ? referenceCount : 0;

  // Sterke markt: veel refs + lage spreiding
  if (refs >= 8 && (spread ?? 999) <= 22) return 'ambitious';

  // Normale markt: redelijke spreiding
  if ((spread ?? 999) <= 35) return 'realistic';

  // Onzeker/ruis: kies sneller/veiliger
  return 'conservative';
}

function computeDynamisScores({
  spreadPct,
  referenceCount,
}: {
  spreadPct?: number | null;
  referenceCount: number;
}) {
  const spread = typeof spreadPct === 'number' ? spreadPct : null;
  const refs = Number.isFinite(referenceCount) ? referenceCount : 0;

  // zekerheid: lager bij hoge spreiding, hoger bij meer refs
  const countScore = clamp(Math.round((refs / 12) * 100), 0, 100);
  const spreadScore = spread == null ? 55 : clamp(Math.round(100 - spread), 0, 100);
  const certaintyScore = clamp(Math.round(0.55 * spreadScore + 0.45 * countScore), 0, 100);

  // marktspanning: combinatie volume + lage spreiding
  const tightnessScore = clamp(Math.round(0.6 * countScore + 0.4 * spreadScore), 0, 100);

  const label =
    tightnessScore >= 70
      ? 'Sterke markt • meer ruimte voor ambitie'
      : tightnessScore >= 55
        ? 'Marktconform • balans is logisch'
        : 'Onzeker/variabel • conservatief is veiliger';

  return { certaintyScore, tightnessScore, label };
}

/** ---------- UI helpers ---------- */
function MiniBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-lg bg-white p-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-semibold tabular-nums text-slate-900">{score}/100</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-slate-200/70">
        <div className="h-2 rounded-full bg-slate-900/70" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ScoreRow({
  icon,
  label,
  value,
  barClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number; // 0..1
  barClass: string;
}) {
  const pct = Math.round(value * 100);

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span className="font-semibold tabular-nums text-slate-800">{pct}%</span>
      </div>

      <div className="mt-1 h-2 w-full rounded-full bg-slate-200/70">
        <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function uiForScenario(key: ScenarioKey) {
  if (key === 'conservative') {
    return {
      Icon: TrendingDown,
      cardBg: 'bg-amber-50/70',
      cardBorder: 'border-amber-200',
      accent: 'bg-amber-500',
      badge: 'bg-amber-200 text-amber-900',
      iconBg: 'bg-amber-500/15',
      iconText: 'text-amber-700',
      bar: 'bg-amber-600',
    };
  }

  if (key === 'ambitious') {
    return {
      Icon: TrendingUp,
      cardBg: 'bg-green-50/70',
      cardBorder: 'border-green-200',
      accent: 'bg-green-600',
      badge: 'bg-green-200 text-green-900',
      iconBg: 'bg-green-600/15',
      iconText: 'text-green-700',
      bar: 'bg-green-600',
    };
  }

  // realistic
  return {
    Icon: Target,
    cardBg: 'bg-blue-50/70',
    cardBorder: 'border-blue-200',
    accent: 'bg-[#102c54]',
    badge: 'bg-blue-200 text-blue-900',
    iconBg: 'bg-[#102c54]/10',
    iconText: 'text-[#102c54]',
    bar: 'bg-[#102c54]',
  };
}

function formatEuro(value?: number | null) {
  if (typeof value !== 'number') return '—';
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n / 100));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
