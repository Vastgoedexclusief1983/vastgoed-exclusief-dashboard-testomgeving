// app/api/ai/ask/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import OpenAI from 'openai';
import { z } from 'zod';

import { authOptions } from '@/lib/auth/auth-options';
import { consumeOne } from '@/lib/ai/usage';

// Forceer Node runtime (voorkomt Edge issues)
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getAgentIdFromSession(session: any): string | null {
  return session?.user?.email ?? null;
}

function safeErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * 2026-proof marktcontext (conservatief & uitbreidbaar)
 * Tip: maak dit later dynamisch via MongoDB (market_data collectie) i.p.v. hardcoded.
 */
type Band = { min: number; max: number; note?: string };

const NATIONAL_BASE_2026: Band = {
  min: 3500,
  max: 6500,
  note:
    'Nationale bandbreedte als fallback (sterk afhankelijk van regio, woningtype, afwerking en segment).',
};

const PRICE_PER_M2_2026: Record<string, Band> = {
  // Randstad (globaal)
  randstad: { min: 6200, max: 8500, note: 'Randstad gemiddeld (indicatief).' },

  // Luxe hotspots / segmenten
  amsterdam_zuid: { min: 9000, max: 14000, note: 'Luxe segment (indicatief).' },
  bloemendaal: { min: 7500, max: 10500, note: 'Villa/ruime gezinswoningen (indicatief).' },
  wassenaar: { min: 7000, max: 10500, note: 'Topsegment, afhankelijk van kavel & ligging.' },
  laren: { min: 6500, max: 10000, note: 'Gooi, topsegment afhankelijk van ligging.' },

  // Overige voorbeelden
  rotterdam_kralingen: { min: 5500, max: 7500, note: 'Sterke wijk, segmentafhankelijk.' },
  utrecht: { min: 6000, max: 9000, note: 'Stad gemiddeld (indicatief).' },
  eindhoven_centrum: { min: 4800, max: 6200, note: 'Centrum, segmentafhankelijk.' },
};

function norm(s: unknown) {
  return String(s ?? '').trim().toLowerCase();
}

function detectRegionKey(input: { city?: string; neighborhood?: string; address?: string }): string | null {
  const city = norm(input.city);
  const hood = norm(input.neighborhood);
  const address = norm(input.address);
  const blob = `${city} ${hood} ${address}`.trim();

  // Specifiek eerst
  if (blob.includes('amsterdam') && (blob.includes('zuid') || hood.includes('zuid'))) return 'amsterdam_zuid';
  if (blob.includes('bloemendaal')) return 'bloemendaal';
  if (blob.includes('wassenaar')) return 'wassenaar';
  if (blob.includes('laren')) return 'laren';
  if (blob.includes('kralingen')) return 'rotterdam_kralingen';
  if (blob.includes('utrecht')) return 'utrecht';
  if (blob.includes('eindhoven') && (blob.includes('centrum') || hood.includes('centrum'))) return 'eindhoven_centrum';

  // Brede bucket
  if (
    blob.includes('amsterdam') ||
    blob.includes('haarlem') ||
    blob.includes('utrecht') ||
    blob.includes('rotterdam') ||
    blob.includes('den haag') ||
    blob.includes('delft') ||
    blob.includes('leiden') ||
    blob.includes('amstelveen') ||
    blob.includes('hilversum')
  ) {
    return 'randstad';
  }

  return null;
}

function finishMultiplier(finish?: 'opknapper' | 'gemiddeld' | 'hoog' | 'top') {
  // Conservatief: kleine bandverschillen; model motiveert nuance.
  switch (finish) {
    case 'opknapper':
      return 0.9;
    case 'gemiddeld':
      return 1.0;
    case 'hoog':
      return 1.08;
    case 'top':
      return 1.15;
    default:
      return 1.0;
  }
}

function calcIndicativeRange(params: { woonoppervlakteM2?: number; band: Band; segmentMultiplier?: number }) {
  const area = params.woonoppervlakteM2;
  const m = params.segmentMultiplier ?? 1;

  if (!area || !Number.isFinite(area) || area <= 0) return null;

  const min = Math.round(area * params.band.min * m);
  const max = Math.round(area * params.band.max * m);
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

/**
 * Input schema
 * - Backwards compatible: je UI kan alleen { question } sturen.
 * - Maar je kunt later structured velden meegeven voor veel betere schattingen.
 */
const BodySchema = z.object({
  question: z.string().min(3).max(4000),

  address: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),

  propertyType: z
    .enum(['appartement', 'tussenwoning', 'hoekwoning', '2-onder-1-kap', 'vrijstaand', 'villa', 'recreatie'])
    .optional(),

  woonoppervlakteM2: z.number().positive().max(2000).optional(),
  perceelM2: z.number().positive().max(200000).optional(),
  bouwjaar: z.number().int().min(1500).max(2100).optional(),
  energielabel: z.string().optional(),
  bedrooms: z.number().int().min(0).max(30).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),

  finishLevel: z.enum(['opknapper', 'gemiddeld', 'hoog', 'top']).optional(),
});

