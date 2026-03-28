import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { consumeOne } from '@/lib/ai/usage';
import { addImpressieWatermark } from '@/lib/images/addImpressieWatermark';

export const runtime = 'nodejs';

type TimeOfDay = 'day' | 'evening';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function safeErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function normalizeTimeOfDay(value: unknown): TimeOfDay {
  const v = String(value ?? '').trim().toLowerCase();

  if (v === 'evening' || v === 'avond') return 'evening';
  return 'day';
}

function buildTimeOfDayInstruction(timeOfDay: TimeOfDay) {
  if (timeOfDay === 'evening') {
    return [
      'Maak er een overtuigende avond-/schemerpresentatie van.',
      'Gebruik warme luxe verlichting, sfeervolle buitenlampen en een high-end twilight uitstraling.',
      'Behoud realisme: natuurlijke schaduwen, geloofwaardige lichtbronnen en realistische reflecties.',
      'Laat de woning exclusief, warm en premium ogen in avondsetting.',
    ].join(' ');
  }

  return [
    'Maak er een overtuigende dagpresentatie van.',
    'Gebruik helder natuurlijk daglicht, frisse luchtige uitstraling en realistische buitenbelichting.',
    'Behoud realisme: natuurlijke schaduwen, geloofwaardige lichtinval en realistische reflecties.',
    'Laat de woning exclusief, fris en premium ogen in dagsetting.',
  ].join(' ');
}

/**
 * Bouw een “juridisch veilige” restyle prompt:
 * - nadruk op staging / virtuele inrichting / presentatie
 * - geen misleiding / geen constructieve wijzigingen
 */
function buildPrompt(
  presetPrompt: string,
  timeOfDay: TimeOfDay,
  extraPrompt?: string
) {
  const extra = isNonEmptyString(extraPrompt) ? `\nExtra wensen: ${extraPrompt.trim()}` : '';
  const timeOfDayInstruction = buildTimeOfDayInstruction(timeOfDay);

  return [
    'Doel: Virtuele restyling voor woningpresentatie (staging).',
    'Belangrijk: behoud exacte architectuur, perspectief en indeling. Geen structurele wijzigingen (geen ramen verplaatsen, geen muren verwijderen, geen aanbouw).',
    'Houd het realistisch, fotorealistisch, high-end en consistent met natuurlijke belichting.',
    'Verwijder rommel alleen als het logisch is (niet “invent” rare objecten).',
    'Voeg geen tekst, logo’s of labels toe in de scène zelf.',
    timeOfDayInstruction,
    '',
    presetPrompt,
    extra,
  ].join('\n');
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;

    if (!email) {
      return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY ontbreekt in environment variables.' },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const image = form.get('image');
    const preset = String(form.get('preset') ?? '').trim();
    const extraPrompt = String(form.get('extraPrompt') ?? '').trim();
    const timeOfDay = normalizeTimeOfDay(form.get('timeOfDay'));

    if (!(image instanceof File)) {
      return NextResponse.json({ error: 'Upload een geldige afbeelding.' }, { status: 400 });
    }

    if (!preset) {
      return NextResponse.json({ error: 'Preset ontbreekt.' }, { status: 400 });
    }

   const PRESET_PROMPTS: Record<string, string> = {
  modern_luxe:
    'Modern luxury interior styling. Clean lines, premium materials, neutral palette, subtle warm lighting, elegant furniture, high-end finish. Preserve architecture and perspective.',
  hotel_chique:
    'Hotel chic styling: warm ambient lighting, sophisticated textures, marble/bronze accents, curated decor, boutique hotel atmosphere. Preserve room layout and realism.',
  japandi:
    'Japandi interior: minimal, calm, natural wood, linen textures, soft neutral colors, uncluttered, premium simplicity. Keep the same room geometry and perspective.',
  scandinavisch:
    'Scandinavian interior style: bright, airy, timeless, light wood, soft whites and greys, cozy but minimal. Keep the original room structure and perspective.',
  landelijk:
    'Refined country style: warm natural tones, tasteful classic elements, high-quality fabrics, subtle rustic charm, cozy but premium. Maintain realism and room layout.',
  minimalistisch:
    'High-end minimalism: reduce clutter, clean surfaces, premium minimal furniture, neutral tones, elegant lighting. Keep architecture unchanged and realistic.',
  industrieel:
    'Luxury industrial style: concrete/steel accents, refined industrial lighting, premium leather/wood details, modern loft vibe. Preserve realism and room geometry.',
  mediterrane_villa:
    'Mediterranean villa vibe: warm sunlit tones, natural stone/terracotta accents, airy elegance, tasteful decor. Keep realistic lighting and the same perspective.',
  moderne_villa:
    'Modern luxury exterior styling. Sharp lines, refined landscaping, premium materials, elegant outdoor living, architectural lighting, high-end villa presentation. Preserve architecture and perspective.',
  landgoed_classic:
    'Classic luxury estate styling. Timeless elegance, refined facade accents, premium landscaping, tasteful symmetry, stately presentation. Preserve structure and realism.',
  scandi_modern:
    'Scandinavian modern exterior styling. Clean lines, calm premium materials, refined natural palette, understated landscaping, high-end minimalist appeal. Preserve architecture and realism.',
};

    const presetPrompt = PRESET_PROMPTS[preset];
    if (!presetPrompt) {
      return NextResponse.json({ error: `Onbekende preset: ${preset}` }, { status: 400 });
    }

    const creditCost = 5;
    const consume: any = consumeOne as any;

    try {
      console.log('[restyle] credits: start', { email, creditCost });

      for (let i = 0; i < creditCost; i++) {
        await consume(email);
      }

      console.log('[restyle] credits: done', { email, creditCost });
    } catch (e) {
      console.error('[restyle] credits: failed', { email, detail: safeErrorMessage(e) });
      return NextResponse.json(
        { error: 'Onvoldoende credits of usage error.', detail: safeErrorMessage(e) },
        { status: 402 }
      );
    }

    const prompt = buildPrompt(presetPrompt, timeOfDay, extraPrompt);

    const upstream = new FormData();
    upstream.append('model', 'gpt-image-1.5');
    upstream.append('prompt', prompt);
    upstream.append('image[]', image, image.name);
    upstream.append('output_format', 'png');
    upstream.append('quality', 'high');
    upstream.append('size', '1536x1024');
    upstream.append('user', email);

    const r = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: upstream,
    });

    const json = await r.json();

    if (!r.ok) {
      return NextResponse.json(
        { error: 'OpenAI fout bij restylen.', detail: json },
        { status: 500 }
      );
    }

    const imageB64 = json?.data?.[0]?.b64_json ?? null;
    if (!imageB64) {
      return NextResponse.json({ error: 'Geen image ontvangen van OpenAI.' }, { status: 500 });
    }

    const generatedBuffer = Buffer.from(imageB64, 'base64');

    const watermarkedBuffer = await addImpressieWatermark(generatedBuffer, {
      margin: 28,
    });

    const finalImageB64 = watermarkedBuffer.toString('base64');

    return NextResponse.json({ imageB64: finalImageB64 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error in restyle route.', detail: safeErrorMessage(err) },
      { status: 500 }
    );
  }
}
