// components/analysis/MarketSnapshot.tsx
'use client';

import {
  ReferenceItem,
  TargetInput,
  computeCompetitionLevel,
  computeMarketPosition,
  computeRefStats,
} from '@/lib/analysis/market';

function euro(n: number) {
  return `€${n.toLocaleString('nl-NL')}`;
}

function labelForPosition(pos: string) {
  switch (pos) {
    case 'onder_markt':
      return { title: 'Onder markt', desc: 'Relatief scherp t.o.v. referenties.' };
    case 'conform_markt':
      return { title: 'Conform markt', desc: 'In lijn met referenties.' };
    case 'boven_markt':
      return { title: 'Boven markt', desc: 'Kans op langere verkooptijd.' };
    case 'sterk_boven_markt':
      return { title: 'Sterk boven markt', desc: 'Hoog risico op overpricing.' };
    default:
      return { title: 'Onbekend', desc: 'Voeg evt. vraagprijs toe om dit te bepalen.' };
  }
}

export function MarketSnapshot({
  target,
  references,
}: {
  target: TargetInput;
  references: ReferenceItem[];
}) {
  const stats = computeRefStats(references);
  const competition = computeCompetitionLevel(references.length);

  const mp = computeMarketPosition({
    targetPrice: target.targetPrice,
    targetLivingAreaM2: target.livingAreaM2,
    refsMedianPricePerM2: stats.medianPricePerM2,
  });

  const pos = labelForPosition(mp.position);

  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Marktpositie snapshot</div>
          <div className="text-sm text-muted-foreground">
            {target.city ? `${target.city}${target.address ? ` • ${target.address}` : ''}` : '—'}
          </div>
        </div>

        <div className="rounded-lg border px-3 py-1 text-xs text-muted-foreground">
          Referenties: <span className="font-medium text-foreground">{references.length}</span> • Concurrentie:{' '}
          <span className="font-medium text-foreground">{competition.level}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {/* Marktpositie */}
        <div className="rounded-xl border p-3">
          <div className="text-xs text-muted-foreground">Marktpositie</div>
          <div className="mt-1 text-base font-semibold">{pos.title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{pos.desc}</div>
          {mp.deviationPct != null ? (
            <div className="mt-2 text-xs">
              Afwijking: <span className="font-medium">{mp.deviationPct}%</span>
            </div>
          ) : (
            <div className="mt-2 text-xs text-muted-foreground">
              Tip: voeg (optioneel) een vraagprijs toe voor positie-bepaling.
            </div>
          )}
        </div>

        {/* Median €/m² */}
        <div className="rounded-xl border p-3">
          <div className="text-xs text-muted-foreground">Mediaan prijs per m² (refs)</div>
          <div className="mt-1 text-base font-semibold">
            {stats.medianPricePerM2 != null ? `${euro(stats.medianPricePerM2)}/m²` : '—'}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Spreiding: {stats.spreadPct != null ? `${stats.spreadPct}%` : '—'}
          </div>
        </div>

        {/* Bandbreedte €/m² */}
        <div className="rounded-xl border p-3">
          <div className="text-xs text-muted-foreground">Bandbreedte €/m² (refs)</div>
          <div className="mt-1 text-base font-semibold">
            {stats.minPricePerM2 != null && stats.maxPricePerM2 != null
              ? `${euro(stats.minPricePerM2)} – ${euro(stats.maxPricePerM2)}`
              : '—'}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Indicatief op basis van referenties</div>
        </div>

        {/* Concurrentie */}
        <div className="rounded-xl border p-3">
          <div className="text-xs text-muted-foreground">Concurrentie</div>
          <div className="mt-1 text-base font-semibold">{competition.level}</div>
          <div className="mt-1 text-xs text-muted-foreground">{competition.hint}</div>
        </div>
      </div>
    </div>
  );
}
