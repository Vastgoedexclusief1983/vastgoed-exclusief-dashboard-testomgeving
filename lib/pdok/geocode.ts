// lib/pdok/geocode.ts
export type PdokGeocodeInput = {
  city?: string;
  address?: string;     // bijv. "Wilhelminakade 569"
  postalCode?: string;  // bijv. "3072AP" of "3072 AP"
};

export type PdokGeocodeResult = {
  lat: number;
  lng: number;
  label: string;
  source: 'pdok';
};

function normalizePostalCode(pc?: string) {
  if (!pc) return '';
  return pc.replace(/\s+/g, '').toUpperCase().trim();
}

function clean(s?: string) {
  return (s ?? '').toString().trim();
}

function buildQuery(input: PdokGeocodeInput) {
  const city = clean(input.city);
  const address = clean(input.address);
  const postalCode = normalizePostalCode(input.postalCode);

  // Beste nauwkeurigheid: postcode + huisnr (zit vaak in address)
  // Voorbeeld: "3072AP Wilhelminakade 569 Rotterdam"
  const parts = [postalCode, address, city].filter(Boolean);
  return parts.join(' ').trim();
}

async function fetchJsonWithTimeout(url: string, ms = 6500) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function geocodeNlPdok(
  input: PdokGeocodeInput
): Promise<PdokGeocodeResult | null> {
  const q = buildQuery(input);
  if (!q) return null;

  // PDOK Locatieserver v3.1 "free"
  // We proberen eerst adres (nauwkeurig), daarna woonplaats (fallback)
  const qEnc = encodeURIComponent(q);

  // 1) Adres poging (type:adres)
  const urlAdres =
    `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free` +
    `?q=${qEnc}` +
    `&rows=1` +
    `&fq=type:adres`;

  const dataAdres = await fetchJsonWithTimeout(urlAdres);
  const docAdres = dataAdres?.response?.docs?.[0];

  if (docAdres?.centroide_ll) {
    // "POINT(lon lat)"
    const m = String(docAdres.centroide_ll).match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
    if (m) {
      const lng = Number(m[1]);
      const lat = Number(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const label =
          docAdres.weergavenaam ||
          `${clean(input.address)} ${normalizePostalCode(input.postalCode)} ${clean(input.city)}`.trim() ||
          q;

        return { lat, lng, label, source: 'pdok' };
      }
    }
  }

  // 2) Fallback: woonplaats (type:woonplaats) als alleen stad/plaats is ingevuld
  const urlWoonplaats =
    `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free` +
    `?q=${qEnc}` +
    `&rows=1` +
    `&fq=type:woonplaats`;

  const dataWp = await fetchJsonWithTimeout(urlWoonplaats);
  const docWp = dataWp?.response?.docs?.[0];

  if (docWp?.centroide_ll) {
    const m = String(docWp.centroide_ll).match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
    if (m) {
      const lng = Number(m[1]);
      const lat = Number(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const label = docWp.weergavenaam || clean(input.city) || q;
        return { lat, lng, label, source: 'pdok' };
      }
    }
  }

  return null;
}
