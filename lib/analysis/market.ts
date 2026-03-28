// lib/analysis/market.ts
export type ReferenceItem = {
  id: string;
  title?: string;
  address?: string;
  city?: string;

  price: number; // vraagprijs of transactieprijs
  livingAreaM2: number; // woonoppervlakte
  plotAreaM2?: number; // perceel
  luxuryTags?: string[]; // luxe-tags zoals zwembad, gym, wellness, etc.
  status?: 'for_sale' | 'sold' | 'unknown';
  daysOnMarket?: number; // optioneel

  // optioneel (als jij ze hebt)
  lat?: number;
  lng?: number;
};

export type TargetInput = {
  city?: string;
  address?: string;
  livingAreaM2?: number;
  plotAreaM2?: number;
  propertyType?: string;

  // optioneel: als je ergens een vraagprijs veld toevoegt
  targetPrice?: number;
};

export type RefStats = {
  count: number;
  avgPrice: number | null;
  medianPrice: number | null;
  avgPricePerM2: number | null;
  medianPricePerM2: number | null;
  minPricePerM2: number | null;
  maxPricePerM2: number | null;
  spreadPct: number | null; // (max-min)/median
};

export type MarketPosition =
  | 'onder_markt'
  | 'conform_markt'
  | 'boven_markt'
  | 'sterk_boven_markt'
  | 'onbekend';

export type ScenarioAdvice = {
  conservatief: { pricePerM2: number; total: number; toelichting: string };
  realistisch: { pricePerM2: number; total: number; toelichting: string };
  ambitieus: { pricePerM2: number; total: number; toelichting: string };
};

function median(nums: number[]) {
  if (!nums.length) return null;
  const arr = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
}

function safeNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

export function pricePerM2(ref: ReferenceItem): number | null {
  if (!safeNumber(ref.price) || !safeNumber(ref.livingAreaM2) || ref.livingAreaM2 <= 0) return null;
  return ref.price / ref.livingAreaM2;
}

export function computeRefStats(refs: ReferenceItem[]): RefStats {
  const valid = refs
    .map((r) => ({
      price: r.price,
      ppm2: pricePerM2(r),
    }))
    .filter((x) => safeNumber(x.price) && safeNumber(x.ppm2)) as { price: number; ppm2: number }[];

  if (!valid.length) {
    return {
      count: refs.length,
      avgPrice: null,
      medianPrice: null,
      avgPricePerM2: null,
      medianPricePerM2: null,
      minPricePerM2: null,
      maxPricePerM2: null,
      spreadPct: null,
    };
  }

  const prices = valid.map((v) => v.price);
  const ppm2s = valid.map((v) => v.ppm2);

  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const avgPpm2 = ppm2s.reduce((a, b) => a + b, 0) / ppm2s.length;

  const medPrice = median(prices);
  const medPpm2 = median(ppm2s);

  const minPpm2 = Math.min(...ppm2s);
  const maxPpm2 = Math.max(...ppm2s);

  const spreadPct =
    medPpm2 && medPpm2 > 0 ? (maxPpm2 - minPpm2) / medPpm2 : null;

  return {
    count: refs.length,
    avgPrice: Math.round(avgPrice),
    medianPrice: medPrice ? Math.round(medPrice) : null,
    avgPricePerM2: Math.round(avgPpm2),
    medianPricePerM2: medPpm2 ? Math.round(medPpm2) : null,
    minPricePerM2: Math.round(minPpm2),
    maxPricePerM2: Math.round(maxPpm2),
    spreadPct: spreadPct != null ? Math.round(spreadPct * 100) : null,
  };
}

export function computeMarketPosition(params: {
  targetPrice?: number;
  targetLivingAreaM2?: number;
  refsMedianPricePerM2: number | null;
}): { position: MarketPosition; deviationPct: number | null; targetPricePerM2: number | null } {
  const { targetPrice, targetLivingAreaM2, refsMedianPricePerM2 } = params;

  if (!safeNumber(targetPrice) || !safeNumber(targetLivingAreaM2) || targetLivingAreaM2 <= 0) {
    return { position: 'onbekend', deviationPct: null, targetPricePerM2: null };
  }
  const targetPpm2 = targetPrice / targetLivingAreaM2;

  if (!refsMedianPricePerM2 || refsMedianPricePerM2 <= 0) {
    return { position: 'onbekend', deviationPct: null, targetPricePerM2: Math.round(targetPpm2) };
  }

  const deviation = (targetPpm2 - refsMedianPricePerM2) / refsMedianPricePerM2;
  const deviationPct = Math.round(deviation * 100);

  let position: MarketPosition = 'conform_markt';
  if (deviation < -0.05) position = 'onder_markt';
  else if (deviation <= 0.05) position = 'conform_markt';
  else if (deviation <= 0.15) position = 'boven_markt';
  else position = 'sterk_boven_markt';

  return { position, deviationPct, targetPricePerM2: Math.round(targetPpm2) };
}

export function computeScenarios(params: {
  targetLivingAreaM2?: number;
  refsMedianPricePerM2: number | null;
}): ScenarioAdvice | null {
  const { targetLivingAreaM2, refsMedianPricePerM2 } = params;

  if (!safeNumber(targetLivingAreaM2) || targetLivingAreaM2 <= 0 || !refsMedianPricePerM2) return null;

  const base = refsMedianPricePerM2;

  const conservatief = Math.round(base * 0.95);
  const realistisch = Math.round(base * 1.0);
  const ambitieus = Math.round(base * 1.1);

  return {
    conservatief: {
      pricePerM2: conservatief,
      total: Math.round(conservatief * targetLivingAreaM2),
      toelichting: 'Snellere verkoopkans; aantrekkelijker t.o.v. concurrentie.',
    },
    realistisch: {
      pricePerM2: realistisch,
      total: Math.round(realistisch * targetLivingAreaM2),
      toelichting: 'Marktconform; balans tussen opbrengst en verkoopsnelheid.',
    },
    ambitieus: {
      pricePerM2: ambitieus,
      total: Math.round(ambitieus * targetLivingAreaM2),
      toelichting: 'Maximale opbrengst; kans op langere looptijd en meer onderhandelingen.',
    },
  };
}

export function computeCompetitionLevel(refCount: number) {
  if (refCount < 5) return { level: 'Laag', hint: 'Weinig vergelijkbaar aanbod; sterk in positionering.', code: 'low' as const };
  if (refCount <= 12) return { level: 'Gemiddeld', hint: 'Normale concurrentie; scherp presenteren en goed prijsniveau.', code: 'mid' as const };
  return { level: 'Hoog', hint: 'Veel vergelijkbaar aanbod; prijsstrategie en onderscheid zijn cruciaal.', code: 'high' as const };
}