function buildSystemPrompt(input: {
  year: number;
  regionKey: string | null;
  band: Band;
  indicativeRange: { min: number; max: number } | null;
  body: z.infer<typeof BodySchema>;
}) {
  const { year, regionKey, band, indicativeRange, body } = input;

  const bandLine = `Indicatieve prijsband (€/m²) voor regio "${regionKey ?? 'onbekend/fallback'}": €${band.min.toLocaleString(
    'nl-NL'
  )} – €${band.max.toLocaleString('nl-NL')} per m².`;

  const rangeLine = indicativeRange
    ? `Op basis van woonoppervlakte ${body.woonoppervlakteM2} m² resulteert dit indicatief in: €${indicativeRange.min.toLocaleString(
        'nl-NL'
      )} – €${indicativeRange.max.toLocaleString('nl-NL')} (bandbreedte, vóór nuance).`
    : `Woonoppervlakte ontbreekt of is niet bruikbaar; geef daarom primair een bandbreedte en welke gegevens nodig zijn voor verfijning.`;

  return `
Je bent een zeer ervaren Nederlands vastgoedadviseur (40+ jaar) gespecialiseerd in het hogere en luxe segment.

TIJDCONTEXT
- Het is jaar ${year}. Houd rekening met marktcondities passend bij ${year}.

KERNOPDRACHT
- Geef een realistische indicatieve verkoopprijs / vraagprijsbandbreedte voor Nederlandse woningen.
- Werk ALTIJD met bandbreedtes (laag/midden/hoog) en benoem aannames.
- Als gegevens ontbreken: noem concreet welke inputs nodig zijn om te verfijnen.
- Noem geen specifieke databronnen/websites, en beweer niet dat je live data hebt opgezocht.

MARKTCONTEXT (houvast)
- ${bandLine}
- ${rangeLine}

OUTPUTFORMAT (BELANGRIJK)
Geef je antwoord als JSON (geen markdown) met exact deze velden:
{
  "samenvatting": string,
  "bandbreedte": { "laag": number|null, "midden": number|null, "hoog": number|null, "toelichting": string },
  "prijsPerM2": { "min": number, "max": number, "regioKey": string|null, "toelichting": string },
  "aannames": string[],
  "gevoeligheden": string[],
  "benodigdeAanvullendeInfo": string[],
  "disclaimer": string
}

DISLCAIMERTEKST (exact opnemen in JSON.disclaimer)
"Indicatieve waardebepaling op basis van beperkte input en marktbandbreedtes. Geen officieel taxatierapport. Voor een definitieve waarde zijn o.a. exacte woningkenmerken, staat van onderhoud, kavel, ligging, VvE/erfpacht (indien van toepassing) en recente transacties vereist."
`.trim();
}

function toPlainAnswer(result: any): string {
  const s = String(result?.samenvatting ?? '').trim();
  const b = result?.bandbreedte ?? {};
  const laag = typeof b.laag === 'number' ? b.laag : null;
  const midden = typeof b.midden === 'number' ? b.midden : null;
  const hoog = typeof b.hoog === 'number' ? b.hoog : null;

  const bandText =
    laag != null && hoog != null
      ? `Bandbreedte: €${laag.toLocaleString('nl-NL')} – €${hoog.toLocaleString('nl-NL')}${
          midden != null ? ` (midden: €${midden.toLocaleString('nl-NL')})` : ''
        }.`
      : '';

  const toel = typeof b.toelichting === 'string' ? b.toelichting.trim() : '';
  const disclaimer = typeof result?.disclaimer === 'string' ? result.disclaimer.trim() : '';

  return [s, bandText, toel, disclaimer].filter(Boolean).join('\n\n');
}

