// app/api/ai/similar-explain/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { consumeOne, DEFAULT_MONTHLY_LIMIT } from '@/lib/ai/usage';
import OpenAI from 'openai';

// Forceer Node runtime (voorkomt Edge issues)
export const runtime = 'nodejs';

type TargetPayload = {
  city?: string | null;
  address?: string | null;
  postalCode?: string | null;
  type?: string | null;

  livingArea?: number | null;
  plotArea?: number | null;

  // ✅ nieuw: vraagprijs doelwoning (optioneel)
  targetPrice?: number | null;

  tags?: string[] | null;
  radiusKm?: number | null;
  minListingPrice?: number | null;
};

type ReferencePayload = {
  _id?: string;
  id?: string;
  title?: string;

  city?: string | null;
  address?: string | null;
  postalCode?: string | null;

  type?: string | null;

  price?: number | null;
  livingArea?: number | null;
  plotArea?: number | null;
  lotArea?: number | null;

  match10?: number | null;
  matchBand?: string | null;
  distanceKm?: number | null;
  why?: string | null;

  luxuryTags?: string[] | null;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function toNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.trim().replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function median(values: number[]) {
  if (!values.length) return null;
  const a = [...values].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 === 0 ? (a[mid - 1] + a[mid]) / 2 : a[mid];
}

function euro(n: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

function safeErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function getAgentIdFromSession(session: any): string | null {
  return session?.user?.email ?? null;
}

/**
 * Compute summary stats from references:
 * - price per m² (living)
 * - avg/median
 * - band (p10/p90-ish via min/max clamp)
 */
function summarizeReferences(refs: ReferencePayload[]) {
  const ppm2: number[] = [];
  const prices: number[] = [];

  for (const r of refs) {
    const price = toNum(r.price);
    const living = toNum(r.livingArea);
    if (price && living && living > 0) {
      prices.push(price);
      ppm2.push(price / living);
    }
  }

  if (!ppm2.length) {
    return {
      count: refs.length,
      validCount: 0,
      avgPpm2: null as number | null,
      medPpm2: null as number | null,
      minPpm2: null as number | null,
      maxPpm2: null as number | null,
      avgPrice: null as number | null,
      medPrice: null as number | null,
    };
  }

  const avgPpm2 = ppm2.reduce((a, b) => a + b, 0) / ppm2.length;
  const medPpm2 = median(ppm2);
  const minPpm2 = Math.min(...ppm2);
  const maxPpm2 = Math.max(...ppm2);

  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const medPrice = median(prices);

  return {
    count: refs.length,
    validCount: ppm2.length,
    avgPpm2,
    medPpm2,
    minPpm2,
    maxPpm2,
    avgPrice,
    medPrice,
  };
}

function computeTargetPosition(params: {
  targetPrice?: number | null;
  targetLivingArea?: number | null;
  refMedianPpm2?: number | null;
}) {
  const targetPrice = toNum(params.targetPrice);
  const living = toNum(params.targetLivingArea);
  const refMed = params.refMedianPpm2 ?? null;

  if (!targetPrice || !living || living <= 0 || !refMed || refMed <= 0) {
    return {
      ok: false,
      targetPpm2: null as number | null,
      deviationPct: null as number | null,
      label: 'Onbekend' as const,
    };
  }

  const targetPpm2 = targetPrice / living;
  const deviation = (targetPpm2 - refMed) / refMed;
  const deviationPct = Math.round(deviation * 100);

  let label: 'Onder markt' | 'Conform markt' | 'Boven markt' | 'Sterk boven markt' = 'Conform markt';
  if (deviation < -0.05) label = 'Onder markt';
  else if (deviation <= 0.05) label = 'Conform markt';
  else if (deviation <= 0.15) label = 'Boven markt';
  else label = 'Sterk boven markt';

  return { ok: true, targetPpm2, deviationPct, label };
}

function compactRefList(refs: ReferencePayload[], max = 12) {
  return refs.slice(0, max).map((r) => {
    const price = toNum(r.price);
    const living = toNum(r.livingArea);
    const ppm2 = price && living && living > 0 ? Math.round(price / living) : null;

    return {
      title: r.title ?? null,
      city: r.city ?? null,
      address: r.address ?? null,
      price: price ?? null,
      livingArea: living ?? null,
      pricePerM2: ppm2,
      distanceKm: toNum(r.distanceKm),
      match10: toNum(r.match10),
      why: r.why ?? null,
      tags: Array.isArray(r.luxuryTags) ? r.luxuryTags.slice(0, 6) : [],
    };
  });
}

// ✅ Juridisch veilige system prompt (met expliciete disclaimer)
const SYSTEM_PROMPT = `
Je bent een ervaren Nederlandse makelaar/waarderingsspecialist in het hogere segment.
Je geeft uitsluitend een indicatieve marktinschatting (geen taxatie, niet bindend, niet geschikt voor financiering).
Gebruik géén live externe databronnen of websites. Werk met de meegeleverde referenties en algemene marktlogica.
Schrijf zakelijk, helder en professioneel. Vermijd "AI-achtige" taal.

Output structuur:
1) Korte conclusie (1 alinea)
2) Marktpositie (onder/conform/boven) + toelichting
3) Bandbreedte (conservatief/realistisch/ambitieus) met argumenten
4) Belangrijkste waardedrijvers (bulletpoints)
5) Risico's en verkoopstrategie (bulletpoints)
6) Disclaimer (1 zin)
`;

export async function POST(req: Request) {
  try {
    // 0) Auth
    const session = await getServerSession(authOptions);
    const agentId = getAgentIdFromSession(session);
    if (!agentId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1) Usage quota
    const usageResult: any = await consumeOne(agentId, DEFAULT_MONTHLY_LIMIT);

    // Ondersteun verschillende signatures (jij had eerder varianten)
    const usageOk =
      usageResult?.ok === true ||
      usageResult?.allowed === true ||
      usageResult?.success === true;

    if (!usageOk) {
      const remaining = usageResult?.remaining ?? 0;
      const limit = usageResult?.limit ?? DEFAULT_MONTHLY_LIMIT;
      const count = usageResult?.count ?? (limit - remaining);
      const message = usageResult?.error || usageResult?.message || 'Monthly limit reached';

      return NextResponse.json(
        {
          ok: false,
          error: message,
          usage: { count, limit, remaining },
        },
        { status: 429 }
      );
    }

    const usage = usageResult?.usage ?? {
      count: usageResult?.count ?? 0,
      limit: usageResult?.limit ?? DEFAULT_MONTHLY_LIMIT,
      remaining: usageResult?.remaining ?? Math.max(0, DEFAULT_MONTHLY_LIMIT - (usageResult?.count ?? 0)),
    };

    // 2) Body
    const body = await req.json().catch(() => null);
    const target: TargetPayload = body?.target ?? {};
    const references: ReferencePayload[] = Array.isArray(body?.references) ? body.references : [];

    if (!references.length) {
      return NextResponse.json({ ok: false, error: 'Geen referenties meegegeven', usage }, { status: 400 });
    }

    // 3) Derivations
    const refSummary = summarizeReferences(references);
    const targetPos = computeTargetPosition({
      targetPrice: target.targetPrice ?? null,
      targetLivingArea: target.livingArea ?? null,
      refMedianPpm2: refSummary.medPpm2,
    });

    // 4) Prompt inputs
    const locationLine = [
      isNonEmptyString(target.address) ? target.address.trim() : null,
      isNonEmptyString(target.postalCode) ? target.postalCode.trim() : null,
      isNonEmptyString(target.city) ? target.city.trim() : null,
    ].filter(Boolean).join(', ');

    const targetLiving = toNum(target.livingArea);
    const targetPlot = toNum(target.plotArea);
    const targetPrice = toNum(target.targetPrice);

    const prompt = `
Context (2026):
- Land: Nederland
- Jaar: 2026

Doelwoning:
- Locatie: ${locationLine || '—'}
- Type: ${target.type ?? '—'}
- Woonopp: ${targetLiving ? `${targetLiving} m²` : '—'}
- Perceel: ${targetPlot ? `${targetPlot} m²` : '—'}
- Vraagprijs (optioneel): ${targetPrice ? euro(targetPrice) : '—'}
- Luxe kenmerken: ${Array.isArray(target.tags) && target.tags.length ? target.tags.join(', ') : '—'}
- Zoekradius: ${target.radiusKm ?? '—'} km
- Min. referentie vraagprijs: ${target.minListingPrice ? euro(target.minListingPrice) : '—'}

Samenvatting referenties (op basis van prijs + woonopp):
- Aantal referenties ontvangen: ${refSummary.count}
- Aantal valide voor €/m²: ${refSummary.validCount}
- Mediaan €/m² (refs): ${refSummary.medPpm2 ? `${euro(Math.round(refSummary.medPpm2))}/m²` : '—'}
- Gemiddelde €/m² (refs): ${refSummary.avgPpm2 ? `${euro(Math.round(refSummary.avgPpm2))}/m²` : '—'}
- Bandbreedte €/m² (min-max refs): ${
      refSummary.minPpm2 && refSummary.maxPpm2
        ? `${euro(Math.round(refSummary.minPpm2))} – ${euro(Math.round(refSummary.maxPpm2))}/m²`
        : '—'
    }

Marktpositie t.o.v. referenties (alleen als vraagprijs is ingevuld):
- Status: ${targetPos.ok ? targetPos.label : 'Onbekend (vraagprijs of woonopp ontbreekt)'}
- Doel €/m²: ${targetPos.ok && targetPos.targetPpm2 ? `${euro(Math.round(targetPos.targetPpm2))}/m²` : '—'}
- Afwijking t.o.v. mediaan refs: ${targetPos.ok && targetPos.deviationPct != null ? `${targetPos.deviationPct}%` : '—'}

Referenties (compact; top 12):
${JSON.stringify(compactRefList(references, 12), null, 2)}

Taak:
- Geef een professionele, indicatieve marktinschatting.
- Gebruik de referenties (€/m², afstand, matchscore/why) als kern.
- Werk 3 scenario’s uit (conservatief/realistisch/ambitieus) met bandbreedte.
- Als vraagprijs bekend is: benoem of die onder/conform/boven markt ligt en wat dat betekent voor verkoopsnelheid/strategie.
- Sluit af met 1 zin disclaimer.
`;

    // 5) OpenAI call
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const resp = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      // bewust geen temperature om model-mismatches te voorkomen
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    const text = (resp.output_text || '').trim();
    if (!text) {
      return NextResponse.json(
        { ok: false, error: 'Leeg AI antwoord', usage },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      text,
      usage,
      meta: {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        year: 2026,
        refCount: refSummary.count,
        validRefCount: refSummary.validCount,
        targetPosition: targetPos.ok
          ? {
              label: targetPos.label,
              deviationPct: targetPos.deviationPct,
              targetPricePerM2: targetPos.targetPpm2 ? Math.round(targetPos.targetPpm2) : null,
            }
          : null,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: safeErrorMessage(err) },
      { status: 500 }
    );
  }
}

