export type PdokGeocodeResult = {
  lat: number;
  lng: number;
  label?: string;
};

export async function geocodeCityWithPDOK(cityRaw: string): Promise<PdokGeocodeResult | null> {
  const city = (cityRaw || '').trim();
  if (!city) return null;

  const url = new URL('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free');
  url.searchParams.set('q', city);
  url.searchParams.set('rows', '1');
  url.searchParams.set('fq', 'type:woonplaats');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const json = await res.json();
    const doc = json?.response?.docs?.[0];
    if (!doc) return null;

    const wkt: string | undefined = doc?.centroide_ll;
    if (!wkt) return null;

    const match = wkt.match(/POINT\(\s*([0-9.\-]+)\s+([0-9.\-]+)\s*\)/i);
    if (!match) return null;

    const lng = Number(match[1]);
    const lat = Number(match[2]);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const latRounded = Math.round(lat * 1e5) / 1e5;
    const lngRounded = Math.round(lng * 1e5) / 1e5;

    return {
      lat: latRounded,
      lng: lngRounded,
      label: doc?.weergavenaam,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
