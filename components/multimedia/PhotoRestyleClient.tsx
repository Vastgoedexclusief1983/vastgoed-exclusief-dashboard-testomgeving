'use client';

import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  Wand2,
  Upload,
  Download,
  MoonStar,
  SunMedium,
  CheckCircle2,
} from 'lucide-react';

type Mode = 'interior' | 'exterior';
type TimeOfDay = 'day' | 'evening';

type Preset = {
  id: string;
  label: string;
  description: string;
  mode: Mode;
};

type AddOn = {
  id: string;
  label: string;
  hint: string;
};

const API_ENDPOINT = '/api/ai/restyle';

const NEIGHBOR_GUARDRAIL =
  'Belangrijk: pas uitsluitend de DOELWONING aan (het huis in de foto). ' +
  'Wijzig of restyle GEEN omliggende woningen/buren, geen straatbeeld, geen extra gebouwen. ' +
  'Laat alle buren en achtergrondobjecten zo veel mogelijk ongewijzigd.';

const INTERIOR_PRESETS: Preset[] = [
  { id: 'modern_luxe', label: 'Modern luxe', description: 'Strak, high-end, lichte tinten', mode: 'interior' },
  { id: 'hotel_chique', label: 'Hotel chique', description: 'Boutique hotel vibe, rijke materialen', mode: 'interior' },
  { id: 'japandi', label: 'Japandi', description: 'Rustig, minimal, warm hout', mode: 'interior' },
  { id: 'scandinavisch', label: 'Scandinavisch', description: 'Licht, luchtig, clean', mode: 'interior' },
  { id: 'landelijk', label: 'Landelijk', description: 'Warm, natuurlijk, klassiek', mode: 'interior' },
  { id: 'minimalistisch', label: 'Minimalistisch', description: 'Less is more, premium eenvoud', mode: 'interior' },
  { id: 'industrieel', label: 'Industrieel', description: 'Stoer, beton/staal, loft', mode: 'interior' },
  { id: 'mediterrane_villa', label: 'Mediterrane villa', description: 'Zonnig, textuur, resort-feel', mode: 'interior' },
];

const EXTERIOR_PRESETS: Preset[] = [
  { id: 'modern_luxe', label: 'Moderne villa', description: 'Strakke lijnen, premium buitenafwerking', mode: 'exterior' },
  { id: 'landelijk', label: 'Landgoed classic', description: 'Tijdloos, symmetrie, luxe details', mode: 'exterior' },
  { id: 'mediterrane_villa', label: 'Mediterrane villa', description: 'Warm, resort-look, natuurlijke materialen', mode: 'exterior' },
  { id: 'scandinavisch', label: 'Scandi modern', description: 'Licht, hout/steen, minimal luxe', mode: 'exterior' },
];

const EXTERIOR_ADDONS: AddOn[] = [
  { id: 'pool', label: 'Zwembad', hint: 'Voeg een stijlvol zwembad toe (realistisch)' },
  { id: 'outdoor-kitchen', label: 'Buitenkeuken', hint: 'Luxe buitenkeuken / bar' },
  { id: 'pergola', label: 'Pergola', hint: 'Pergola / overkapping met lounge' },
  { id: 'garden-lighting', label: 'Tuinverlichting', hint: 'Architecturale verlichting en spots' },
  { id: 'driveway', label: 'Oprit upgrade', hint: 'Premium bestrating, strakke lijnen' },
  { id: 'landscaping', label: 'Tuinaanleg', hint: 'Exclusieve landscaping en borders' },
  { id: 'waterfeature', label: 'Waterpartij', hint: 'Vijver / waterelement' },
  { id: 'fence-gate', label: 'Poort / hekwerk', hint: 'Luxe entree, poort en hekwerk' },
];

