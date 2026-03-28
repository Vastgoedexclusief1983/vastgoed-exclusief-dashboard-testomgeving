'use client';

import { useMemo, useState } from 'react';
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

export default function AiVraagPage() {
  const [question, setQuestion] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [propertyType, setPropertyType] = useState<
    'appartement' | 'tussenwoning' | 'hoekwoning' | '2-onder-1-kap' | 'vrijstaand' | 'villa' | 'recreatie' | ''
  >('');
  const [woonoppervlakteM2, setWoonoppervlakteM2] = useState<string>('');
  const [perceelM2, setPerceelM2] = useState<string>('');
  const [bouwjaar, setBouwjaar] = useState<string>('');
  const [energielabel, setEnergielabel] = useState<string>('');
  const [finishLevel, setFinishLevel] = useState<'opknapper' | 'gemiddeld' | 'hoog' | 'top' | ''>('');

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);

  const remaining = data?.usage?.remaining ?? null;
  const limit = data?.usage?.limit ?? null;
  const used = data?.usage?.count ?? null;

  const accuracyHint = useMemo(() => {
    const missing: string[] = [];
    if (!city.trim()) missing.push('plaats');
    if (!woonoppervlakteM2.trim()) missing.push('woonoppervlakte');
    if (!propertyType) missing.push('woningtype');
    return missing;
  }, [city, woonoppervlakteM2, propertyType]);

  const hasEnoughInputForIndicatie = useMemo(() => {
    return city.trim() && woonoppervlakteM2.trim() && propertyType;
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

  function applyQuickPrompt(type: QuickActionType) {
    const locationBase =
      address || city || neighborhood
        ? `${address ? address : ''}${city ? `${address ? ', ' : ''}${city}` : ''}${neighborhood ? ` (${neighborhood})` : ''}`.trim()
        : 'deze woning';

    const typeLabel = propertyType ? getPropertyTypeLabel(propertyType).toLowerCase() : 'woning';
    const woonopp = woonoppervlakteM2 ? `${woonoppervlakteM2} m²` : 'onbekende woonoppervlakte';

    if (type === 'basisprijs') {
      setQuestion(
        `Wat is een realistische indicatieve basisprijs voor een ${typeLabel} met ${woonopp} in het segment vanaf €1.000.000 op ${locationBase}? Geef een onderbouwde richtprijs, bandbreedte en korte motivatie.`
      );
    }

    if (type === 'bandbreedte') {
      setQuestion(
        `Wat is een realistische vraagprijsbandbreedte voor ${locationBase} in het hogere segment, uitgaande van een ${typeLabel} met ${woonopp}, en waarom?`
      );
    }

    if (type === 'strategie') {
      setQuestion(
        `Welke prijsstrategie en positionering adviseer je voor ${locationBase} in het exclusieve segment? Geef advies over marktpositie, presentatie en kans op verkoop.`
      );
    }

    if (type === 'm2') {
      setQuestion(
        `Wat is een realistische indicatieve prijs per m² voor ${locationBase} in het hogere segment en welke factoren hebben de meeste invloed op deze inschatting?`
      );
    }

    if (type === 'check') {
      setQuestion(
        `Welke aanvullende woninggegevens zijn nodig om voor ${locationBase} een nauwkeurigere indicatieve basisprijs op te stellen? Geef een korte checklist.`
      );
    }
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
      woonoppervlakteM2: woonoppervlakteM2.trim() ? Number(woonoppervlakteM2) : undefined,
      perceelM2: perceelM2.trim() ? Number(perceelM2) : undefined,
      bouwjaar: bouwjaar.trim() ? Number(bouwjaar) : undefined,
      energielabel: energielabel.trim() || undefined,
      finishLevel: finishLevel || undefined,
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
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#0f2747] via-[#153a69] to-[#214f8e] px-6 py-7 text-white shadow-[0_30px_90px_rgba(15,39,71,0.18)] md:px-8 md:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_26%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.5fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium tracking-wide text-white/90 backdrop-blur">
              Indicatieve prijsanalyse voor exclusief vastgoed
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
              Basisprijs bepalen
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 md:text-base">
              Bepaal een indicatieve richtprijs voor woningen in het hogere segment. Deze module is
              bedoeld als premium startpunt voor de waardebepaling en geeft een AI-ondersteunde
              inschatting op basis van ingevoerde woningkenmerken, locatie en marktcontext.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <StatusPill label="Richtprijs miljoenenwoning" />
              <StatusPill label="Bandbreedte & prijs per m²" />
              <StatusPill label="Indicatief resultaat" />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
            <div className="text-sm font-medium text-white/80">Positionering van deze module</div>
            <div className="mt-3 text-2xl font-semibold">Basisprijs / richtprijs</div>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Gebruik deze pagina als eerste stap binnen de waardebepaling. Het resultaat is
              nadrukkelijk indicatief en geen officieel taxatierapport.
            </p>

            <div className="mt-5 grid gap-3">
              <FeatureRow text="Geschikt voor exclusieve woningen vanaf circa €1.000.000" />
              <FeatureRow text="Geeft richting voor bandbreedte, positionering en prijs per m²" />
              <FeatureRow text="Kan later worden gebruikt binnen dashboard en waardering" />
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
              <div className="mt-1 text-sm font-semibold text-slate-900">
                Altijd indicatief
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <QuickActionButton onClick={() => applyQuickPrompt('basisprijs')} label="Basisprijs bepalen" />
            <QuickActionButton onClick={() => applyQuickPrompt('bandbreedte')} label="Vraagprijs bandbreedte" />
            <QuickActionButton onClick={() => applyQuickPrompt('m2')} label="Prijs per m²" />
            <QuickActionButton onClick={() => applyQuickPrompt('strategie')} label="Prijsstrategie" />
            <QuickActionButton onClick={() => applyQuickPrompt('check')} label="Checklist ontbrekende info" />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Analyse-opdracht
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-900 outline-none transition focus:border-[#20497b] focus:bg-white focus:ring-4 focus:ring-[#20497b]/10"
              placeholder="Bijv. Wat is een realistische indicatieve basisprijs voor een villa van 300 m² woonoppervlakte in Bloemendaal, inclusief bandbreedte, prijs per m² en een korte motivatie?"
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
              title="Uitkomst"
              value="Indicatief"
              description="Geen officiële taxatie of bindend advies"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Klaar om de basisprijs te berekenen?</div>
              <div className="mt-1 text-sm text-slate-500">
                Vul bij voorkeur plaats, woningtype en woonoppervlakte in voor een bruikbare eerste indicatie.
              </div>
            </div>

            <button
              onClick={onSubmit}
              disabled={isLoading}
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
                onChange={(e) => setPropertyType(e.target.value as any)}
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
                  onChange={(e) => setFinishLevel(e.target.value as any)}
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
            <div className="text-sm font-semibold text-slate-900">Kwaliteit van de invoer</div>
            <div className="mt-2 text-sm text-slate-500">
              {hasEnoughInputForIndicatie
                ? 'De ingevoerde basisgegevens zijn voldoende voor een eerste indicatieve richtprijs.'
                : 'Vul minimaal plaats, woningtype en woonoppervlakte in voor een bruikbare indicatie.'}
            </div>

            <div className="mt-4 grid gap-3">
              <QualityRow label="Plaats" done={Boolean(city.trim())} />
              <QualityRow label="Woningtype" done={Boolean(propertyType)} />
              <QualityRow label="Woonoppervlakte" done={Boolean(woonoppervlakteM2.trim())} />
              <QualityRow label="Afwerkingsniveau" done={Boolean(finishLevel)} />
            </div>
          </div>
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
                Vul de woninggegevens in en klik op <span className="font-medium text-slate-700">Bereken indicatieve basisprijs</span> om een eerste prijsrichting te genereren.
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
                  ingevoerde kenmerken, marktbasis en context. Gebruik dit resultaat uitsluitend als
                  richtinggevend startpunt.
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <ResultStat
                    label="Woningtype"
                    value={getPropertyTypeLabel(propertyType)}
                  />
                  <ResultStat
                    label="Afwerking"
                    value={getFinishLabel(finishLevel)}
                  />
                  <ResultStat
                    label="Plaats"
                    value={city.trim() || 'Niet opgegeven'}
                  />
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

function StatusPill({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur">
      {label}
    </div>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90">
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
          done
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-500'
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
