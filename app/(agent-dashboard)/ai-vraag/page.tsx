'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type Bandbreedte = {
  laag: number | null;
  midden: number | null;
  hoog: number | null;
  toelichting: string;
};

type PricePerM2 = {
  min: number;
  max: number;
  regioKey: string | null;
  toelichting: string;
};

type AiResult = {
  samenvatting: string;
  bandbreedte: Bandbreedte;
  prijsPerM2: PricePerM2;
  aannames: string[];
  gevoeligheden: string[];
  benodigdeAanvullendeInfo: string[];
  disclaimer: string;
};

type ApiResponse = {
  ok: boolean;
  model: string;
  year: number;
  regionKey: string | null;
  marketBand?: { min: number; max: number; note?: string };
  usage?: { count?: number; limit?: number; remaining?: number; period?: string };
  result?: AiResult;
  answer?: string;
  raw?: string;
  error?: string;
  details?: any;
};

type QuickActionType = 'basisprijs' | 'bandbreedte' | 'm2' | 'strategie' | 'check';

type PropertyTypeValue =
  | 'appartement'
  | 'tussenwoning'
  | 'hoekwoning'
  | '2-onder-1-kap'
  | 'vrijstaand'
  | 'villa'
  | 'recreatie'
  | '';

type FinishLevelValue = 'opknapper' | 'gemiddeld' | 'hoog' | 'top' | '';

type ExistingProperty = {
  id: string;
  propertyCode?: string;
  title: string;
  address: string;
  city: string;
  neighborhood: string;
  propertyType: PropertyTypeValue;
  woonoppervlakteM2: number | null;
  perceelM2: number | null;
  bouwjaar: number | null;
  energielabel: string;
  finishLevel: FinishLevelValue;
  askingPrice: number | null;
  basePrice: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function euro(n: number) {
  return `€${n.toLocaleString('nl-NL')}`;
}

function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/\./g, '').replace(',', '.').trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function firstNonEmptyString(...values: unknown[]) {
  for (const value of values) {
    const v = toTrimmedString(value);
    if (v) return v;
  }
  return '';
}

function normalizePropertyType(value: unknown): PropertyTypeValue {
  const raw = toTrimmedString(value).toLowerCase();

  if (!raw) return '';

  if (raw.includes('appartement') || raw === 'apartment' || raw === 'condo') {
    return 'appartement';
  }

  if (raw.includes('tussen')) return 'tussenwoning';
  if (raw.includes('hoek')) return 'hoekwoning';
  if (
    raw.includes('2-onder-1-kap') ||
    raw.includes('twee-onder-een-kap') ||
    raw.includes('semi-detached')
  ) {
    return '2-onder-1-kap';
  }

  if (raw.includes('villa')) return 'villa';
  if (raw.includes('recreatie') || raw.includes('recreation')) return 'recreatie';
  if (raw.includes('vrijstaand') || raw === 'house' || raw === 'detached') return 'vrijstaand';

  return '';
}

function normalizeFinishLevel(value: unknown): FinishLevelValue {
  const raw = toTrimmedString(value).toLowerCase();

  if (!raw) return '';
  if (raw.includes('opknap')) return 'opknapper';
  if (raw.includes('gemidd')) return 'gemiddeld';
  if (raw.includes('hoog')) return 'hoog';
  if (raw.includes('top')) return 'top';

  return '';
}

function getFinishLabel(value: string) {
  switch (value) {
    case 'opknapper':
      return 'Opknapper';
    case 'gemiddeld':
      return 'Gemiddeld';
    case 'hoog':
      return 'Hoog';
    case 'top':
      return 'Topsegment';
    default:
      return 'Niet opgegeven';
  }
}

function getPropertyTypeLabel(value: string) {
  switch (value) {
    case 'appartement':
      return 'Appartement';
    case 'tussenwoning':
      return 'Tussenwoning';
    case 'hoekwoning':
      return 'Hoekwoning';
    case '2-onder-1-kap':
      return '2-onder-1-kap';
    case 'vrijstaand':
      return 'Vrijstaand';
    case 'villa':
      return 'Villa';
    case 'recreatie':
      return 'Recreatie';
    default:
      return 'Niet opgegeven';
  }
}

