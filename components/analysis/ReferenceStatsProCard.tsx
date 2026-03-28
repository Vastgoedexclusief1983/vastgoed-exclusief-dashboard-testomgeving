'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Info, X, Gauge } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

type Stats = {
  avgPrice?: number | null;
  medianPrice?: number | null;
  avgPricePerM2?: number | null;
  medianPricePerM2?: number | null;
  minPricePerM2?: number | null;
  maxPricePerM2?: number | null;
  spreadPct?: number | null;
};

function formatEuro(value?: number | null) {
  if (typeof value !== 'number') return '—';
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNum(value?: number | null) {
  if (typeof value !== 'number') return '—';
  return new Intl.NumberFormat('nl-NL').format(value);
}

function safeNumber(n: unknown): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

export function ReferenceStatsProCard({
  stats,
  count,
}: {
  stats: Stats;
  count: number;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const chartData = [
    { name: 'Min', value: safeNumber(stats.minPricePerM2) },
    { name: 'Gem.', value: safeNumber(stats.avgPricePerM2) },
    { name: 'Mediaan', value: safeNumber(stats.medianPricePerM2) },
    { name: 'Max', value: safeNumber(stats.maxPricePerM2) },
  ];

  const rangeText =
    stats.minPricePerM2 != null && stats.maxPricePerM2 != null
      ? `${formatEuro(Math.round(stats.minPricePerM2))}/m² – ${formatEuro(Math.round(stats.maxPricePerM2))}/m²`
      : '—';

  const medianChip =
    stats.medianPricePerM2 != null
      ? `${formatEuro(Math.round(stats.medianPricePerM2))}/m²`
      : '—';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="relative" ref={wrapRef}>
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
            Marktstatistiek
          </div>

          <div className="mt-1 flex items-center gap-2">
            <div className="text-xl font-semibold tracking-tight text-slate-900">
              Referentie statistieken
            </div>

            {/* Info button */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50"
              aria-label="Toelichting referentie statistieken"
            >
              <Info className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          <div className="mt-2 text-sm text-slate-600">
            Premium samenvatting van de geselecteerde referenties (prijsniveau & spreiding).
          </div>

          {/* Tooltip panel (click) */}
          {open && (
            <div className="absolute left-0 z-30 mt-3 w-[380px] max-w-[calc(100vw-32px)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">
                  Toelichting (juridisch veilig)
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50"
                  aria-label="Sluit toelichting"
                >
                  <X className="h-4 w-4 text-slate-600" />
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed">
                <p>
                  <strong>Wat tonen deze referentiestatistieken?</strong>
                </p>

                <p>
                  De getoonde cijfers zijn gebaseerd op actuele{' '}
                  <strong>vraagprijzen van vergelijkbare woningen</strong> binnen
                  de geselecteerde straal en prijsklasse.
                </p>

                <p>
                  <strong>Mediaan €/m²</strong> vertegenwoordigt het centrale
                  prijsniveau binnen het segment en wordt doorgaans als
                  betrouwbaarder beschouwd dan het gemiddelde, omdat extreme
                  uitschieters minder invloed hebben.
                </p>

                <p>
                  <strong>Gemiddelde prijs</strong> kan hoger of lager uitvallen
                  door unieke objecten (bijv. waterfront, uitzonderlijke
                  afwerking of bijzondere ligging).
                </p>

                <p>
                  <strong>Min/Max</strong> tonen de bandbreedte van het huidige
                  aanbod en geven inzicht in het prijsbereik binnen dit
                  marktsegment.
                </p>

                <p>
                  <strong>Spreiding</strong> geeft aan hoe homogeen of heterogeen
                  het referentie-aanbod is. Een hogere spreiding betekent grotere
                  onderlinge verschillen tussen objecten.
                </p>

                <p>
                  De prijzen weerspiegelen het <strong>totale marktniveau</strong>{' '}
                  van vergelijkbare woningen en omvatten factoren zoals
                  woonoppervlakte, perceelgrootte, locatie, afwerkingsniveau en
                  marktdynamiek. Er wordt geen afzonderlijke splitsing gemaakt
                  tussen grond- en opstalwaarde.
                </p>

                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
                  Deze analyse betreft een marktindicatie op basis van
                  vraagprijsdata en vormt <strong>geen officiële taxatie</strong>{' '}
                  conform NWWI, NRVT of andere taxatiestandaarden. Aan deze
                  berekeningen kunnen geen rechten worden ontleend.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right badge */}
        <div className="text-right">
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            <Gauge className="h-3.5 w-3.5" />
            Pro
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{count}</span> referenties
          </div>
        </div>
      </div>

      {/* Top summary line */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                €/m² Positionering
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Range: <span className="font-semibold text-slate-800">{rangeText}</span>
              </div>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Mediaan:</span>{' '}
              <span className="font-semibold text-[#102c54]">{medianChip}</span>
            </div>
          </div>

          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={34}>
                <CartesianGrid strokeDasharray="4 6" />
                <XAxis dataKey="name" />
                <YAxis width={52} />
                <Tooltip
                  formatter={(v: any) => `${formatEuro(Number(v))}/m²`}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="value" fill="#102c54" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {stats.minPricePerM2 != null && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
                Min: {formatEuro(Math.round(stats.minPricePerM2))}/m²
              </span>
            )}
            {stats.avgPricePerM2 != null && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-900">
                Gem.: {formatEuro(Math.round(stats.avgPricePerM2))}/m²
              </span>
            )}
            {stats.maxPricePerM2 != null && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-900">
                Max: {formatEuro(Math.round(stats.maxPricePerM2))}/m²
              </span>
            )}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid gap-3">
          <KpiCard
            title="Gem. vraagprijs"
            value={formatEuro(stats.avgPrice)}
            tone="amber"
            subtitle="Premium indicatie"
          />
          <KpiCard
            title="Mediaan vraagprijs"
            value={formatEuro(stats.medianPrice)}
            tone="slate"
            subtitle="Premium indicatie"
          />
          <KpiCard
            title="Mediaan €/m²"
            value={
              stats.medianPricePerM2 != null
                ? `${formatEuro(Math.round(stats.medianPricePerM2))}/m²`
                : '—'
            }
            tone="blue"
            subtitle="Premium indicatie"
          />
          <KpiCard
            title="Spreiding (indicatief)"
            value={stats.spreadPct != null ? `${formatNum(stats.spreadPct)}%` : '—'}
            tone="green"
            subtitle="Hoe hoger, hoe heterogener aanbod"
          />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  tone: 'amber' | 'slate' | 'blue' | 'green';
}) {
  const toneMap: Record<string, string> = {
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    slate: 'border-slate-200 bg-slate-50 text-slate-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    green: 'border-green-200 bg-green-50 text-green-900',
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] font-semibold tracking-[0.18em] uppercase opacity-80">
          {title}
        </div>
        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      </div>

      <div className="mt-2 text-xl font-semibold tabular-nums text-slate-900">
        {value}
      </div>
      <div className="mt-1 text-xs opacity-80">{subtitle}</div>
    </div>
  );
}