const SHOWCASE_IMAGES = [
  {
    src: '/98-Solitudolaan-266-Amsterdam-IMG_5656-768x512.jpg',
    label: 'Luxe presentatie',
  },
  {
    src: '/74-Solitudolaan-266-Amsterdam-IMG_5621-768x512.jpg',
    label: 'High-end afwerking',
  },
  {
    src: '/High-end-real-estate-avondfotografie-IMG_6632-1280x720.jpg',
    label: 'Avondfotografie',
  },
  {
    src: '/01-Duinvilla-Bosch-en-Duin-IMG_6625-2-2048x1366 (1).jpg',
    label: 'Exclusieve villa',
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function isDataUrl(url: string) {
  return url.startsWith('data:image/');
}

function extractErrorMessage(raw: string): string {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    return parsed?.error || parsed?.message || raw;
  } catch {
    return raw;
  }
}

async function downloadImage(imageUrl: string, filenameBase: string) {
  if (isDataUrl(imageUrl)) {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${filenameBase}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  const res = await fetch(imageUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error('Download mislukt (fetch).');
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = `${filenameBase}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(objectUrl);
}

function MagnifierSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-foreground/15 border-t-foreground/70" />
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.85"
          />
          <path
            d="M16.3 16.3 21 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </div>
      <div className="text-sm text-muted-foreground">{label ?? 'Bezig met genereren…'}</div>
    </div>
  );
}

function LuxSquareImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background">
      <Image
        src={src}
        alt=""
        fill
        className="scale-110 object-cover blur-2xl opacity-70"
        sizes="(max-width: 1024px) 100vw, 50vw"
        aria-hidden
        priority={priority}
      />
      <div className="absolute inset-0 bg-black/10" aria-hidden />
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority={priority}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10"
        aria-hidden
      />
    </div>
  );
}

function LuxeShowcaseCard({
  src,
  label,
  priority = false,
}: {
  src: string;
  label: string;
  priority?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/20 bg-white/10 shadow-[0_18px_40px_rgba(15,39,79,0.18)] backdrop-blur">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={src}
          alt={label}
          fill
          priority={priority}
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07152d]/70 via-[#07152d]/10 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="inline-flex rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function PhotoRestyleClient() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<Mode>('interior');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('modern_luxe');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [extraPrompt, setExtraPrompt] = useState<string>('');

  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [restyledImageUrl, setRestyledImageUrl] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = useMemo(
    () => (mode === 'interior' ? INTERIOR_PRESETS : EXTERIOR_PRESETS),
    [mode]
  );

  const selectedPreset = useMemo(() => {
    return presets.find((p) => p.id === selectedPresetId) ?? presets[0];
  }, [presets, selectedPresetId]);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setRestyledImageUrl(null);
    setSelectedAddOns([]);
    setTimeOfDay('day');

    const nextPresets = nextMode === 'interior' ? INTERIOR_PRESETS : EXTERIOR_PRESETS;
    setSelectedPresetId(nextPresets[0].id);
  }

  function onPickFile(file: File | null) {
    setError(null);
    setRestyledImageUrl(null);

    if (!file) {
      setOriginalPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setOriginalPreview(url);
  }

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function buildExteriorExtraPrompt(userPrompt: string, addons: string[]) {
    if (!addons.length) return userPrompt.trim();

    const map: Record<string, string> = {
      pool: 'Voeg een realistisch luxe zwembad toe in de tuin.',
      'outdoor-kitchen': 'Voeg een luxe buitenkeuken / bar toe.',
      pergola: 'Voeg een pergola/overkapping met lounge toe.',
      'garden-lighting': 'Voeg architecturale tuinverlichting en warme spots toe.',
      driveway: 'Upgrade de oprit met premium bestrating en strakke lijnen.',
      landscaping: 'Voeg exclusieve landscaping, borders en nette tuinlijnen toe.',
      waterfeature: 'Voeg een stijlvolle waterpartij (vijver/waterelement) toe.',
      'fence-gate': 'Voeg een luxe entree met poort/hekwerk toe.',
    };

    const lines = addons.map((a) => map[a]).filter(Boolean);
    const addonText = lines.length
      ? `\nExterieur toevoegingen:\n- ${lines.join('\n- ')}`
      : '';
    const base = userPrompt.trim();
    return `${base}${addonText}`.trim();
  }

  function composeFinalExtraPrompt() {
    const base =
      mode === 'exterior'
        ? buildExteriorExtraPrompt(extraPrompt, selectedAddOns)
        : extraPrompt.trim();

    const timeInstruction =
      mode === 'exterior'
        ? timeOfDay === 'evening'
          ? 'Voorkeur sfeer: avondfotografie met warme luxe verlichting, schemering en premium twilight uitstraling.'
          : 'Voorkeur sfeer: dagfotografie met helder natuurlijk daglicht, frisse uitstraling en realistische buitenbelichting.'
        : '';

    const parts = [base, timeInstruction, NEIGHBOR_GUARDRAIL].filter(Boolean);
    return parts.join('\n\n').trim();
  }

  async function handleGenerate() {
    try {
      setError(null);

      const fileEl = fileInputRef.current;
      const file = fileEl?.files?.[0];

      if (!file) {
        setError('Upload eerst een foto om te starten.');
        return;
      }

      setIsGenerating(true);

      const fd = new FormData();
      fd.append('image', file);
      fd.append('preset', selectedPresetId);
      fd.append('extraPrompt', composeFinalExtraPrompt());
      fd.append('mode', mode);
      fd.append('timeOfDay', timeOfDay);

      const res = await fetch(API_ENDPOINT, { method: 'POST', body: fd });

      if (!res.ok) {
        const raw = await res.text().catch(() => '');
        throw new Error(
          extractErrorMessage(raw) || 'Generatie mislukt. Controleer credits/endpoint.'
        );
      }

      const data = (await res.json()) as { imageB64?: string };

      if (!data?.imageB64) {
        throw new Error('Geen image ontvangen van de server.');
      }

      setRestyledImageUrl(`data:image/png;base64,${data.imageB64}`);
    } catch (e: any) {
      setError(e?.message || 'Er ging iets mis.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDownload() {
    if (!restyledImageUrl) return;
    const dayPart =
      mode === 'exterior'
        ? `-${timeOfDay === 'evening' ? 'avondfotografie' : 'dagfotografie'}`
        : '';

    const base = `vastgoedexclusief-${
      mode === 'interior' ? 'interieur' : 'exterieur'
    }-${selectedPresetId}${dayPart}-${new Date().toISOString().slice(0, 10)}`;

    try {
      await downloadImage(restyledImageUrl, base);
    } catch (e: any) {
      setError(e?.message || 'Download mislukt.');
    }
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-white/50 bg-[linear-gradient(135deg,rgba(15,39,79,0.96)_0%,rgba(19,58,112,0.94)_45%,rgba(23,88,170,0.90)_100%)] px-6 py-6 text-white shadow-[0_24px_80px_rgba(16,44,84,0.24)] md:px-8 md:py-8">
        <div className="absolute -left-10 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-sky-300/10 blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              Vastgoed Exclusief · AI Restyling
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
              Luxere woningpresentatie met AI en premium beeldkwaliteit
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/82 md:text-base">
              Restyle interieur- en exterieurfoto’s voor een exclusievere uitstraling.
              Gebruik een hoogwaardige bronfoto, kies de juiste stijl en laat AI een
              visuele upgrade maken voor presentatie, impressie en positionering.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                Interieur & exterieur
              </div>
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                Dag- en avondfotografie
              </div>
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                Premium staging visual
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Workflow</div>
                <div className="mt-2 text-lg font-semibold">Upload → Kies stijl → Genereer</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Gebruik</div>
                <div className="mt-2 text-lg font-semibold">Presentatie & impressie</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Output</div>
                <div className="mt-2 text-lg font-semibold">Voor / na preview</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SHOWCASE_IMAGES.map((image, index) => (
              <LuxeShowcaseCard
                key={image.src}
                src={image.src}
                label={image.label}
                priority={index < 2}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT */}
        <div className="rounded-[30px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_70px_rgba(16,44,84,0.08)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {mode === 'interior'
                  ? 'Foto restylen · Interieur'
                  : 'Foto restylen · Exterieur'}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#102c54]">
                {mode === 'interior'
                  ? 'Visuele upgrade voor luxe woningpresentatie'
                  : 'Ontwerp-visual voor exclusieve buitenzijde'}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Kies een stijl en upload één foto.{' '}
                {mode === 'exterior'
                  ? 'Selecteer optionele luxe toevoegingen en gewenste fotografiesfeer.'
                  : ''}
              </p>
            </div>

            <div className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              Premium
            </div>
          </div>

          {/* MODE SWITCH */}
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-background p-2">
            <button
              type="button"
              onClick={() => switchMode('interior')}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition',
                mode === 'interior'
                  ? 'bg-foreground text-background'
                  : 'text-foreground/80 hover:bg-muted'
              )}
            >
              Interieur
            </button>
            <button
              type="button"
              onClick={() => switchMode('exterior')}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition',
                mode === 'exterior'
                  ? 'bg-foreground text-background'
                  : 'text-foreground/80 hover:bg-muted'
              )}
            >
              Exterieur
            </button>
          </div>

          {/* UPLOAD */}
          <div className="mt-6">
            <label className="text-sm font-medium">Upload foto</label>
            <div className="mt-2 rounded-[24px] border border-border bg-white p-4 shadow-sm">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                className="block w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-xl file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-sm file:font-medium file:text-background hover:file:opacity-90"
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Tip: JPG/PNG werkt het snelst. Wij optimaliseren automatisch (max
                ~1600px) voor snellere verwerking.
              </p>
            </div>
          </div>

          {/* PRESETS */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Stijl presets</label>
              <div className="text-xs text-muted-foreground">
                Geselecteerd: {selectedPreset?.label}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((p) => {
                const active = p.id === selectedPresetId;
                return (
                  <button
                    key={`${mode}-${p.label}`}
                    type="button"
                    onClick={() => setSelectedPresetId(p.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition',
                      active
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background hover:bg-muted'
                    )}
                    title={p.description}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {selectedPreset ? (
                <>
                  {selectedPreset.label} —{' '}
                  <span className="text-foreground/70">
                    {selectedPreset.description}
                  </span>
                </>
              ) : null}
            </p>
          </div>

          {/* EXTERIOR DAY / EVENING */}
          {mode === 'exterior' && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Fotografie sfeer</label>
                <div className="text-xs text-muted-foreground">
                  Geselecteerd:{' '}
                  {timeOfDay === 'day' ? 'Dag fotografie' : 'Avond fotografie'}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTimeOfDay('day')}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition',
                    timeOfDay === 'day'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background hover:bg-muted'
                  )}
                >
                  <SunMedium className="h-4 w-4" />
                  Dag fotografie
                </button>

                <button
                  type="button"
                  onClick={() => setTimeOfDay('evening')}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition',
                    timeOfDay === 'evening'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background hover:bg-muted'
                  )}
                >
                  <MoonStar className="h-4 w-4" />
                  Avond fotografie
                </button>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Kies een frisse daguitstraling of een warme luxe avondsfeer voor de
                buitenvisual.
              </p>
            </div>
          )}

          {/* EXTERIOR ADDONS */}
          {mode === 'exterior' && (
            <div className="mt-6">
              <label className="text-sm font-medium">Luxe toevoegingen (optioneel)</label>
              <p className="mt-1 text-xs text-muted-foreground">
                Deze opties worden als wens toegevoegd. Resultaat blijft indicatief en
                afhankelijk van bronfoto.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {EXTERIOR_ADDONS.map((a) => {
                  const active = selectedAddOns.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddOn(a.id)}
                      className={cn(
                        'flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition',
                        active
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-background hover:bg-muted'
                      )}
                    >
                      <div>
                        <div className="text-sm font-medium">{a.label}</div>
                        <div
                          className={cn(
                            'mt-0.5 text-xs',
                            active ? 'text-background/80' : 'text-muted-foreground'
                          )}
                        >
                          {a.hint}
                        </div>
                      </div>
                      <div
                        className={cn(
                          'mt-0.5 h-5 w-5 rounded-full border text-center text-xs leading-5',
                          active
                            ? 'border-background/30 bg-background/10'
                            : 'border-border bg-muted'
                        )}
                        aria-hidden
                      >
                        {active ? '✓' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* EXTRA PROMPT */}
          <div className="mt-6">
            <label className="text-sm font-medium">Extra wensen (optioneel)</label>
            <textarea
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
              placeholder={
                mode === 'interior'
                  ? 'Bijv. “lichte eiken vloer, warme indirecte verlichting, luxe hotel sfeer”.'
                  : timeOfDay === 'evening'
                  ? 'Bijv. “warme avondsetting, sfeervolle gevelverlichting, luxe twilight uitstraling”.'
                  : 'Bijv. “helder daglicht, frisse premium uitstraling, strakke tuinlijnen”.'
              }
              className="mt-2 h-24 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              We passen alleen de doelwoning aan — buren en omgeving blijven ongewijzigd.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-medium text-background shadow-sm transition hover:opacity-90',
                isGenerating && 'opacity-60'
              )}
            >
              <Wand2 className="h-4 w-4" />
              {isGenerating
                ? 'Genereren…'
                : mode === 'interior'
                ? 'Genereer interieur'
                : timeOfDay === 'evening'
                ? 'Genereer avond exterieur'
                : 'Genereer dag exterieur'}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!restyledImageUrl || isGenerating}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-medium shadow-sm transition hover:bg-muted',
                (!restyledImageUrl || isGenerating) && 'opacity-50'
              )}
            >
              <Download className="h-4 w-4" />
              Download resultaat
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </div>

        {/* RIGHT */}
        <div className="rounded-[30px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_70px_rgba(16,44,84,0.08)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Preview
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#102c54]">Voor / Na</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Origineel */}
            <div className="rounded-3xl border border-border bg-muted/70 p-4">
              <div className="text-sm font-medium">Origineel</div>

              <div className="mt-3">
                {originalPreview ? (
                  <LuxSquareImage src={originalPreview} alt="Origineel" priority />
                ) : (
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background">
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                      Upload een foto om te starten
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resultaat */}
            <div className="rounded-3xl border border-border bg-muted/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">
                  {mode === 'interior'
                    ? 'Interieur'
                    : timeOfDay === 'evening'
                    ? 'Exterieur · Avond fotografie'
                    : 'Exterieur · Dag fotografie'}
                </div>
                {restyledImageUrl ? (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted"
                    disabled={isGenerating}
                  >
                    Download
                  </button>
                ) : null}
              </div>

              <div className="mt-3 relative">
                {restyledImageUrl ? (
                  <LuxSquareImage src={restyledImageUrl} alt="Resultaat" />
                ) : (
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background">
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                      {mode === 'interior'
                        ? 'Genereer een interieur om resultaat te zien'
                        : `Genereer een ${
                            timeOfDay === 'evening' ? 'avond' : 'dag'
                          } exterieur om resultaat te zien`}
                    </div>
                  </div>
                )}

                {isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-[1px]">
                    <MagnifierSpinner
                      label={
                        mode === 'exterior'
                          ? timeOfDay === 'evening'
                            ? 'AI werkt aan je avondvisual…'
                            : 'AI werkt aan je dagvisual…'
                          : 'AI werkt aan je visual…'
                      }
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#dce6f3] bg-[#f8fbff] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#153c75]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-xs leading-relaxed text-[#5c6d86]">
                Let op: dit is een visuele concept-upgrade (staging). Resultaten zijn
                indicatief en kunnen afwijken door licht, perspectief en bronkwaliteit.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {SHOWCASE_IMAGES.slice(0, 2).map((image) => (
              <div
                key={image.src}
                className="relative overflow-hidden rounded-2xl border border-[#dce6f3] bg-white"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={image.src}
                    alt={image.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102c54]/45 to-transparent" />
                </div>
                <div className="absolute bottom-2 left-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-[#102c54] backdrop-blur-sm">
                  Inspiratie
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
