import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Escape voor regex (veilig bij speciale tekens)
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalize(input: unknown): string {
  return (input ?? '').toString().trim();
}

function parseTags(input: string): string[] {
  return normalize(input)
    .split(',')
    .map((t: string) => t.trim().toLowerCase())
    .filter((t: string) => Boolean(t));
}

// Normaliseer stad/plaats (voor betrouwbare vergelijking)
function normCity(v: unknown): string {
  return normalize(v).toLowerCase();
}

function sameCity(a: unknown, b: unknown): boolean {
  const A = normCity(a);
  const B = normCity(b);
  return !!A && !!B && A === B;
}

// Haal city uit document op meerdere plekken
function getCity(p: any): string | null {
  return (
    p?.basicInfo?.address?.city ||
    p?.basicInfo?.city ||
    p?.basicInfo?.location?.city ||
    p?.basicInfo?.place ||
    p?.place ||
    p?.city ||
    // location.city als laatste (kan fout/inconsistent zijn)
    p?.location?.city ||
    null
  );
}

/**
 * Probeer straat/adresregel te vinden zonder dat je meteen afhankelijk bent van 1 schema.
 * Let op: sommige documenten hebben `basicInfo.address.address` (volledige regel),
 * andere hebben `street`, `line1`, etc.
 */