export async function POST(req: Request) {
  try {
    // 0) Auth
    const session = await getServerSession(authOptions);
    const agentId = getAgentIdFromSession(session);

    if (!agentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1) Body
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsed.data;

    // 2) Usage/credits (consumeOne in jouw project retourneert direct usage object)
    //    Als limiet bereikt is: sommige implementaties gooien een error of retourneren iets met remaining=0.
    let usage: any;
    try {
    usage = await consumeOne(agentId);
    } catch (e) {
      return NextResponse.json(
        {
          error: 'Monthly limit reached',
          details: safeErrorMessage(e),
          usage: null,
        },
        { status: 429 }
      );
    }

    // Extra safety: als remaining bestaat en 0 is, blokkeer ook.
    if (usage && typeof usage.remaining === 'number' && usage.remaining <= 0) {
      return NextResponse.json(
        {
          error: 'Monthly limit reached',
          usage,
        },
        { status: 429 }
      );
    }

    // 3) Marktcontext bepalen
    const year = new Date().getFullYear(); // automatisch 2026 en verder
    const regionKey = detectRegionKey({
      city: body.city,
      neighborhood: body.neighborhood,
      address: body.address,
    });

    const band = regionKey && PRICE_PER_M2_2026[regionKey] ? PRICE_PER_M2_2026[regionKey] : NATIONAL_BASE_2026;

    const indicativeRange = calcIndicativeRange({
      woonoppervlakteM2: body.woonoppervlakteM2,
      band,
      segmentMultiplier: finishMultiplier(body.finishLevel),
    });

    const systemPrompt = buildSystemPrompt({
      year,
      regionKey,
      band,
      indicativeRange,
      body,
    });

    // 4) User prompt verrijken met context (als aanwezig)
    const contextLines: string[] = [];
    if (body.address) contextLines.push(`Adres/locatie: ${body.address}`);
    if (body.city) contextLines.push(`Plaats: ${body.city}`);
    if (body.neighborhood) contextLines.push(`Wijk/buurt: ${body.neighborhood}`);
    if (body.propertyType) contextLines.push(`Type: ${body.propertyType}`);
    if (body.woonoppervlakteM2) contextLines.push(`Woonoppervlakte: ${body.woonoppervlakteM2} m²`);
    if (body.perceelM2) contextLines.push(`Perceel: ${body.perceelM2} m²`);
    if (body.bouwjaar) contextLines.push(`Bouwjaar: ${body.bouwjaar}`);
    if (body.energielabel) contextLines.push(`Energielabel: ${body.energielabel}`);
    if (body.bedrooms != null) contextLines.push(`Slaapkamers: ${body.bedrooms}`);
    if (body.bathrooms != null) contextLines.push(`Badkamers: ${body.bathrooms}`);
    if (body.finishLevel) contextLines.push(`Afwerking: ${body.finishLevel}`);

    const userPrompt = `
Vraag:
${body.question}

Beschikbare context:
${contextLines.length ? contextLines.map((l) => `- ${l}`).join('\n') : '- (geen extra context meegegeven)'}
`.trim();

    // 5) Model call (geen temperature meesturen -> voorkomt incompatibiliteit)
    const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

    const resp = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const raw = resp.choices?.[0]?.message?.content?.trim() ?? '';

    // 6) JSON parse met fallback
    let result: any;
    try {
      result = JSON.parse(raw);
    } catch {
      result = {
        samenvatting: raw.slice(0, 1500),
        bandbreedte: { laag: null, midden: null, hoog: null, toelichting: 'Model output was not valid JSON.' },
        prijsPerM2: { min: band.min, max: band.max, regioKey: regionKey, toelichting: band.note ?? '' },
        aannames: [],
        gevoeligheden: [],
        benodigdeAanvullendeInfo: [],
        disclaimer:
          'Indicatieve waardebepaling op basis van beperkte input en marktbandbreedtes. Geen officieel taxatierapport. Voor een definitieve waarde zijn o.a. exacte woningkenmerken, staat van onderhoud, kavel, ligging, VvE/erfpacht (indien van toepassing) en recente transacties vereist.',
      };
    }

    // 7) Post-process: bandbreedte garanderen als we een indicativeRange hebben
    const b = result?.bandbreedte ?? {};
    const laag = typeof b.laag === 'number' ? b.laag : null;
    const midden = typeof b.midden === 'number' ? b.midden : null;
    const hoog = typeof b.hoog === 'number' ? b.hoog : null;

    if (indicativeRange && (laag === null || hoog === null)) {
      const mid = Math.round((indicativeRange.min + indicativeRange.max) / 2);
      result.bandbreedte = {
        laag: laag ?? indicativeRange.min,
        midden: midden ?? mid,
        hoog: hoog ?? indicativeRange.max,
        toelichting:
          typeof b.toelichting === 'string' && b.toelichting.trim().length
            ? b.toelichting
            : 'Bandbreedte afgeleid van regio-band (€/m²) en woonoppervlakte; nuanceer met staat, ligging, kavel en afwerking.',
      };
    }

    // 8) Plain answer (voor jouw huidige UI)
    const answer = toPlainAnswer(result);

    return NextResponse.json({
      ok: true,
      model,
      year,
      regionKey,
      marketBand: band,
      usage,   // <- direct object uit consumeOne
      result,  // structured JSON
      answer,  // tekst voor frontend
      raw,     // debug; als je dit niet wilt exposen -> verwijderen
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'AI request failed', details: safeErrorMessage(err) },
      { status: 500 }
    );
  }
}