function normalizeExistingProperty(raw: any): ExistingProperty | null {
  if (!raw || typeof raw !== 'object') return null;

  const basicInfo = raw.basicInfo ?? {};
  const dimensions = raw.dimensions ?? {};
  const valuation = raw.valuation ?? {};
  const location = basicInfo.location ?? {};
  const addressObj = basicInfo.address ?? {};

  const id =
    toTrimmedString(raw._id) ||
    toTrimmedString(raw.id) ||
    toTrimmedString(raw.propertyId) ||
    toTrimmedString(raw.propertyCode);

  if (!id) return null;

  const address =
    firstNonEmptyString(
      basicInfo.addressLine,
      basicInfo.streetAndNumber,
      basicInfo.fullAddress,
      basicInfo.address,
      addressObj.full,
      [addressObj.street, addressObj.houseNumber].filter(Boolean).join(' ').trim(),
      raw.address
    ) || '';

  const city =
    firstNonEmptyString(location.city, basicInfo.city, raw.city, location.town, location.place) || '';

  const neighborhood =
    firstNonEmptyString(location.neighborhood, basicInfo.neighborhood, raw.neighborhood, location.district) || '';

  const propertyType = normalizePropertyType(
    basicInfo.propertyType ?? raw.propertyType ?? basicInfo.type ?? raw.type
  );

  const woonoppervlakteM2 =
    safeNumber(
      dimensions.livingArea ??
        dimensions.livingAreaM2 ??
        dimensions.woonoppervlakte ??
        raw.woonoppervlakteM2 ??
        raw.livingArea
    ) ?? null;

  const perceelM2 =
    safeNumber(
      dimensions.plotArea ??
        dimensions.lotArea ??
        dimensions.perceeloppervlakte ??
        raw.perceelM2 ??
        raw.plotArea
    ) ?? null;

  const bouwjaar =
    safeNumber(
      basicInfo.yearBuilt ??
        basicInfo.buildYear ??
        raw.bouwjaar ??
        raw.yearBuilt
    ) ?? null;

  const energielabel = firstNonEmptyString(
    basicInfo.energyLabel,
    basicInfo.energielabel,
    raw.energielabel,
    raw.energyLabel
  );

  const finishLevel = normalizeFinishLevel(
    basicInfo.finishLevel ??
      raw.finishLevel ??
      basicInfo.afwerkingsniveau ??
      raw.afwerkingsniveau ??
      valuation.finishLevel
  );

  const askingPrice =
    safeNumber(
      valuation.askingPrice ??
        valuation.basePrice ??
        basicInfo.basePrice ??
        raw.price ??
        raw.askingPrice
    ) ?? null;

  const basePrice =
    safeNumber(
      valuation.basePrice ??
        raw.basePrice ??
        valuation.indicativeBasePrice
    ) ?? null;

  const title =
    firstNonEmptyString(
      raw.title,
      basicInfo.title,
      address,
      raw.propertyCode
    ) || 'Woning';

  return {
    id,
    propertyCode: toTrimmedString(raw.propertyCode),
    title,
    address,
    city,
    neighborhood,
    propertyType,
    woonoppervlakteM2,
    perceelM2,
    bouwjaar,
    energielabel,
    finishLevel,
    askingPrice,
    basePrice,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
}

function compareAreaScore(target: number | null, candidate: number | null) {
  if (!target || !candidate) return 0.5;
  const diffRatio = Math.abs(candidate - target) / Math.max(target, 1);
  return clamp(1 - diffRatio, 0, 1);
}

function compareYearScore(target: number | null, candidate: number | null) {
  if (!target || !candidate) return 0.5;
  const diff = Math.abs(candidate - target);
  return clamp(1 - diff / 40, 0, 1);
}

function compareExactTextScore(target: string, candidate: string) {
  if (!target || !candidate) return 0.5;
  return target.trim().toLowerCase() === candidate.trim().toLowerCase() ? 1 : 0;
}

function compareContainsTextScore(target: string, candidate: string) {
  if (!target || !candidate) return 0.5;

  const a = target.trim().toLowerCase();
  const b = candidate.trim().toLowerCase();

  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.8;
  return 0;
}

function computeComparisonScore(
  input: {
    city: string;
    neighborhood: string;
    propertyType: PropertyTypeValue;
    woonoppervlakteM2: number | null;
    perceelM2: number | null;
    bouwjaar: number | null;
    finishLevel: FinishLevelValue;
  },
  property: ExistingProperty
) {
  const cityScore = compareExactTextScore(input.city, property.city);
  const neighborhoodScore = compareContainsTextScore(input.neighborhood, property.neighborhood);
  const typeScore =
    input.propertyType && property.propertyType
      ? input.propertyType === property.propertyType
        ? 1
        : 0
      : 0.5;
  const woonScore = compareAreaScore(input.woonoppervlakteM2, property.woonoppervlakteM2);
  const perceelScore = compareAreaScore(input.perceelM2, property.perceelM2);
  const bouwjaarScore = compareYearScore(input.bouwjaar, property.bouwjaar);
  const finishScore =
    input.finishLevel && property.finishLevel
      ? input.finishLevel === property.finishLevel
        ? 1
        : 0.2
      : 0.5;

  const weighted =
    cityScore * 0.3 +
    neighborhoodScore * 0.1 +
    typeScore * 0.2 +
    woonScore * 0.2 +
    perceelScore * 0.08 +
    bouwjaarScore * 0.06 +
    finishScore * 0.06;

  return Math.round(weighted * 100);
}

function scoreBadgeClass(score: number) {
  if (score >= 85) return 'bg-emerald-100 text-emerald-700';
  if (score >= 70) return 'bg-blue-100 text-blue-700';
  if (score >= 55) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

export default function AiVraagPage() {
  const [question, setQuestion] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyTypeValue>('');
  const [woonoppervlakteM2, setWoonoppervlakteM2] = useState<string>('');
  const [perceelM2, setPerceelM2] = useState<string>('');
  const [bouwjaar, setBouwjaar] = useState<string>('');
  const [energielabel, setEnergielabel] = useState<string>('');
  const [finishLevel, setFinishLevel] = useState<FinishLevelValue>('');

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);

  const [existingProperties, setExistingProperties] = useState<ExistingProperty[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [comparePropertyIds, setComparePropertyIds] = useState<string[]>([]);

  const selectedProperty = useMemo(
    () => existingProperties.find((item) => item.id === selectedPropertyId) ?? null,
    [existingProperties, selectedPropertyId]
  );

  const compareProperties = useMemo(
    () =>
      comparePropertyIds
        .map((id) => existingProperties.find((item) => item.id === id))
        .filter(Boolean) as ExistingProperty[],
    [comparePropertyIds, existingProperties]
  );

  const remaining = data?.usage?.remaining ?? null;
  const limit = data?.usage?.limit ?? null;
  const used = data?.usage?.count ?? null;

  useEffect(() => {
    let cancelled = false;

    async function loadExistingProperties() {
      setIsLoadingExisting(true);

      try {
        const res = await fetch('/api/properties/mine?limit=100', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!res.ok) {
          return;
        }

        const json = await res.json();
        const list = Array.isArray(json)
          ? json
          : Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.properties)
          ? json.properties
          : [];

        const normalized = list
          .map(normalizeExistingProperty)
          .filter(Boolean) as ExistingProperty[];

        if (!cancelled) {
          setExistingProperties(normalized);
        }
      } catch {
        // stil terugvallen zodat de pagina nooit stukloopt
      } finally {
        if (!cancelled) {
          setIsLoadingExisting(false);
        }
      }
    }

    loadExistingProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  const inputWoon = useMemo(() => safeNumber(woonoppervlakteM2), [woonoppervlakteM2]);
  const inputPerceel = useMemo(() => safeNumber(perceelM2), [perceelM2]);
  const inputBouwjaar = useMemo(() => safeNumber(bouwjaar), [bouwjaar]);

  const qualityItems = useMemo(
    () => [
      { label: 'Plaats', done: Boolean(city.trim()), weight: 18 },
      { label: 'Woningtype', done: Boolean(propertyType), weight: 18 },
      { label: 'Woonoppervlakte', done: Boolean(woonoppervlakteM2.trim()), weight: 22 },
      { label: 'Perceel', done: Boolean(perceelM2.trim()), weight: 10 },
      { label: 'Bouwjaar', done: Boolean(bouwjaar.trim()), weight: 8 },
      { label: 'Energielabel', done: Boolean(energielabel.trim()), weight: 6 },
      { label: 'Afwerkingsniveau', done: Boolean(finishLevel), weight: 10 },
      { label: 'Adres / buurt', done: Boolean(address.trim() || neighborhood.trim()), weight: 8 },
    ],
    [address, bouwjaar, city, energielabel, finishLevel, neighborhood, perceelM2, propertyType, woonoppervlakteM2]
  );

  const qualityScore = useMemo(() => {
    const total = qualityItems.reduce((sum, item) => sum + item.weight, 0);
    const done = qualityItems.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return Math.round((done / total) * 100);
  }, [qualityItems]);

  const qualityMessage = useMemo(() => {
    if (qualityScore >= 85) {
      return 'Sterke invoer. De indicatie kan beter aansluiten op vergelijkbare woningen en prijs per m².';
    }
    if (qualityScore >= 65) {
      return 'Goede basis. Met extra gegevens zoals perceel, bouwjaar en afwerking wordt de indicatie scherper.';
    }
    return 'De invoer is nog beperkt. Vul minimaal plaats, woningtype en woonoppervlakte in voor een bruikbare indicatie.';
  }, [qualityScore]);

  const accuracyHint = useMemo(() => {
    const missing: string[] = [];
    if (!city.trim()) missing.push('plaats');
    if (!woonoppervlakteM2.trim()) missing.push('woonoppervlakte');
    if (!propertyType) missing.push('woningtype');
    if (!finishLevel) missing.push('afwerkingsniveau');
    if (!perceelM2.trim()) missing.push('perceel');
    return missing.slice(0, 4);
  }, [city, woonoppervlakteM2, propertyType, finishLevel, perceelM2]);

  const hasEnoughInputForIndicatie = useMemo(() => {
    return Boolean(city.trim() && woonoppervlakteM2.trim() && propertyType);
  }, [city, woonoppervlakteM2, propertyType]);

  const estimatedMiddenPrijs = useMemo(() => {
    const midden = data?.result?.bandbreedte?.midden;
    if (typeof midden === 'number') return midden;

    const laag = data?.result?.bandbreedte?.laag;
    const hoog = data?.result?.bandbreedte?.hoog;
    if (typeof laag === 'number' && typeof hoog === 'number') {
      return Math.round((laag + hoog) / 2);
    }

    return null;
  }, [data]);

  const suggestedComparables = useMemo(() => {
    const input = {
      city: city.trim(),
      neighborhood: neighborhood.trim(),
      propertyType,
      woonoppervlakteM2: inputWoon,
      perceelM2: inputPerceel,
      bouwjaar: inputBouwjaar,
      finishLevel,
    };

    return existingProperties
      .filter((item) => item.id !== selectedPropertyId)
      .map((item) => ({
        property: item,
        score: computeComparisonScore(input, item),
      }))
      .filter((item) => item.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [
    city,
    neighborhood,
    propertyType,
    inputWoon,
    inputPerceel,
    inputBouwjaar,
    finishLevel,
    existingProperties,
    selectedPropertyId,
  ]);

  function applyPropertyToForm(property: ExistingProperty) {
    setSelectedPropertyId(property.id);
    setAddress(property.address || '');
    setCity(property.city || '');
    setNeighborhood(property.neighborhood || '');
    setPropertyType(property.propertyType || '');
    setWoonoppervlakteM2(property.woonoppervlakteM2 != null ? String(property.woonoppervlakteM2) : '');
    setPerceelM2(property.perceelM2 != null ? String(property.perceelM2) : '');
    setBouwjaar(property.bouwjaar != null ? String(property.bouwjaar) : '');
    setEnergielabel(property.energielabel || '');
    setFinishLevel(property.finishLevel || '');

    const label = property.propertyType
      ? getPropertyTypeLabel(property.propertyType).toLowerCase()
      : 'woning';

    const locationBase =
      property.address || property.city
        ? `${property.address ? property.address : ''}${
            property.city ? `${property.address ? ', ' : ''}${property.city}` : ''
          }${property.neighborhood ? ` (${property.neighborhood})` : ''}`.trim()
        : 'deze woning';

    const woonopp = property.woonoppervlakteM2 ? `${property.woonoppervlakteM2} m²` : 'onbekende woonoppervlakte';

    setQuestion(
      `Wat is een realistische indicatieve basisprijs voor ${locationBase}, uitgaande van een ${label} met ${woonopp} in het exclusieve segment? Gebruik waar mogelijk vergelijking met bestaande woningen van deze makelaar, geef een richtprijs, bandbreedte, prijs per m² en korte motivatie.`
    );

    toast.success('Woninggegevens uit bestaande invoer geladen.');
  }

  function applyQuickPrompt(type: QuickActionType) {
    const locationBase =
      address || city || neighborhood
        ? `${address ? address : ''}${city ? `${address ? ', ' : ''}${city}` : ''}${
            neighborhood ? ` (${neighborhood})` : ''
          }`.trim()
        : 'deze woning';

    const typeLabel = propertyType ? getPropertyTypeLabel(propertyType).toLowerCase() : 'woning';
    const woonopp = woonoppervlakteM2 ? `${woonoppervlakteM2} m²` : 'onbekende woonoppervlakte';
    const compareLine = compareProperties.length
      ? ` Gebruik ook vergelijking met ${compareProperties.length} geselecteerde referentiewoning${compareProperties.length > 1 ? 'en' : ''} van deze makelaar.`
      : selectedProperty
      ? ' Gebruik waar mogelijk ook de overige woningen van deze makelaar als referentie.'
      : '';

    if (type === 'basisprijs') {
      setQuestion(
        `Wat is een realistische indicatieve basisprijs voor een ${typeLabel} met ${woonopp} in het segment vanaf €1.000.000 op ${locationBase}? Geef een onderbouwde richtprijs, bandbreedte, prijs per m² en korte motivatie.${compareLine}`
      );
    }

    if (type === 'bandbreedte') {
      setQuestion(
        `Wat is een realistische vraagprijsbandbreedte voor ${locationBase} in het hogere segment, uitgaande van een ${typeLabel} met ${woonopp}, en waarom? Benoem laag, midden en hoog scenario.${compareLine}`
      );
    }

    if (type === 'strategie') {
      setQuestion(
        `Welke prijsstrategie en positionering adviseer je voor ${locationBase} in het exclusieve segment? Geef advies over marktpositie, presentatie, vraagprijs versus verwachte verkoopuitkomst en kans op verkoop.${compareLine}`
      );
    }

    if (type === 'm2') {
      setQuestion(
        `Wat is een realistische indicatieve prijs per m² voor ${locationBase} in het hogere segment en welke factoren hebben de meeste invloed op deze inschatting?${compareLine}`
      );
    }

    if (type === 'check') {
      setQuestion(
        `Welke aanvullende woninggegevens zijn nodig om voor ${locationBase} een nauwkeurigere indicatieve basisprijs op te stellen? Geef een korte checklist, inclusief welke referentiewoningen nog het meest bruikbaar zouden zijn.${compareLine}`
      );
    }
  }

  function toggleCompareProperty(id: string) {
    setComparePropertyIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 5) {
        toast.error('Je kunt maximaal 5 referentiewoningen selecteren.');
        return current;
      }
      return [...current, id];
    });
  }

  async function onSubmit() {
    if (!question.trim() || question.trim().length < 3) {
      toast.error('Vul een geldige vraag in (minimaal 3 tekens).');
      return;
    }

    const body = {
      question,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      neighborhood: neighborhood.trim() || undefined,
      propertyType: propertyType || undefined,
      woonoppervlakteM2: inputWoon ?? undefined,
      perceelM2: inputPerceel ?? undefined,
      bouwjaar: inputBouwjaar ?? undefined,
      energielabel: energielabel.trim() || undefined,
      finishLevel: finishLevel || undefined,

      selectedPropertyId: selectedProperty?.id || undefined,
      selectedPropertySnapshot: selectedProperty
        ? {
            id: selectedProperty.id,
            propertyCode: selectedProperty.propertyCode,
            title: selectedProperty.title,
            address: selectedProperty.address,
            city: selectedProperty.city,
            neighborhood: selectedProperty.neighborhood,
            propertyType: selectedProperty.propertyType,
            woonoppervlakteM2: selectedProperty.woonoppervlakteM2,
            perceelM2: selectedProperty.perceelM2,
            bouwjaar: selectedProperty.bouwjaar,
            energielabel: selectedProperty.energielabel,
            finishLevel: selectedProperty.finishLevel,
            askingPrice: selectedProperty.askingPrice,
            basePrice: selectedProperty.basePrice,
          }
        : undefined,
      comparePropertyIds: compareProperties.map((item) => item.id),
      comparePropertySnapshots:
        compareProperties.length > 0
          ? compareProperties.map((item) => ({
              id: item.id,
              propertyCode: item.propertyCode,
              title: item.title,
              address: item.address,
              city: item.city,
              neighborhood: item.neighborhood,
              propertyType: item.propertyType,
              woonoppervlakteM2: item.woonoppervlakteM2,
              perceelM2: item.perceelM2,
              bouwjaar: item.bouwjaar,
              energielabel: item.energielabel,
              finishLevel: item.finishLevel,
              askingPrice: item.askingPrice,
              basePrice: item.basePrice,
            }))
          : undefined,
      qualityScore,
    };

    if (body.woonoppervlakteM2 !== undefined && !Number.isFinite(body.woonoppervlakteM2)) {
      toast.error('Woonoppervlakte moet een geldig getal zijn.');
      return;
    }

    if (body.perceelM2 !== undefined && !Number.isFinite(body.perceelM2)) {
      toast.error('Perceel moet een geldig getal zijn.');
      return;
    }

    if (body.bouwjaar !== undefined && !Number.isFinite(body.bouwjaar)) {
      toast.error('Bouwjaar moet een geldig getal zijn.');
      return;
    }

    setIsLoading(true);
    setData(null);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json: ApiResponse = await res.json();
      setData(json);

      if (!res.ok || !json.ok) {
        toast.error(json.error || 'AI-aanvraag mislukt.');
        return;
      }

      toast.success('Indicatieve basisprijs opgehaald.');
    } catch (e: any) {
      toast.error(e?.message || 'Netwerkfout.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,39,71,0.12)]">
        <div className="absolute inset-0">
          <Image
            src="/01-Duinvilla-Bosch-en-Duin-IMG_6625-scaled.jpg"
            alt="Luxe villa achtergrond"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        <div className="relative px-6 py-8 md:px-8 md:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr] lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow-[0_8px_22px_rgba(0,0,0,0.35)] md:text-5xl">
                Basisprijs bepalen
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/95 drop-shadow-[0_4px_14px_rgba(0,0,0,0.28)] md:text-base">
                Bepaal een indicatieve richtprijs voor woningen in het hogere segment. Deze module is
                bedoeld als premium startpunt voor de waardebepaling en geeft een AI-ondersteunde
                inschatting op basis van ingevoerde woningkenmerken, locatie, marktcontext én waar
                mogelijk vergelijking met eerder ingevoerde woningen.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/25 bg-[#102c54]/66 p-5 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
              <div className="text-sm font-medium text-white/85">Positionering van deze module</div>
              <div className="mt-3 text-2xl font-semibold text-white">Basisprijs / richtprijs</div>
              <p className="mt-3 text-sm leading-6 text-white/90">
                Gebruik deze pagina als eerste stap binnen de waardebepaling. Het resultaat is
                nadrukkelijk indicatief en geen officieel taxatierapport.
              </p>

              <div className="mt-5 grid gap-3">
                <FeatureRow text="Geschikt voor exclusieve woningen vanaf circa €1.000.000" />
                <FeatureRow text="Gebruikt input, segmentcontext en vergelijkingen als referentie" />
                <FeatureRow text="Kan later worden gebruikt binnen dashboard en waardering" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {limit != null && used != null && (
        <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">AI-verbruik deze maand</div>
              <div className="mt-1 text-sm text-slate-500">
                {used} gebruikt • {remaining ?? '-'} van {limit} over
              </div>
            </div>

            <div className="w-full max-w-md">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>Gebruik</span>
                <span>{pct(used, limit)}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#102c54] via-[#20497b] to-[#3c6aa3]"
                  style={{ width: `${clamp(pct(used, limit), 0, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Richtprijs starten</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Bouw hier de indicatieve basisprijs op. De AI gebruikt je input om een eerste
                prijsrichting, bandbreedte en samenvatting voor het hogere segment te genereren.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Resultaat
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Altijd indicatief</div>
            </div>
          </div>

          {existingProperties.length > 0 && (
            <div className="mt-5 rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="w-full">
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Start vanuit bestaande woning van deze makelaar
                  </label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedPropertyId(id);
                      const property = existingProperties.find((item) => item.id === id);
                      if (property) {
                        applyPropertyToForm(property);
                      }
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:ring-4 focus:ring-[#20497b]/10"
                  >
                    <option value="">Kies een bestaande woning…</option>
                    {existingProperties.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.propertyCode ? `${item.propertyCode} • ` : ''}
                        {item.address || item.title}
                        {item.city ? ` • ${item.city}` : ''}
                        {item.woonoppervlakteM2 ? ` • ${item.woonoppervlakteM2} m²` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-slate-500 lg:min-w-[220px] lg:text-right">
                  {isLoadingExisting
                    ? 'Bestaande woningen laden…'
                    : `${existingProperties.length} bestaande woning${existingProperties.length > 1 ? 'en' : ''} beschikbaar`}
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-500">
                Kies een bestaande woning om de invoer direct te vullen. Daarna kun je aanvullende
                referentiewoningen selecteren voor vergelijking.
              </div>
            </div>
          )}

          {existingProperties.length === 0 && !isLoadingExisting && (
            <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Nog geen bestaande woningen ingeladen op deze pagina. De basisprijs-module blijft wel
              gewoon werken. Zodra een endpoint voor de eigen woningen beschikbaar is, kan deze sectie
              automatisch gevuld worden.
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <QuickActionButton onClick={() => applyQuickPrompt('basisprijs')} label="Basisprijs bepalen" />
            <QuickActionButton onClick={() => applyQuickPrompt('bandbreedte')} label="Vraagprijs bandbreedte" />
            <QuickActionButton onClick={() => applyQuickPrompt('m2')} label="Prijs per m²" />
            <QuickActionButton onClick={() => applyQuickPrompt('strategie')} label="Prijsstrategie" />
            <QuickActionButton onClick={() => applyQuickPrompt('check')} label="Checklist ontbrekende info" />
          </div>

          {suggestedComparables.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Voorgestelde referentiewoningen</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Gebaseerd op plaats, woningtype, oppervlak, perceel, bouwjaar en afwerking.
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  Geselecteerd: {comparePropertyIds.length}/5
                </div>
              </div>

              <div className="grid gap-3">
                {suggestedComparables.map(({ property, score }) => {
                  const selected = comparePropertyIds.includes(property.id);

                  return (
                    <button
                      key={property.id}
                      type="button"
                      onClick={() => toggleCompareProperty(property.id)}
                      className={`rounded-[22px] border p-4 text-left transition ${
                        selected
                          ? 'border-[#20497b] bg-[#f4f8fc] shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {property.address || property.title}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {[property.city, property.neighborhood].filter(Boolean).join(' • ') || 'Locatie niet compleet'}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Chip label={getPropertyTypeLabel(property.propertyType)} />
                            {property.woonoppervlakteM2 != null && (
                              <Chip label={`${property.woonoppervlakteM2} m²`} />
                            )}
                            {property.perceelM2 != null && (
                              <Chip label={`${property.perceelM2} m² perceel`} />
                            )}
                            {property.askingPrice != null && <Chip label={euro(property.askingPrice)} />}
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-2 md:items-end">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${scoreBadgeClass(score)}`}>
                            Match {score}%
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              selected ? 'bg-[#102c54] text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {selected ? 'Geselecteerd' : 'Selecteer'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-slate-900">Analyse-opdracht</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[190px] w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:bg-white focus:ring-4 focus:ring-[#20497b]/10"
              placeholder="Bijv. Wat is een realistische indicatieve basisprijs voor een villa van 300 m² woonoppervlakte in Bloemendaal, inclusief bandbreedte, prijs per m², vergelijking met bestaande woningen en een korte motivatie?"
            />
            {accuracyHint.length > 0 && (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                Voor een sterkere indicatie is het slim om ook {accuracyHint.join(', ')} in te vullen.
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MiniInfoCard
              title="Doel"
              value="Richtprijs"
              description="Startpunt voor verdere waardebepaling"
            />
            <MiniInfoCard
              title="Segment"
              value="€1M+"
              description="Gericht op exclusieve woningen"
            />
            <MiniInfoCard
              title="Vergelijking"
              value={comparePropertyIds.length ? `${comparePropertyIds.length} refs` : 'Optioneel'}
              description="Gebruik bestaande woningen als extra referentie"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Klaar om de basisprijs te berekenen?</div>
              <div className="mt-1 text-sm text-slate-500">
                Vul bij voorkeur plaats, woningtype en woonoppervlakte in. Met referentiewoningen van
                de makelaar wordt de context sterker.
              </div>
            </div>

            <button
              onClick={onSubmit}
              disabled={isLoading || !hasEnoughInputForIndicatie}
              className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-[#102c54] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#102c54]/20 transition hover:bg-[#0d2545] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Basisprijs wordt berekend…' : 'Bereken indicatieve basisprijs'}
            </button>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-semibold text-slate-900">Woninggegevens</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Hoe completer de invoer, hoe bruikbaarder de indicatieve uitkomst voor de basisprijs.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Adres (optioneel)">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:bg-white focus:ring-4 focus:ring-[#20497b]/10"
                placeholder="Straat + huisnummer"
              />
            </Field>

            <Field label="Plaats">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:bg-white focus:ring-4 focus:ring-[#20497b]/10"
                placeholder="Bijv. Bloemendaal"
              />
            </Field>

            <Field label="Wijk / buurt">
              <input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:bg-white focus:ring-4 focus:ring-[#20497b]/10"
                placeholder="Bijv. Amsterdam Zuid"
              />
            </Field>

            <Field label="Woningtype">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyTypeValue)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:bg-white focus:ring-4 focus:ring-[#20497b]/10"
              >
                <option value="">Kies…</option>
                <option value="appartement">Appartement</option>
                <option value="tussenwoning">Tussenwoning</option>
                <option value="hoekwoning">Hoekwoning</option>
                <option value="2-onder-1-kap">2-onder-1-kap</option>
                <option value="vrijstaand">Vrijstaand</option>
                <option value="villa">Villa</option>
                <option value="recreatie">Recreatie</option>
              </select>
            </Field>

            <Field label="Woonoppervlakte (m²)">
              <input
                value={woonoppervlakteM2}
                onChange={(e) => setWoonoppervlakteM2(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:bg-white focus:ring-4 focus:ring-[#20497b]/10"
                placeholder="Bijv. 280"
                inputMode="numeric"
              />
            </Field>

            <Field label="Perceel (m²)">
              <input
                value={perceelM2}
                onChange={(e) => setPerceelM2(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:bg-white focus:ring-4 focus:ring-[#20497b]/10"
                placeholder="Bijv. 900"
                inputMode="numeric"
              />
            </Field>

            <Field label="Bouwjaar">
              <input
                value={bouwjaar}
                onChange={(e) => setBouwjaar(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:bg-white focus:ring-4 focus:ring-[#20497b]/10"
                placeholder="Bijv. 2014"
                inputMode="numeric"
              />
            </Field>

            <Field label="Energielabel">
              <input
                value={energielabel}
                onChange={(e) => setEnergielabel(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:bg-white focus:ring-4 focus:ring-[#20497b]/10"
                placeholder="Bijv. A++"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Afwerkingsniveau">
                <select
                  value={finishLevel}
                  onChange={(e) => setFinishLevel(e.target.value as FinishLevelValue)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:bg-white focus:ring-4 focus:ring-[#20497b]/10"
                >
                  <option value="">Kies…</option>
                  <option value="opknapper">Opknapper</option>
                  <option value="gemiddeld">Gemiddeld</option>
                  <option value="hoog">Hoog</option>
                  <option value="top">Topsegment</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-slate-900">Kwaliteit van de invoer</div>
              <div className="rounded-full bg-[#102c54] px-3 py-1 text-xs font-semibold text-white">
                {qualityScore}% compleet
              </div>
            </div>

            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#102c54] via-[#20497b] to-[#3c6aa3]"
                style={{ width: `${qualityScore}%` }}
              />
            </div>

            <div className="mt-3 text-sm text-slate-500">{qualityMessage}</div>

            <div className="mt-4 grid gap-3">
              {qualityItems.map((item) => (
                <QualityRow key={item.label} label={item.label} done={item.done} />
              ))}
            </div>
          </div>

          {selectedProperty && (
            <div className="mt-6 rounded-[24px] border border-[#20497b]/20 bg-[#f4f8fc] p-4">
              <div className="text-sm font-semibold text-slate-900">Geselecteerde basiswoning</div>
              <div className="mt-2 text-sm text-slate-700">
                {selectedProperty.address || selectedProperty.title}
                {selectedProperty.city ? ` • ${selectedProperty.city}` : ''}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Chip label={getPropertyTypeLabel(selectedProperty.propertyType)} />
                {selectedProperty.woonoppervlakteM2 != null && (
                  <Chip label={`${selectedProperty.woonoppervlakteM2} m²`} />
                )}
                {selectedProperty.perceelM2 != null && (
                  <Chip label={`${selectedProperty.perceelM2} m² perceel`} />
                )}
                {selectedProperty.askingPrice != null && (
                  <Chip label={`Vraagprijs ${euro(selectedProperty.askingPrice)}`} />
                )}
              </div>
            </div>
          )}

          {compareProperties.length > 0 && (
            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">Geselecteerde referenties</div>
                <button
                  type="button"
                  onClick={() => setComparePropertyIds([])}
                  className="text-xs font-medium text-slate-500 transition hover:text-slate-700"
                >
                  Wis selectie
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {compareProperties.map((property) => (
                  <div
                    key={property.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {property.address || property.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {[property.city, property.neighborhood].filter(Boolean).join(' • ') || 'Locatie niet compleet'}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {property.woonoppervlakteM2 != null && (
                          <Chip label={`${property.woonoppervlakteM2} m²`} />
                        )}
                        {property.askingPrice != null && <Chip label={euro(property.askingPrice)} />}
                        <button
                          type="button"
                          onClick={() => toggleCompareProperty(property.id)}
                          className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-300"
                        >
                          Verwijderen
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Indicatieve uitkomst</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              De uitkomst hieronder is bedoeld als richtlijn voor de eerste basisprijs en kan later
              worden meegenomen in dashboard, woningoverzicht en waarderingsrapport.
            </p>
          </div>

          {data?.ok && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Model: <span className="font-semibold text-slate-900">{data.model}</span> • Jaar:{' '}
              <span className="font-semibold text-slate-900">{data.year}</span>
            </div>
          )}
        </div>

        {!data && (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-2xl">
              <div className="text-lg font-semibold text-slate-900">Nog geen indicatieve basisprijs opgehaald</div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Vul de woninggegevens in en klik op{' '}
                <span className="font-medium text-slate-700">Bereken indicatieve basisprijs</span> om
                een eerste prijsrichting te genereren.
              </p>
            </div>
          </div>
        )}

        {data && !data.ok && (
          <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-5">
            <div className="text-sm font-semibold text-red-700">
              {data.error || 'Er ging iets mis bij het ophalen van de indicatie.'}
            </div>

            {data.details ? (
              <pre className="mt-4 max-h-72 overflow-auto rounded-2xl border border-red-100 bg-white p-4 text-xs text-slate-700">
                {JSON.stringify(data.details, null, 2)}
              </pre>
            ) : null}
          </div>
        )}

        {data?.ok && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[26px] border border-slate-200 bg-gradient-to-br from-[#0f2747] via-[#143560] to-[#20497b] p-6 text-white shadow-[0_20px_60px_rgba(16,44,84,0.18)]">
                <div className="text-sm font-medium text-white/75">Indicatieve basisprijs</div>

                <div className="mt-4">
                  {estimatedMiddenPrijs != null ? (
                    <div className="text-3xl font-semibold tracking-tight md:text-5xl">
                      {euro(estimatedMiddenPrijs)}
                    </div>
                  ) : (
                    <div className="text-2xl font-semibold">Nog geen middenwaarde beschikbaar</div>
                  )}
                </div>

                <div className="mt-4 text-sm leading-6 text-white/80">
                  Deze indicatieve richtprijs is een AI-ondersteunde eerste inschatting op basis van
                  ingevoerde kenmerken, marktbasis, context en waar mogelijk vergelijking met
                  geselecteerde referenties.
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <ResultStat label="Woningtype" value={getPropertyTypeLabel(propertyType)} />
                  <ResultStat label="Afwerking" value={getFinishLabel(finishLevel)} />
                  <ResultStat label="Plaats" value={city.trim() || 'Niet opgegeven'} />
                </div>
              </div>

              <div className="grid gap-4">
                <MetricCard
                  title="Laag"
                  value={
                    data.result?.bandbreedte?.laag != null
                      ? euro(data.result.bandbreedte.laag)
                      : '—'
                  }
                  subtitle="Conservatieve ondergrens"
                />
                <MetricCard
                  title="Midden"
                  value={
                    data.result?.bandbreedte?.midden != null
                      ? euro(data.result.bandbreedte.midden)
                      : estimatedMiddenPrijs != null
                      ? euro(estimatedMiddenPrijs)
                      : '—'
                  }
                  subtitle="Indicatieve basisprijs"
                  highlighted
                />
                <MetricCard
                  title="Hoog"
                  value={
                    data.result?.bandbreedte?.hoog != null
                      ? euro(data.result.bandbreedte.hoog)
                      : '—'
                  }
                  subtitle="Optimistische bovengrens"
                />
              </div>
            </div>

            {data.result?.prijsPerM2 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                <MetricCard
                  title="Prijs per m² vanaf"
                  value={euro(data.result.prijsPerM2.min)}
                  subtitle="Indicatieve ondergrens"
                />
                <MetricCard
                  title="Prijs per m² tot"
                  value={euro(data.result.prijsPerM2.max)}
                  subtitle="Indicatieve bovengrens"
                />
                <MetricCard
                  title="Regio-inschatting"
                  value={data.result.prijsPerM2.regioKey || 'Algemene markt'}
                  subtitle="Gebruikte regio / context"
                />
              </div>
            ) : null}

            {compareProperties.length > 0 && (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-900">Meegegeven referentiewoningen</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {compareProperties.map((property) => (
                    <div key={property.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-sm font-semibold text-slate-900">
                        {property.address || property.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {[property.city, property.neighborhood].filter(Boolean).join(' • ') || 'Locatie niet compleet'}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Chip label={getPropertyTypeLabel(property.propertyType)} />
                        {property.woonoppervlakteM2 != null && (
                          <Chip label={`${property.woonoppervlakteM2} m²`} />
                        )}
                        {property.askingPrice != null && <Chip label={euro(property.askingPrice)} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.result?.bandbreedte ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-900">Toelichting op de bandbreedte</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">
                  {data.result.bandbreedte.toelichting ||
                    'Geen aanvullende toelichting beschikbaar.'}
                </div>
              </div>
            ) : null}

            {data.result?.prijsPerM2?.toelichting ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-slate-900">Toelichting prijs per m²</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">
                  {data.result.prijsPerM2.toelichting}
                </div>
              </div>
            ) : null}

            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Samenvatting van de indicatie</div>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {data.result?.samenvatting || data.answer}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <ListCard
                title="Aannames"
                items={data.result?.aannames || []}
                emptyLabel="Geen aannames ontvangen."
              />
              <ListCard
                title="Gevoeligheden"
                items={data.result?.gevoeligheden || []}
                emptyLabel="Geen gevoeligheden ontvangen."
              />
              <ListCard
                title="Benodigde aanvullende info"
                items={data.result?.benodigdeAanvullendeInfo || []}
                emptyLabel="Geen aanvullende punten ontvangen."
              />
            </div>

            <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
              <div className="text-sm font-semibold text-amber-900">Belangrijke indicatieve disclaimer</div>
              <div className="mt-2 text-sm leading-7 text-amber-800">
                {data.result?.disclaimer ||
                  'Deze uitkomst is uitsluitend indicatief en gebaseerd op beperkte input, AI-analyse en marktbandbreedtes. Dit is geen officiële taxatie, geen bindend waarderapport en geen juridisch of financieel advies.'}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/14 px-4 py-3 text-sm text-white/95 backdrop-blur-md">
      {text}
    </div>
  );
}

function QuickActionButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}

function MiniInfoCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{description}</div>
    </div>
  );
}

function QualityRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {done ? 'Ingevuld' : 'Ontbreekt'}
      </span>
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="text-xs font-medium uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  highlighted = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] border p-5 ${
        highlighted
          ? 'border-[#20497b]/20 bg-gradient-to-br from-[#f4f8fc] to-white shadow-sm'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
    </div>
  );
}

function ListCard({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-3">
              <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-[#20497b]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 text-sm text-slate-500">{emptyLabel}</div>
      )}
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {label}
    </span>
  );
}