function getStreet(p: any): string | null {
  const v =
    p?.basicInfo?.address?.street ||
    p?.basicInfo?.address?.streetName ||
    p?.basicInfo?.street ||
    p?.street ||
    p?.address?.street ||
    p?.location?.street ||
    p?.location?.streetName ||
    null;

  if (!v) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

/**
 * Als je wél een complete address line hebt (kan straat + huisnr zijn),
 * dan pakken we die ook mee.
 */
function getAddressLineRaw(p: any): string | null {
  const v =
    p?.basicInfo?.address?.address ||
    p?.basicInfo?.address?.line1 ||
    p?.basicInfo?.address?.adres ||
    p?.address?.address ||
    p?.address?.line1 ||
    p?.address ||
    null;

  if (!v) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function getPostalCode(p: any): string | null {
  return (
    p?.basicInfo?.address?.postalCode ||
    p?.basicInfo?.postalCode ||
    p?.postalCode ||
    null
  );
}

// Postcode4: "1011 AB" -> "1011"
function toPostcode4(postal?: string | null): string | null {
  const s = normalize(postal || '').toUpperCase().replace(/\s+/g, '');
  const m = s.match(/^(\d{4})[A-Z]{0,2}$/);
  return m ? m[1] : null;
}

// Haal prijs uit document op meerdere plekken
function getPrice(p: any): number | null {
  return (
    p?.basicInfo?.basePrice ??
    p?.valuation?.basePrice ??
    p?.valuation?.askingPrice ??
    p?.price ??
    null
  );
}

// Haal tags uit luxuryFeatures object (true keys)
function getLuxuryTags(p: any): string[] {
  const lf = p?.luxuryFeatures;
  if (!lf || typeof lf !== 'object') return [];
  return Object.keys(lf).filter((k) => lf?.[k] === true);
}

// PDOK (locatieserver) -> centroid_ll is "POINT(lon lat)"
function parsePdokPoint(point?: string | null): { lat: number; lng: number } | null {
  if (!point) return null;
  const m = point.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!m) return null;

  const lng = Number(m[1]);
  const lat = Number(m[2]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

// Geocode helper (postcode4 of plaats) via PDOK
async function geocodeViaPdok(query: string): Promise<{
  lat: number;
  lng: number;
  label: string;
  source: 'pdok';
} | null> {
  const q = normalize(query);
  if (!q) return null;

  const url = new URL('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free');
  url.searchParams.set('q', q);
  url.searchParams.set('rows', '1');

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) return null;

  const data: any = await res.json();
  const doc = data?.response?.docs?.[0];
  const point = parsePdokPoint(doc?.centroide_ll);
  if (!point) return null;

  return {
    lat: point.lat,
    lng: point.lng,
    label: doc?.weergavenaam || q,
    source: 'pdok',
  };
}

/**
 * Grof NL-bounds check om omgewisselde/kapotte coords te vermijden.
 * Hiermee voorkom je “markers in België/Duitsland” door lat/lng swap of parsing issues.
 */
function isLikelyNL(lat: number, lng: number): boolean {
  return lat >= 50.7 && lat <= 53.7 && lng >= 3.0 && lng <= 7.3;
}

/**
 * Lees DB-coördinaten uit meerdere mogelijke schema’s.
 * - GeoJSON: geo.coordinates = [lng, lat]
 * - GeoJSON variant: location.coordinates = [lng, lat]
 * - Lat/lng: location.lat + location.lng
 * - Optioneel: basicInfo.location.lat/lng
 */
function getDbCoords(p: any): { lat: number; lng: number; sourceField: string } | null {
  // 1) geo.coordinates (GeoJSON)
  const g = p?.geo?.coordinates;
  if (Array.isArray(g) && g.length === 2) {
    const lng = Number(g[0]);
    const lat = Number(g[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && isLikelyNL(lat, lng)) {
      return { lat, lng, sourceField: 'geo.coordinates' };
    }
  }

  // 2) location.coordinates (GeoJSON)
  const lc = p?.location?.coordinates;
  if (Array.isArray(lc) && lc.length === 2) {
    const lng = Number(lc[0]);
    const lat = Number(lc[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && isLikelyNL(lat, lng)) {
      return { lat, lng, sourceField: 'location.coordinates' };
    }
  }

  // 3) location.lat/lng
  const lat = Number(p?.location?.lat);
  const lng = Number(p?.location?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng) && isLikelyNL(lat, lng)) {
    return { lat, lng, sourceField: 'location.latlng' };
  }

  // 4) basicInfo.location.lat/lng (optioneel)
  const lat2 = Number(p?.basicInfo?.location?.lat);
  const lng2 = Number(p?.basicInfo?.location?.lng);
  if (Number.isFinite(lat2) && Number.isFinite(lng2) && isLikelyNL(lat2, lng2)) {
    return { lat: lat2, lng: lng2, sourceField: 'basicInfo.location.latlng' };
  }

  return null;
}

/**
 * Optioneel: maskeer huisnummer (veilig).
 * Voorbeeld: "Dorpsstraat 12" -> "Dorpsstraat"
 * Als je dit NIET wil, zet USE_MASKING op false.
 */
const USE_MASKING = false;

function maskHouseNumber(streetOrLine: string): string {
  // verwijdert " 12", " 12A", " 12-14", etc. aan het einde
  return streetOrLine.replace(/\s+\d+([a-zA-Z]{0,2})?([-/]\d+([a-zA-Z]{0,2})?)?\s*$/, '').trim();
}

function buildAddressLine(p: any): { street: string | null; addressLine: string | null } {
  const rawLine = getAddressLineRaw(p);
  const streetOnly = getStreet(p);
  const postalCode = getPostalCode(p);

  // 1) beste bron: rawLine (vaak straat + huisnr)
  let line = rawLine || streetOnly || null;

  if (line && USE_MASKING) {
    line = maskHouseNumber(line);
  }

  // 2) als line niet bestaat, maar wel postcode: toon "Adres onbekend, 1234AB"
  if (!line) {
    if (postalCode) {
      return { street: null, addressLine: `Adres onbekend, ${String(postalCode)}` };
    }
    return { street: null, addressLine: null };
  }

  // 3) voeg postcode toe als die nog niet in line zit
  if (postalCode) {
    const pc = String(postalCode).trim();
    const hasPc = line.toUpperCase().includes(pc.toUpperCase());
    const addressLine = hasPc ? line : `${line}, ${pc}`;
    return { street: line, addressLine };
  }

  return { street: line, addressLine: line };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const debug = searchParams.get('debug') === '1';

    const place = normalize(searchParams.get('place') || '');
    const tagsParam = normalize(searchParams.get('tags') || '');
    const tags = parseTags(tagsParam);

    const minPrice = Number(searchParams.get('minPrice') || 0) || 0;
    const maxPrice = Number(searchParams.get('maxPrice') || 0) || 0;

    const minLiving = Number(searchParams.get('minLiving') || 0) || 0;
    const minPlot = Number(searchParams.get('minPlot') || 0) || 0;

    const limitRaw = Number(searchParams.get('limit') || 20);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 20;

    const client = await clientPromise;
    const db = client.db('VastgoedExclusief_DB');
    const collection = db.collection('properties');

    if (debug) {
      const total = await collection.countDocuments({});
      const notDeleted = await collection.countDocuments({ isDeleted: false });

      const sample = await collection
        .find(
          {},
          {
            projection: {
              isDeleted: 1,
              geo: 1,
              location: 1,
              basicInfo: 1,
              dimensions: 1,
              valuation: 1,
              luxuryFeatures: 1,
              place: 1,
              city: 1,
              postalCode: 1,
              price: 1,
              // ✅ extra: zodat je ziet waar straat/adres zit
              address: 1,
              street: 1,
            },
          }
        )
        .limit(5)
        .toArray();

      return NextResponse.json({
        ok: true,
        db: 'VastgoedExclusief_DB',
        collection: 'properties',
        total,
        notDeleted,
        sample,
      });
    }

    if (!place) {
      return NextResponse.json({ items: [], recognizedTags: [] });
    }

    // Exacte city-match: geen bijvangst zoals "Rotterdamseweg"
    const cityRegex = new RegExp(`^${escapeRegex(place)}$`, 'i');

    const query: any = {
      isDeleted: false,
      $or: [
        { 'basicInfo.address.city': cityRegex },
        { 'basicInfo.city': cityRegex },
        { 'basicInfo.location.city': cityRegex },
        { 'basicInfo.place': cityRegex },
        { place: cityRegex },
        { 'location.city': cityRegex }, // mag mee, maar niet leidend
      ],
    };

    const and: any[] = [];

    if (minPrice || maxPrice) {
      const pf: any = {};
      if (minPrice) pf.$gte = minPrice;
      if (maxPrice) pf.$lte = maxPrice;

      and.push({
        $or: [
          { 'basicInfo.basePrice': pf },
          { 'valuation.basePrice': pf },
          { 'valuation.askingPrice': pf },
          { price: pf },
        ],
      });
    }

    if (minLiving) and.push({ 'dimensions.livingArea': { $gte: minLiving } });
    if (minPlot) and.push({ 'dimensions.plotArea': { $gte: minPlot } });

    if (tags.length) {
      and.push({
        $or: tags.map((t: string) => ({
          [`luxuryFeatures.${t}`]: true,
        })),
      });
    }

    if (and.length) query.$and = and;

    const docs = await collection
      .find(query, {
        projection: {
          propertyCode: 1,
          geo: 1,
          location: 1,
          basicInfo: 1,
          dimensions: 1,
          valuation: 1,
          luxuryFeatures: 1,
          place: 1,
          city: 1,
          price: 1,
          postalCode: 1,

          // ✅ extra velden zodat straat/adres zeker beschikbaar zijn in docs
          address: 1,
          street: 1,
        },
      })
      .limit(limit)
      .toArray();

    // Cache geocode per request
    const geoCache = new Map<string, any>();

    // Requested city centroid (alleen fallback)
    const requestedGeo = await geocodeViaPdok(place);

    async function ensureLocation(p: any) {
      const requestedCity = place;
      const docCity = getCity(p);
      const locCity = p?.location?.city;

      // 1) DB coords zijn LEIDEND
      const dbCoords = getDbCoords(p);
      if (dbCoords) {
        const ok =
          sameCity(docCity, requestedCity) ||
          sameCity(locCity, requestedCity) ||
          sameCity(docCity, locCity) ||
          !docCity;

        if (ok) {
          return {
            lat: dbCoords.lat,
            lng: dbCoords.lng,
            city: (docCity ?? locCity ?? requestedCity ?? null),
            label: p?.location?.label ?? null,
            source: (p?.location?.source || 'db') as string,
            level: 'db',
            _sourceField: dbCoords.sourceField,
          };
        }
      }

      // 2) Postcode4
      const pc4 = toPostcode4(getPostalCode(p));
      if (pc4) {
        const key = `pc4:${pc4}`;
        if (geoCache.has(key)) return geoCache.get(key);

        const geo = await geocodeViaPdok(pc4);
        const loc = geo
          ? { ...geo, city: (docCity || requestedCity || geo.label), level: 'pc4' }
          : null;

        geoCache.set(key, loc);
        if (loc) return loc;
      }

      // 3) Doc city
      if (docCity) {
        const key = `city:${String(docCity).toLowerCase()}`;
        if (geoCache.has(key)) return geoCache.get(key);

        const geo = await geocodeViaPdok(String(docCity));
        const loc = geo ? { ...geo, city: String(docCity), level: 'city' } : null;

        geoCache.set(key, loc);
        if (loc) return loc;
      }

      // 4) Requested city centroid fallback
      if (requestedGeo) {
        return { ...requestedGeo, city: requestedCity, level: 'city' };
      }

      return null;
    }

    const items = await Promise.all(
      docs.map(async (p: any) => {
        const luxuryTags = getLuxuryTags(p);

        const matchedTags = tags.length
          ? luxuryTags.filter((t: string) => tags.includes(String(t).toLowerCase()))
          : [];

        const matchScore = tags.length ? matchedTags.length : 0;

        const loc = await ensureLocation(p);

        const map = loc
          ? {
              lat: loc.lat,
              lng: loc.lng,
              city: loc.city ?? null,
              label: loc.label ?? null,
              level: loc.level ?? 'city',
              source: loc.source ?? 'pdok',
            }
          : null;

        const postalCode = getPostalCode(p);
        const { street, addressLine } = buildAddressLine(p);

        return {
          _id: p._id.toString(),
          propertyCode: p?.propertyCode ?? null,
          title: p?.basicInfo?.title || p?.basicInfo?.propertyType || 'Woning',
          place: getCity(p),
          city: getCity(p),

          // ✅ nieuw/verbeterd
          street: street ? String(street) : null,
          postalCode: postalCode ? String(postalCode) : null,
          addressLine: addressLine ? String(addressLine) : null,

          // (oude veld laat ik staan voor backward compatibility)
          address: addressLine ? String(addressLine) : null,

          price: getPrice(p),
          livingArea: p?.dimensions?.livingArea ?? null,
          plotArea: p?.dimensions?.plotArea ?? null,
          lotArea: p?.dimensions?.plotArea ?? null,
          luxuryTags,
          matchedTags,
          matchScore,
          map,
          location: loc
            ? {
                lat: loc.lat,
                lng: loc.lng,
                city: loc.city ?? null,
                label: loc.label ?? null,
                source: loc.source,
                level: loc.level,
                sourceField: (loc as any)._sourceField ?? null,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      items,
      recognizedTags: tags,
    });
  } catch (error) {
    console.error('AI references error:', error);
    return NextResponse.json({ items: [], recognizedTags: [] }, { status: 500 });
  }
}

