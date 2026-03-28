import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function parsePoint(wkt?: string): { lat: number; lng: number } | null {
  if (typeof wkt !== 'string') return null;
  const m = wkt.match(/POINT\(\s*([0-9.\-]+)\s+([0-9.\-]+)\s*\)/i);
  if (!m) return null;

  const lng = Number(m[1]);
  const lat = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim();
    if (!q) return NextResponse.json({ ok: false, error: 'Missing q' }, { status: 400 });

    const url =
      `https://geodata.nationaalgeoregister.nl/locatieserver/v3/suggest` +
      `?q=${encodeURIComponent(q)}` +
      `&fq=type:(adres OR woonplaats)` +
      `&rows=1`;

    const r = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'VastgoedExclusief/1.0' },
      cache: 'no-store',
    });

    if (!r.ok) {
      return NextResponse.json({ ok: false, error: `PDOK error (${r.status})` }, { status: 502 });
    }

    const data = await r.json();
    const doc = data?.response?.docs?.[0];
    const coords = parsePoint(doc?.centroide_ll);

    if (!coords) {
      return NextResponse.json({ ok: false, error: 'Geen coords gevonden' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      q,
      coords,
      label: doc?.weergavenaam ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 });
  }
}
