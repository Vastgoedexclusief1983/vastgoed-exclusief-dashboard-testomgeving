// app/(agent-dashboard)/ai-assistent/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { PositioningProCard } from '@/components/analysis/PositioningProCard';

import ReferenceMapGoogle from '@/components/ReferenceMapGoogle';
import { getPropertyTypeLabel } from '@/lib/utils/propertyTypeLabels';
import { Slider } from '@/components/ui/slider';

import { MarketSnapshot } from '@/components/analysis/MarketSnapshot';
import { ReferenceStatsProCard } from '@/components/analysis/ReferenceStatsProCard';

import {
  computeRefStats,
  computeScenarios,
  type ReferenceItem,
  type TargetInput,
} from '@/lib/analysis/market';

type PropertyMap = {
  lat: number | string | null;
  lng: number | string | null;
  level?: string;
  label?: string | null;
  city?: string | null;
};

type MatchBand = 'low' | 'mid' | 'high' | 'top';

type Property = {
  _id: string;
  title?: string;

  city?: string | null;
  address?: string | null;
  postalCode?: string | null;

  type?: string | null;
  price?: number | null;
  livingArea?: number | null;
  plotArea?: number | null;
  lotArea?: number | null;

  dimensions?: {
    plotArea?: number | null;
    lotArea?: number | null;
    livingArea?: number | null;
  } | null;

  luxuryTags?: string[];
  luxuryFeatures?: {
    amenities?: string[] | null;
    interior?: string[] | null;
    exterior?: string[] | null;
    views?: string[] | null;
    sustainability?: string[] | null;
    security?: string[] | null;
    wellness?: string[] | null;
    other?: string[] | null;
    [key: string]: unknown;
  } | null;

  match10?: number;
  matchBand?: MatchBand;
  distanceKm?: number;
  why?: string;

  map?: PropertyMap;
};

type LandInfo = {
  landPressureIndex: number | null;
  medianPricePerM2Living: number | null;
  plotWeightUsed: number | null;
};

type TargetCoords = { lat: number; lng: number; label?: string | null } | null;

type RefItem = {
  _id?: string;
  id?: string;
  title?: string;
  city?: string;
  place?: string;
  price?: number;
  basicInfo?: {
    title?: string;
    city?: string;
    basePrice?: number;
    price?: number;
  };
  map?: {
    lat: number | string | null;
    lng: number | string | null;
    label?: string | null;
    city?: string | null;
  };
};

function normalize(s: unknown) {
  return (s ?? '').toString().toLowerCase().trim().replace(/\s+/g, ' ');
}

function uniqueTags(values: unknown[]): string[] {
  return Array.from(
    new Set(
      values
        .map((v) => normalize(v))
        .filter((v) => v.length >= 2)
    )
  );
}

function parseLuxuryTags(input: string | Property | null | undefined): string[] {
  if (!input) return [];

  if (typeof input === 'string') {
    return uniqueTags(input.split(','));
  }

  if (Array.isArray(input.luxuryTags) && input.luxuryTags.length) {
    return uniqueTags(input.luxuryTags);
  }

  const lf = input.luxuryFeatures;
  if (!lf || typeof lf !== 'object') return [];

  const collected: unknown[] = [];

  for (const value of Object.values(lf)) {
    if (Array.isArray(value)) {
      collected.push(...value);
    } else if (typeof value === 'string') {
      collected.push(value);
    } else if (value === true) {
      // boolean flags zonder nette labelnaam slaan we hier over;
      // de backend zet luxeTags al om waar nodig
    }
  }

  return uniqueTags(collected);
}

