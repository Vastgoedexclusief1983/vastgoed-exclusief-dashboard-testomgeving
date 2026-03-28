// components/analysis/RefStatsAndAdvice.tsx
'use client';

import {
  ReferenceItem,
  TargetInput,
  computeRefStats,
  computeScenarios,
} from '@/lib/analysis/market';

function euro(n: number) {
  return `€${n.toLocaleString('nl-NL')}`;
}

export function RefStatsAndAdvice({
  target,
  references,
}: {
  target: TargetInput;
  references: ReferenceItem[];
}) {
  const stats = computeRefStats(references);

  const scenarios = computeScenarios({
    targetLivingAreaM2: target.livingAreaM2,
    refsMedianPricePerM2: stats.medianPricePerM2,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Stats */}
      <div className="rounded-2xl border bg-background p-4">
        <div className="text-lg font-semibold">Referentie statistieken</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Samenvatting van de geselecteerde referenties
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Stat label="Gem. vraagprijs" value={stats.avgPrice != null ? euro(stats.avgPrice) : '—'} />
          <Stat label="Mediaan vraagprijs" value={stats.medianPrice != null ? euro(stats.medianPrice) : '—'} />
          <Stat
            label="Gem. €/m²"
            value={stats.avgPricePerM2 != null ? `${euro(stats.avgPricePerM2)}/m²` : '—'}
          />
          <Stat
            label="Mediaan €/m²"
            value={stats.medianPricePerM2 != null ? `${euro(stats.medianPricePerM2)}/m²` : '—'}
          />
          <Stat
            label="Min €/m²"
            value={stats.minPricePerM2 != null ? `${euro(stats.minPricePerM2)}/m²` : '—'}
          />
          <Stat
            label="Max €/m²"
            value={stats.maxPricePerM2 != null ? `${euro(stats.maxPricePerM2)}/m²` : '—'}
          />
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Spreiding (indicatief): {stats.spreadPct != null ? `${stats.spreadPct}%` : '—'}
        </div>
      </div>

      {/* Advice */}
      <div className="rounded-2xl border bg-background p-4">
        <div className="text-lg font-semibold">Positioneringsadvies (3 scenario’s)</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Gebaseerd op mediaan €/m² referenties {stats.medianPricePerM2 != null ? `(${euro(stats.medianPricePerM2)}/m²)` : ''}
        </div>

        {!scenarios ? (
          <div className="mt-4 rounded-xl border p-3 text-sm text-muted-foreground">
            Vul minimaal <span className="font-medium text-foreground">woonoppervlakte</span> in om scenario’s te genereren.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <ScenarioCard
              title="Conservatief"
              badge="Sneller"
              ppm2={scenarios.conservatief.pricePerM2}
              total={scenarios.conservatief.total}
              note={scenarios.conservatief.toelichting}
            />
            <ScenarioCard
              title="Realistisch"
              badge="Markt"
              ppm2={scenarios.realistisch.pricePerM2}
              total={scenarios.realistisch.total}
              note={scenarios.realistisch.toelichting}
            />
            <ScenarioCard
              title="Ambitieus"
              badge="Max"
              ppm2={scenarios.ambitieus.pricePerM2}
              total={scenarios.ambitieus.total}
              note={scenarios.ambitieus.toelichting}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}

function ScenarioCard({
  title,
  badge,
  ppm2,
  total,
  note,
}: {
  title: string;
  badge: string;
  ppm2: number;
  total: number;
  note: string;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{note}</div>
        </div>
        <div className="rounded-lg border px-2 py-1 text-xs text-muted-foreground">{badge}</div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-muted p-2 text-sm">
          <div className="text-xs text-muted-foreground">€/m²</div>
          <div className="font-semibold">{euro(ppm2)}/m²</div>
        </div>
        <div className="rounded-lg bg-muted p-2 text-sm">
          <div className="text-xs text-muted-foreground">Totaal</div>
          <div className="font-semibold">{euro(total)}</div>
        </div>
      </div>
    </div>
  );
}