function formatEuro(value?: number | null) {
  if (typeof value !== 'number') return '—';
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function toNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.trim().replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function matchBadgeClass(band?: MatchBand) {
  switch (band) {
    case 'top':
      return 'bg-green-600/15 text-green-700 border border-green-600/30';
    case 'high':
      return 'bg-blue-600/15 text-blue-700 border border-blue-600/30';
    case 'mid':
      return 'bg-amber-600/15 text-amber-700 border border-amber-600/30';
    default:
      return 'bg-red-600/15 text-red-700 border border-red-600/30';
  }
}

function pressureLabel(idx?: number | null) {
  if (typeof idx !== 'number') return '—';
  if (idx >= 0.7) return 'Hoog';
  if (idx >= 0.35) return 'Gemiddeld';
  return 'Laag';
}

function formatAddressLine(address?: string | null, postalCode?: string | null) {
  const a = (address ?? '').trim();
  const pc = (postalCode ?? '').trim();

  if (!a && !pc) return 'Adres onbekend';
  if (!a && pc) return `Adres onbekend, ${pc}`;
  if (!pc) return a;

  const aNorm = a.toUpperCase().replace(/\s+/g, '');
  const pcNorm = pc.toUpperCase().replace(/\s+/g, '');
  const hasPc = aNorm.includes(pcNorm);

  return hasPc ? a : `${a}, ${pc}`;
}

function toRefItem(p: Property): RefItem {
  const safeCity = p.city ?? undefined;

  return {
    _id: p._id,
    title: p.title ?? undefined,
    city: safeCity,
    price: typeof p.price === 'number' ? p.price : undefined,
    basicInfo: {
      title: p.title ?? undefined,
      city: safeCity,
      basePrice: typeof p.price === 'number' ? p.price : undefined,
      price: typeof p.price === 'number' ? p.price : undefined,
    },
    map: {
      lat: p?.map?.lat ?? null,
      lng: p?.map?.lng ?? null,
      label: p?.map?.label ?? null,
      city: p?.map?.city ?? (p.city ?? null),
    },
  };
}

function toReferenceItem(p: Property): ReferenceItem | null {
  const price = typeof p.price === 'number' ? p.price : null;
  const living =
    typeof p.livingArea === 'number'
      ? p.livingArea
      : typeof p.dimensions?.livingArea === 'number'
        ? p.dimensions.livingArea
        : null;

  if (!price || !living || living <= 0) return null;

  const plot =
    typeof p.plotArea === 'number'
      ? p.plotArea
      : typeof p.lotArea === 'number'
        ? p.lotArea
        : typeof p.dimensions?.plotArea === 'number'
          ? p.dimensions.plotArea
          : typeof p.dimensions?.lotArea === 'number'
            ? p.dimensions.lotArea
            : undefined;

  return {
    id: String(p._id),
    title: p.title ?? undefined,
    address: p.address ?? undefined,
    city: p.city ?? undefined,
    price,
    livingAreaM2: living,
    plotAreaM2: plot,
    luxuryTags: parseLuxuryTags(p),
    status: 'unknown',
    lat: typeof p.map?.lat === 'number' ? p.map.lat : undefined,
    lng: typeof p.map?.lng === 'number' ? p.map.lng : undefined,
  };
}

export default function AiAssistentPage() {
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [propertyType, setPropertyType] = useState<string>('');

  const [livingArea, setLivingArea] = useState<number | ''>('');
  const [plotArea, setPlotArea] = useState<number | ''>('');
  const [targetPrice, setTargetPrice] = useState<number | ''>('');

  const [luxuryFeatures, setLuxuryFeatures] = useState('');

  const [minListingPrice, setMinListingPrice] = useState<number>(1000000);
  const [radiusKm, setRadiusKm] = useState<number>(30);

  const tags = useMemo(() => parseLuxuryTags(luxuryFeatures), [luxuryFeatures]);

  const [references, setReferences] = useState<Property[]>([]);
  const [land, setLand] = useState<LandInfo | null>(null);
  const [targetCoords, setTargetCoords] = useState<TargetCoords>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsage, setAiUsage] = useState<{ count: number; limit: number } | null>(null);

  const PROPERTY_TYPE_OPTIONS: string[] = [
    '',
    'Apartment',
    'House',
    'Villa',
    'Townhouse',
    'Condo',
    'Land',
    'Commercial',
    'Penthouse',
  ];

  async function fetchReferences() {
    const cityTrim = city.trim();
    const addrTrim = address.trim();
    const pcTrim = postalCode.trim();

    const hasAnyLocationInput = Boolean(cityTrim || pcTrim || addrTrim);
    if (!hasAnyLocationInput) {
      setHasSearched(false);
      setReferences([]);
      setLand(null);
      setTargetCoords(null);
      setAiAdvice(null);
      setAiUsage(null);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setAiAdvice(null);
    setAiUsage(null);

    try {
      const params = new URLSearchParams({
        city: cityTrim,
        address: addrTrim,
        postalCode: pcTrim,
        type: propertyType || '',
        living: String(livingArea === '' ? '' : livingArea),
        plot: String(plotArea === '' ? '' : plotArea),
        tags: luxuryFeatures || '',
        radiusKm: String(radiusKm),
        limit: '60',
        minListingPrice: String(minListingPrice || 0),
      });

      const res = await fetch(`/api/ai/similar?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok || !data?.ok) throw new Error(data?.error || `API error (${res.status})`);

      const c = data?.center;
      if (c && typeof c.lat === 'number' && typeof c.lng === 'number') {
        setTargetCoords({ lat: c.lat, lng: c.lng, label: c.label ?? null });
      } else {
        setTargetCoords(null);
      }

      setLand(data?.land ?? null);
      setReferences(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      setError(e?.message || 'Fout bij ophalen referenties');
      setReferences([]);
      setLand(null);
      setTargetCoords(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAiAdvice() {
    setAiLoading(true);
    setAiAdvice(null);

    try {
      const res = await fetch('/api/ai/similar-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: {
            city: city.trim(),
            address: address.trim(),
            postalCode: postalCode.trim(),
            type: propertyType || null,
            livingArea: livingArea === '' ? null : livingArea,
            plotArea: plotArea === '' ? null : plotArea,
            targetPrice: targetPrice === '' ? null : targetPrice,
            tags,
            radiusKm,
            minListingPrice,
          },
          references: references.slice(0, 15),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'AI fout');

      setAiAdvice(data.text || '—');
      if (data.usage && typeof data.usage.count === 'number' && typeof data.usage.limit === 'number') {
        setAiUsage({ count: data.usage.count, limit: data.usage.limit });
      }
    } catch (err: any) {
      setAiAdvice(`Fout: ${err?.message || 'onbekend'}`);
    } finally {
      setAiLoading(false);
    }
  }

  const countText =
    !city.trim() && !postalCode.trim() && !address.trim()
      ? 'Vul minimaal stad of postcode/adres in'
      : loading
        ? 'Bezig met zoeken...'
        : hasSearched
          ? `${references.length} gevonden`
          : 'Klik op Toon referenties';

  const mapState = useMemo(() => {
    const total = (references || []).length;

    const itemsForMap: RefItem[] = (references || [])
      .map(toRefItem)
      .filter((it) => {
        const lat = toNum(it?.map?.lat);
        const lng = toNum(it?.map?.lng);
        return lat !== null && lng !== null;
      });

    return {
      total,
      plotted: itemsForMap.length,
      missing: total - itemsForMap.length,
      itemsForMap,
    };
  }, [references]);

  const targetForAnalysis: TargetInput = useMemo(() => {
    return {
      city: city.trim() || undefined,
      address: address.trim() || undefined,
      livingAreaM2: livingArea === '' ? undefined : Number(livingArea),
      plotAreaM2: plotArea === '' ? undefined : Number(plotArea),
      propertyType: propertyType || undefined,
      targetPrice: targetPrice === '' ? undefined : Number(targetPrice),
    };
  }, [city, address, livingArea, plotArea, propertyType, targetPrice]);

  const referenceItemsForAnalysis: ReferenceItem[] = useMemo(() => {
    return (references || [])
      .map(toReferenceItem)
      .filter((x): x is ReferenceItem => Boolean(x));
  }, [references]);

  const stats = useMemo(() => computeRefStats(referenceItemsForAnalysis), [referenceItemsForAnalysis]);

  const scenarios = useMemo(() => {
    const living = targetForAnalysis.livingAreaM2;
    const median = stats.medianPricePerM2;
    if (!living || !median) return null;

    return computeScenarios({
      targetLivingAreaM2: living,
      refsMedianPricePerM2: median,
    });
  }, [targetForAnalysis.livingAreaM2, stats.medianPricePerM2]);

  const positioningScenarios = useMemo(() => {
    if (!scenarios) return [];

    return [
      {
        key: 'conservative' as const,
        title: 'Conservatief',
        badge: 'Snelle verkoop',
        euroPerM2: scenarios.conservatief.pricePerM2,
        total: scenarios.conservatief.total,
        note: scenarios.conservatief.toelichting,
        speedScore: 85,
        yieldScore: 55,
      },
      {
        key: 'realistic' as const,
        title: 'Realistisch',
        badge: 'Markt',
        euroPerM2: scenarios.realistisch.pricePerM2,
        total: scenarios.realistisch.total,
        note: scenarios.realistisch.toelichting,
        speedScore: 70,
        yieldScore: 70,
      },
      {
        key: 'ambitious' as const,
        title: 'Ambitieus',
        badge: 'Maximale opbrengst',
        euroPerM2: scenarios.ambitieus.pricePerM2,
        total: scenarios.ambitieus.total,
        note: scenarios.ambitieus.toelichting,
        speedScore: 50,
        yieldScore: 88,
      },
    ];
  }, [scenarios]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Vastgoed Exclusief • AI
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-[#0f2747]">
              Waarde & Positionering
            </div>
            <div className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              Vul de gegevens van de <span className="font-medium text-slate-800">doelwoning</span> in. Haal referenties op en ontvang{' '}
              <span className="font-medium text-slate-800">positionering</span> en{' '}
              <span className="font-medium text-slate-800">marktstatistiek</span> op basis van de selectie.
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              Stad / plaats
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Bijv. Hoogerheide"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/15"
            />
            <div className="mt-2 text-xs leading-relaxed text-slate-500">
              Tip: voor de hoogste nauwkeurigheid vul <span className="font-medium text-slate-700">postcode + huisnummer</span> in.
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              Adres
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Bijv. Dorpsstraat 12"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/15"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              Postcode
            </label>
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Bijv. 4631AA"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/15"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              Woningtype
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/15"
            >
              {PROPERTY_TYPE_OPTIONS.map((typeKey) => (
                <option key={typeKey || 'empty'} value={typeKey}>
                  {typeKey ? getPropertyTypeLabel(typeKey) : '—'}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Kenmerken
            </div>
            <div className="text-base font-semibold tracking-tight text-slate-900">
              Doelwoning
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  Woonopp. (m²)
                </label>
                <input
                  type="number"
                  value={livingArea}
                  onChange={(e) => setLivingArea(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/15"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  Perceel (m²)
                </label>
                <input
                  type="number"
                  value={plotArea}
                  onChange={(e) => setPlotArea(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/15"
                />
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  Vraagprijs (optioneel)
                </label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Bijv. 1100000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/15"
                />
                <div className="mt-1 text-xs leading-relaxed text-slate-500">
                  Bepaalt marktpositie t.o.v. referenties (onder / conform / boven).
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs leading-relaxed text-slate-500">
              Matchscore (1–10) wordt berekend op basis van bovenstaande kenmerken.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Selectie
            </div>
            <div className="text-base font-semibold tracking-tight text-slate-900">
              Referentie filters
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Min. vraagprijs
              </label>
              <input
                type="number"
                value={minListingPrice}
                onChange={(e) => setMinListingPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/15"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  Zoekradius
                </span>
                <span className="text-xs font-semibold tabular-nums text-slate-900">
                  {radiusKm} km
                </span>
              </div>

              <div className="mt-2">
                <Slider value={[radiusKm]} min={5} max={100} step={5} onValueChange={(v) => setRadiusKm(v[0] ?? 30)} />
                <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                  <span>5 km</span>
                  <span>100 km</span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs leading-relaxed text-slate-500">
              Huidig: <span className="font-medium text-slate-700">{formatEuro(minListingPrice)}+</span> binnen{' '}
              <span className="font-medium text-slate-700">{radiusKm} km</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              Luxe kenmerken (komma-gescheiden)
            </label>
            <input
              value={luxuryFeatures}
              onChange={(e) => setLuxuryFeatures(e.target.value)}
              placeholder="Bijv. wellness, zwembad, domotica, gastenverblijf"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/15"
            />
            <div className="mt-2 text-xs leading-relaxed text-slate-500">
              Herkende tags: <span className="font-medium text-slate-700">{tags.length ? tags.join(', ') : '—'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="button"
            onClick={fetchReferences}
            disabled={loading}
            className="rounded-xl bg-[#102c54] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Zoeken...' : 'Toon referenties'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Resultaten
            </div>
            <div className="mt-1 text-xl font-semibold tracking-tight text-[#0f2747]">
              Referenties & analyse
            </div>
            <div className="mt-1 text-sm leading-relaxed text-slate-600">
              Vergelijkbare woningen binnen <span className="font-medium text-slate-800">{radiusKm} km</span> met matchscore (1–10).
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">{countText}</div>

            <button
              type="button"
              onClick={fetchAiAdvice}
              disabled={aiLoading || loading || !references.length}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-[#102c54] transition hover:bg-slate-50 disabled:opacity-50"
              title={!references.length ? 'Eerst referenties ophalen' : 'Laat AI uitleg en advies geven'}
            >
              {aiLoading ? 'AI bezig...' : 'AI advies'}
            </button>
          </div>
        </div>

        {aiUsage && (
          <div className="mb-3 text-xs text-slate-500">
            AI gebruikt: <span className="font-medium text-slate-700">{aiUsage.count}</span>/{aiUsage.limit} deze maand
          </div>
        )}

        {aiAdvice && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm whitespace-pre-wrap">
            {aiAdvice}
          </div>
        )}

        {!hasSearched && !loading && !error ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            Vul minimaal stad of postcode/adres in en klik op “Toon referenties”.
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Er ging iets mis: {error}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="space-y-6 xl:col-span-7">
                {hasSearched && !loading && referenceItemsForAnalysis.length > 0 && (
                  <div className="space-y-4">
                    <MarketSnapshot target={targetForAnalysis} references={referenceItemsForAnalysis} />

                    {stats.medianPricePerM2 && positioningScenarios.length > 0 && (
                      <PositioningProCard baseEuroPerM2={stats.medianPricePerM2} scenarios={positioningScenarios} />
                    )}

                    <ReferenceStatsProCard stats={stats} count={referenceItemsForAnalysis.length} />
                  </div>
                )}

                {land && hasSearched && !loading && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Locatie
                        </div>
                        <div className="mt-1 text-base font-semibold tracking-tight text-slate-900">
                          Locatiedruk (grond) binnen {radiusKm} km
                        </div>
                        <div className="mt-1 text-xs leading-relaxed text-slate-600">
                          Indicatief op basis van mediane vraagprijs per m² woonopp. van referenties.
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-semibold text-slate-900">{pressureLabel(land.landPressureIndex)}</div>
                        <div className="mt-1 text-xs text-slate-600">
                          Mediaan:{' '}
                          {land.medianPricePerM2Living
                            ? `${formatEuro(Math.round(land.medianPricePerM2Living))} / m²`
                            : '—'}
                          {typeof land.plotWeightUsed === 'number'
                            ? ` • perceel-gewicht: ${Math.round(land.plotWeightUsed * 100)}%`
                            : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="xl:col-span-5">
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Overzicht
                    </div>
                    <div className="mt-1 text-base font-semibold tracking-tight text-slate-900">
                      Kaart
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-slate-600">
                      Resultaten: {mapState.total} — Geplot: {mapState.plotted} — Zonder coords: {mapState.missing}
                    </div>

                    {hasSearched && !loading && mapState.plotted === 0 && (
                      <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                        Geen kaartpunten om te plotten. Meestal missen lat/lng in referenties (of parsing faalt).
                      </div>
                    )}

                    {hasSearched && (
                      <div className="mt-2 text-[11px] text-slate-500">
                        Doelwoning coords (PDOK):{' '}
                        {targetCoords ? `${targetCoords.lat.toFixed(5)}, ${targetCoords.lng.toFixed(5)}` : '—'}
                        {targetCoords?.label ? ` • ${targetCoords.label}` : ''}
                      </div>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <ReferenceMapGoogle
                      items={mapState.itemsForMap}
                      height={520}
                      debug={false}
                      center={
                        targetCoords
                          ? {
                              lat: targetCoords.lat,
                              lng: targetCoords.lng,
                              label: (targetCoords.label ?? city.trim()) || 'Doelwoning',
                            }
                          : null
                      }
                      radiusKm={radiusKm}
                      showRadiusSlider={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Referenties
                </div>
                <div className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Referentiewoningen
                </div>
                <div className="mt-1 text-sm leading-relaxed text-slate-600">
                  <span className="font-medium text-slate-800">{references.length}</span> resultaten • matchscore (1–10) • radius{' '}
                  <span className="font-medium text-slate-800">{radiusKm} km</span>
                </div>
              </div>

              {!loading && hasSearched && references.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  Geen referenties gevonden binnen {radiusKm} km. Probeer andere luxe-tags of een lagere minimumprijs.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {references.map((p) => {
                    const plot =
                      typeof p.plotArea === 'number'
                        ? p.plotArea
                        : typeof p.lotArea === 'number'
                          ? p.lotArea
                          : typeof p.dimensions?.plotArea === 'number'
                            ? p.dimensions.plotArea
                            : typeof p.dimensions?.lotArea === 'number'
                              ? p.dimensions.lotArea
                              : null;

                    const shownLiving =
                      typeof p.livingArea === 'number'
                        ? p.livingArea
                        : typeof p.dimensions?.livingArea === 'number'
                          ? p.dimensions.livingArea
                          : null;

                    const tagsToShow = parseLuxuryTags(p).slice(0, 6);
                    const typeLabel = p.type ? getPropertyTypeLabel(p.type) : '';

                    return (
                      <div
                        key={p._id}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="truncate text-base font-semibold text-slate-900">
                              {p.title || 'Referentiewoning'}
                            </div>
                            <div className="mt-1 truncate text-sm text-slate-600">
                              {formatAddressLine(p.address, p.postalCode)}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {p.city || '—'}
                              {typeof p.distanceKm === 'number' ? ` • ${p.distanceKm.toFixed(1)} km` : ''}
                              {typeLabel ? ` • ${typeLabel}` : ''}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-base font-semibold tabular-nums text-slate-900">
                              {formatEuro(p.price ?? null)}
                            </div>
                            <div
                              className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${matchBadgeClass(
                                p.matchBand
                              )}`}
                              title={p.why || 'Matchscore 1–10 (10 = beste match)'}
                            >
                              Match {typeof p.match10 === 'number' ? p.match10 : 1}/10
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Woonopp.
                            </div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">
                              {typeof shownLiving === 'number' ? `${shownLiving} m²` : '—'}
                            </div>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Perceel
                            </div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">
                              {typeof plot === 'number' ? `${plot} m²` : '—'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 text-xs leading-relaxed text-slate-600">
                          {p.why ? `Waarom matcht dit: ${p.why}` : 'Waarom matcht dit: —'}
                        </div>

                        <div className="mt-4">
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Luxe-tags
                          </div>

                          {tagsToShow.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {tagsToShow.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-1 text-sm text-slate-500">—</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
