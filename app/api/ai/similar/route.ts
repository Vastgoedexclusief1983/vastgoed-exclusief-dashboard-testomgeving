// vastgoed-exclusief-dashboard-main/app/api/ai/similar/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

type LatLng = { lat: number; lng: number };
type MatchBand = 'low' | 'mid' | 'high' | 'top';

type RefItem = {
  _id: string;
  propertyCode: string | null;
  title: string;
  city: string | null;
  street: string | null;
  postalCode: string | null;
  addressLine: string | null;
  address: string | null;
  type: string | null;
  price: number | null;
  livingArea: number | null;
  plotArea: number | null;
  lotArea: number | null;
  luxuryTags: string[];
  location: LatLng;
  distanceKm: number;
  map: {
    lat: number;
    lng: number;
    label?: string;
    city?: string | null;
  };
};

function normalize(input: unknown): string {
  return (input ?? '').toString().trim();
}

function normalizeSpaces(input: unknown): string {
  return normalize(input).replace(/\s+/g, ' ');
}

function normLower(input: unknown): string {
  return normalizeSpaces(input).toLowerCase();
}

function parseTags(input: string): string[] {
  return normalize(input)
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const a = [...values].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function normalizeRange(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return 0;
  if (max <= min) return 0;
  return clamp((v - min) / (max - min), 0, 1);
}

/**
 * Robuuste number parser voor NL/EN notatie.
 * Voorbeelden:
 * - "1.250"     => 1250
 * - "1 250"     => 1250
 * - "1250 m²"   => 1250
 * - "1,250"     => 1250
 * - "1250,50"   => 1250.5
 * - "1.250,50"  => 1250.5
 * - "1,250.50"  => 1250.5
 */
function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;

  if (typeof v === 'number') {
    return Number.isFinite(v) ? v : null;
  }

  if (typeof v !== 'string') return null;

  let s = v
    .toLowerCase()
    .replace(/m2|m²/g, '')
    .replace(/€/g, '')
    .replace(/\s/g, '')
    .trim();

  if (!s || s === '-' || s === '—' || s === 'nvt' || s === 'n.v.t.') {
    return null;
  }

  s = s.replace(/[^\d.,-]/g, '');

  const hasDot = s.includes('.');
  const hasComma = s.includes(',');

  if (hasDot && hasComma) {
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');

    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    const parts = s.split(',');

    if (parts.length === 2 && parts[1].length <= 2) {
      s = s.replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasDot) {
    const parts = s.split('.');

    if (!(parts.length === 2 && parts[1].length <= 2)) {
      s = s.replace(/\./g, '');
    }
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toAreaOrNull(v: unknown): number | null {
  const n = toNumberOrNull(v);
  if (n === null) return null;
  return n > 0 ? n : null;
}

// ---------- Distance ----------
function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

function distanceScore(km: number, radiusKm: number): number {
  const r = Math.max(1, radiusKm);
  return clamp(1 - km / r, 0, 1);
}

// ---------- Similarity Scores ----------
function relativeScore(
  target: number | null,
  value: number | null,
  tolerance = 0.35
): number {
  if (target === null || value === null || target <= 0 || value <= 0) return 0.5;
  const diff = Math.abs(value - target) / target;
  return clamp(1 - diff / tolerance, 0, 1);
}

function tagsScore(targetTags: string[], refTags: string[]): number {
  if (!targetTags.length) return 0.5;

  const A = new Set(targetTags.map((t) => t.toLowerCase()));
  const B = new Set(refTags.map((t) => t.toLowerCase()));

  let inter = 0;
  for (const t of A) {
    if (B.has(t)) inter++;
  }

  const union = new Set([...A, ...B]).size || 1;
  return inter / union;
}

function typeScore(targetType?: string | null, refType?: string | null): number {
  if (!targetType || !refType) return 0.5;

  const target = normalizeTypeLabel(targetType);
  const ref = normalizeTypeLabel(refType);

  if (!target || !ref) return 0.5;
  return target === ref ? 1 : 0.2;
}

function toMatch10(score01: number): number {
  return clamp(Math.round(clamp(score01, 0, 1) * 9) + 1, 1, 10);
}

function matchBand(match10: number): MatchBand {
  if (match10 >= 9) return 'top';
  if (match10 >= 7) return 'high';
  if (match10 >= 4) return 'mid';
  return 'low';
}

// ---------- Coord sanity (NL + swapped fix) ----------
function isLikelyNL(lat: number, lng: number) {
  return lat >= 50 && lat <= 54.5 && lng >= 3 && lng <= 8.5;
}

function normalizeLatLng(latRaw: unknown, lngRaw: unknown): LatLng | null {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;

  if (isLikelyNL(lat, lng)) return { lat, lng };
  if (isLikelyNL(lng, lat)) return { lat: lng, lng: lat };

  return null;
}

// ---------- PDOK geocode ----------
function parsePdokPoint(point?: string | null): LatLng | null {
  if (!point) return null;

  const m = point.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!m) return null;

  const lng = Number(m[1]);
  const lat = Number(m[2]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

async function geocodeViaPdok(
  q: string
): Promise<{ lat: number; lng: number; label: string } | null> {
  const query = normalizeSpaces(q);
  if (!query) return null;

  const url = new URL('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free');
  url.searchParams.set('q', query);
  url.searchParams.set('rows', '1');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const res = await fetch(url.toString(), {
      cache: 'no-store',
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });

    if (!res.ok) return null;

    const data: any = await res.json();
    const doc = data?.response?.docs?.[0];
    const point = parsePdokPoint(doc?.centroide_ll);
    if (!point) return null;

    return {
      lat: point.lat,
      lng: point.lng,
      label: doc?.weergavenaam || query,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------- Type normalisatie ----------
function normalizeTypeLabel(input: string | null | undefined): string {
  const v = normalizeSpaces(input).toLowerCase();

  if (!v) return '';

  if (
    v.includes('villa') ||
    v.includes('vrijstaand') ||
    v.includes('vrijstaande woning')
  ) {
    return 'villa';
  }

  if (
    v.includes('appartement') ||
    v.includes('apartment') ||
    v.includes('penthouse')
  ) {
    return 'appartement';
  }

  if (
    v.includes('land') ||
    v.includes('bouwgrond') ||
    v.includes('grond')
  ) {
    return 'land';
  }

  if (
    v.includes('hoekwoning') ||
    v.includes('tussenwoning') ||
    v.includes('rijwoning') ||
    v.includes('eengezinswoning') ||
    v.includes('woonhuis')
  ) {
    return 'woonhuis';
  }

  return v;
}

// ---------- Extract fields from DB docs ----------
function getCity(p: any): string | null {
  const v =
    p?.basicInfo?.address?.city ||
    p?.basicInfo?.city ||
    p?.basicInfo?.location?.city ||
    p?.basicInfo?.place ||
    p?.place ||
    p?.city ||
    p?.location?.city ||
    null;

  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function getStreet(p: any): string | null {
  const v =
    p?.basicInfo?.address?.street ??
    p?.basicInfo?.address?.streetName ??
    p?.basicInfo?.street ??
    p?.street ??
    p?.address?.street ??
    p?.location?.street ??
    p?.location?.streetName ??
    null;

  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length ? s : null;
}

function getHouseNumber(p: any): string | null {
  const v =
    p?.basicInfo?.address?.houseNumber ??
    p?.basicInfo?.houseNumber ??
    p?.address?.houseNumber ??
    p?.houseNumber ??
    null;

  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s || null;
}

function getHouseNumberSuffix(p: any): string | null {
  const v =
    p?.basicInfo?.address?.houseNumberSuffix ??
    p?.basicInfo?.address?.suffix ??
    p?.address?.houseNumberSuffix ??
    p?.houseNumberSuffix ??
    p?.suffix ??
    null;

  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s || null;
}

function getAddressLine(p: any): string | null {
  const raw =
    p?.basicInfo?.address?.address ??
    p?.basicInfo?.address?.line1 ??
    p?.basicInfo?.address ??
    p?.address?.address ??
    p?.address?.line1 ??
    p?.address ??
    null;

  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }

  const street = getStreet(p);
  const houseNumber = getHouseNumber(p);
  const suffix = getHouseNumberSuffix(p);

  if (!street) return null;

  const nr = [houseNumber, suffix].filter(Boolean).join('');
  return nr ? `${street} ${nr}` : street;
}

function getPostalCode(p: any): string | null {
  const v =
    p?.basicInfo?.postalcode ??
    p?.basicInfo?.address?.postalCode ??
    p?.basicInfo?.address?.postalcode ??
    p?.basicInfo?.postalCode ??
    p?.postalCode ??
    p?.postalcode ??
    null;

  if (typeof v !== 'string') return null;

  const pc = v.trim().toUpperCase().replace(/\s+/g, '');
  return pc || null;
}

function buildAddressLine(p: any): { street: string | null; addressLine: string | null } {
  const street = getStreet(p);
  const line = getAddressLine(p);
  const pc = getPostalCode(p);

  const base = line || street || null;

  if (!base) {
    return {
      street: null,
      addressLine: pc ? `Adres onbekend, ${pc}` : null,
    };
  }

  if (pc) {
    const hasPc = base.toUpperCase().includes(pc.toUpperCase());
    return {
      street: street || base,
      addressLine: hasPc ? base : `${base}, ${pc}`,
    };
  }

  return {
    street: street || base,
    addressLine: base,
  };
}

function getPrice(p: any): number | null {
  const v =
    p?.basicInfo?.basePrice ??
    p?.valuation?.basePrice ??
    p?.valuation?.askingPrice ??
    p?.price ??
    null;

  const n = toNumberOrNull(v);
  return n !== null && n > 0 ? n : null;
}

function getLivingArea(p: any): number | null {
  const v = p?.dimensions?.livingArea ?? p?.livingArea ?? null;
  return toAreaOrNull(v);
}

function getPlotArea(p: any): number | null {
  const v =
    p?.dimensions?.plotArea ??
    p?.dimensions?.lotArea ??
    p?.dimensions?.lotSize ??
    p?.plotArea ??
    p?.lotArea ??
    p?.lotSize ??
    p?.basicInfo?.plotArea ??
    p?.basicInfo?.lotArea ??
    p?.basicInfo?.lotSize ??
    null;

  return toAreaOrNull(v);
}

function getLotArea(p: any): number | null {
  const v =
    p?.lotArea ??
    p?.lotSize ??
    p?.plotArea ??
    p?.dimensions?.lotArea ??
    p?.dimensions?.lotSize ??
    p?.dimensions?.plotArea ??
    p?.basicInfo?.lotArea ??
    p?.basicInfo?.lotSize ??
    p?.basicInfo?.plotArea ??
    null;

  return toAreaOrNull(v);
}

function getType(p: any): string | null {
  const v = p?.basicInfo?.propertyType ?? p?.propertyType ?? p?.type ?? null;
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function getLuxuryTags(p: any): string[] {
  const lf = p?.luxuryFeatures;
  if (!lf || typeof lf !== 'object') return [];

  const values: string[] = [];

  for (const [key, value] of Object.entries(lf)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const tag = normalizeSpaces(item);
        if (tag) values.push(tag);
      }
    } else if (value === true) {
      const tag = normalizeSpaces(key);
      if (tag) values.push(tag);
    } else if (typeof value === 'string') {
      const tag = normalizeSpaces(value);
      if (tag) values.push(tag);
    }
  }

  return Array.from(new Set(values));
}

function getDbCoords(p: any): LatLng | null {
  const g = p?.geo?.coordinates;
  if (Array.isArray(g) && g.length === 2) {
    const norm = normalizeLatLng(g[1], g[0]);
    if (norm) return norm;
  }

  const lc = p?.location?.coordinates;
  if (Array.isArray(lc) && lc.length === 2) {
    const norm = normalizeLatLng(lc[1], lc[0]);
    if (norm) return norm;
  }

  const norm1 = normalizeLatLng(p?.location?.lat, p?.location?.lng);
  if (norm1) return norm1;

  const norm2 = normalizeLatLng(
    p?.basicInfo?.location?.lat,
    p?.basicInfo?.location?.lng
  );
  if (norm2) return norm2;

  const norm3 = normalizeLatLng(p?.map?.lat, p?.map?.lng);
  if (norm3) return norm3;

  return null;
}

function buildTargetGeocodeQuery(address?: string, postalCode?: string, city?: string): string {
  return [address, postalCode, city]
    .map((x) => normalizeSpaces(x))
    .filter(Boolean)
    .join(' ');
}

function isSameTargetRef(args: {
  targetLoc: LatLng;
  targetAddress: string;
  targetPostalCode: string;
  refAddressLine: string | null;
  refPostalCode: string | null;
  refLoc: LatLng;
}): boolean {
  const addrIn = normLower(args.targetAddress);
  const pcIn = normLower(args.targetPostalCode);
  const addrRef = normLower(args.refAddressLine ?? '');
  const pcRef = normLower(args.refPostalCode ?? '');

  if (pcIn && pcRef && pcIn === pcRef && addrIn && addrRef.includes(addrIn)) {
    return true;
  }

  const dLat = Math.abs(args.refLoc.lat - args.targetLoc.lat);
  const dLng = Math.abs(args.refLoc.lng - args.targetLoc.lng);

  return dLat < 0.00015 && dLng < 0.00015;
}

// ---------- Route ----------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const debug = searchParams.get('debug') === '1';

    const latParam = normalize(searchParams.get('lat'));
    const lngParam = normalize(searchParams.get('lng'));

    const targetAddress = normalizeSpaces(searchParams.get('address'));
    const targetPostalCode = normalizeSpaces(searchParams.get('postalCode'));
    const targetCity = normalizeSpaces(searchParams.get('city'));

    const targetType = normalize(searchParams.get('type')) || null;

    const targetLiving = toAreaOrNull(searchParams.get('living'));
    const targetPlot = toAreaOrNull(searchParams.get('plot'));

    const tags = parseTags(normalize(searchParams.get('tags') || ''));

    const minListingPriceRaw = Number(searchParams.get('minListingPrice') || 1000000);
    const minListingPrice = Number.isFinite(minListingPriceRaw)
      ? Math.max(minListingPriceRaw, 0)
      : 1000000;

    const radiusRaw = Number(searchParams.get('radiusKm') || 30);
    const radiusKm = Number.isFinite(radiusRaw) ? clamp(radiusRaw, 1, 200) : 30;

    const limitRaw = Number(searchParams.get('limit') || 80);
    const limit = Number.isFinite(limitRaw) ? clamp(limitRaw, 1, 200) : 80;

    let targetLoc: LatLng | null = null;
    let targetGeoLabel: string | null = null;

    if (latParam && lngParam) {
      const norm = normalizeLatLng(latParam, lngParam);
      if (norm) targetLoc = norm;
    }

    if (!targetLoc) {
      const q =
        buildTargetGeocodeQuery(targetAddress, targetPostalCode, targetCity) ||
        `${targetCity} Nederland`;

      const geo = await geocodeViaPdok(q);
      if (geo) {
        targetLoc = normalizeLatLng(geo.lat, geo.lng);
        targetGeoLabel = geo.label;
      }
    }

    if (!targetLoc) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Geen geldige target locatie. Stuur lat/lng mee, of address/postalCode/city voor PDOK geocode (liefst postcode + huisnummer).',
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('VastgoedExclusief_DB');
    const collection = db.collection('properties');

    const docs = await collection
      .find(
        {
          $and: [
            {
              $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
            },
            {
              $or: [
                { 'basicInfo.basePrice': { $gte: minListingPrice } },
                { 'valuation.basePrice': { $gte: minListingPrice } },
                { 'valuation.askingPrice': { $gte: minListingPrice } },
                { price: { $gte: minListingPrice } },
              ],
            },
          ],
        },
        {
          projection: {
            propertyCode: 1,
            geo: 1,
            location: 1,
            map: 1,
            basicInfo: 1,
            dimensions: 1,
            valuation: 1,
            luxuryFeatures: 1,
            place: 1,
            city: 1,
            postalCode: 1,
            price: 1,
            constructionYear: 1,
            type: 1,
            propertyType: 1,
            livingArea: 1,
            plotArea: 1,
            lotArea: 1,
            lotSize: 1,
            address: 1,
            street: 1,
          },
        }
      )
      .limit(2000)
      .toArray();

    const refs: RefItem[] = docs
      .map((p: any) => {
        const coords = getDbCoords(p);
        if (!coords) return null;

        const km = distanceKm(targetLoc as LatLng, coords);

        const city = getCity(p);
        const type = getType(p);
        const postalCode = getPostalCode(p);
        const { street, addressLine } = buildAddressLine(p);

        const plotAreaRaw = getPlotArea(p);
        const lotAreaRaw = getLotArea(p);

        const plotArea = plotAreaRaw ?? lotAreaRaw ?? null;
        const lotArea = lotAreaRaw ?? plotAreaRaw ?? null;

        return {
          _id: p._id?.toString?.() ?? String(p._id),
          propertyCode: p?.propertyCode ?? null,
          title: p?.basicInfo?.title || p?.title || type || 'Woning',
          city,
          street,
          postalCode,
          addressLine,
          address: addressLine,
          type,
          price: getPrice(p),
          livingArea: getLivingArea(p),
          plotArea,
          lotArea,
          luxuryTags: getLuxuryTags(p),
          location: coords,
          distanceKm: km,
          map: {
            lat: coords.lat,
            lng: coords.lng,
            label: city || type || 'Referentie',
            city: city || null,
          },
        };
      })
      .filter(Boolean) as RefItem[];

    const refsInRadiusAll = refs.filter((r) => r.distanceKm <= radiusKm);

    const refsWithoutTarget = refsInRadiusAll.filter((r) => {
      return !isSameTargetRef({
        targetLoc: targetLoc as LatLng,
        targetAddress,
        targetPostalCode,
        refAddressLine: r.addressLine,
        refPostalCode: r.postalCode,
        refLoc: r.location,
      });
    });

    const normalizedTargetType = normalizeTypeLabel(targetType);

    const sameTypeRefs = normalizedTargetType
      ? refsWithoutTarget.filter(
          (r) => normalizeTypeLabel(r.type) === normalizedTargetType
        )
      : refsWithoutTarget;

    const refsInRadius =
      sameTypeRefs.length >= Math.min(3, limit)
        ? sameTypeRefs
        : refsWithoutTarget;

    if (debug) {
      return NextResponse.json({
        ok: true,
        center: { ...targetLoc, label: targetGeoLabel || targetCity || 'Doelwoning' },
        target: {
          location: targetLoc,
          label: targetGeoLabel,
          radiusKm,
          type: targetType,
          normalizedType: normalizedTargetType,
          living: targetLiving,
          plot: targetPlot,
          tags,
          minListingPrice,
        },
        counts: {
          fetched: docs.length,
          withCoords: refs.length,
          inRadiusBeforeTargetFilter: refsInRadiusAll.length,
          inRadiusAfterTargetFilter: refsWithoutTarget.length,
          sameTypeMatches: sameTypeRefs.length,
          finalUsed: refsInRadius.length,
        },
        sample: refsInRadius.slice(0, 5),
      });
    }

    const ppm2 = refsInRadius
      .filter(
        (r) =>
          typeof r.price === 'number' &&
          typeof r.livingArea === 'number' &&
          r.price > 0 &&
          r.livingArea > 0
      )
      .map((r) => (r.price as number) / (r.livingArea as number));

    const medianPpm2 = median(ppm2);
    const landPressureIndex = normalizeRange(medianPpm2, 4000, 15000);

    const plotWeight = 0.10 + (1 - landPressureIndex) * 0.05;

    const wDistance = 0.30;
    const wLiving = 0.20;
    const wLuxury = 0.25;
    const wType = 0.15;
    const wPlot = plotWeight;

    const weightSum = wDistance + wLiving + wLuxury + wType + wPlot;

    const targetTagsLower = tags.map((t) => t.toLowerCase());

    const scored = refsInRadius
      .map((r) => {
        const sDist = distanceScore(r.distanceKm, radiusKm);
        const sLiving = relativeScore(targetLiving, r.livingArea, 0.30);

        const refPlot = r.plotArea ?? r.lotArea ?? null;
        const sPlot = relativeScore(targetPlot, refPlot, 0.45);

        const sLuxury = tagsScore(targetTagsLower, r.luxuryTags);
        const sType = typeScore(targetType, r.type);

        const score01 =
          (sDist * wDistance +
            sLiving * wLiving +
            sLuxury * wLuxury +
            sType * wType +
            sPlot * wPlot) /
          weightSum;

        const match10 = toMatch10(score01);
        const band = matchBand(match10);

        const refTagsLower = r.luxuryTags.map((t) => t.toLowerCase());
        const overlapCount = targetTagsLower.length
          ? targetTagsLower.filter((t) => refTagsLower.includes(t)).length
          : 0;

        const luxuryOverlap =
          targetTagsLower.length > 0
            ? `${overlapCount}/${targetTagsLower.length} luxe`
            : 'luxe n.v.t.';

        const why = [
          `${r.distanceKm.toFixed(1)} km`,
          r.livingArea && targetLiving
            ? `woonopp ${Math.round((r.livingArea / targetLiving) * 100)}%`
            : 'woonopp n.v.t.',
          refPlot && targetPlot
            ? `perceel ${Math.round((refPlot / targetPlot) * 100)}%`
            : 'perceel n.v.t.',
          luxuryOverlap,
        ].join(' • ');

        return {
          ...r,
          match10,
          matchBand: band,
          why,
        };
      })
      .sort((a, b) => {
        if (b.match10 !== a.match10) return b.match10 - a.match10;

        const aTypeMatch =
          normalizeTypeLabel(a.type) === normalizedTargetType ? 1 : 0;
        const bTypeMatch =
          normalizeTypeLabel(b.type) === normalizedTargetType ? 1 : 0;

        if (bTypeMatch !== aTypeMatch) return bTypeMatch - aTypeMatch;

        return a.distanceKm - b.distanceKm;
      })
      .slice(0, limit);

    return NextResponse.json({
      ok: true,
      center: { ...targetLoc, label: targetGeoLabel || targetCity || 'Doelwoning' },
      target: {
        location: targetLoc,
        label: targetGeoLabel,
        radiusKm,
        minListingPrice,
        type: targetType,
        normalizedType: normalizedTargetType,
        livingArea: targetLiving,
        plotArea: targetPlot,
        tags: targetTagsLower,
      },
      land: {
        landPressureIndex,
        medianPricePerM2Living: medianPpm2 || null,
        plotWeightUsed: Number(wPlot.toFixed(3)),
      },
      selection: {
        usedSameTypeOnly: sameTypeRefs.length >= Math.min(3, limit),
        sameTypeMatchesFound: sameTypeRefs.length,
        fallbackUsed: !(sameTypeRefs.length >= Math.min(3, limit)),
      },
      items: scored,
    });
  } catch (error) {
    console.error('AI similar error:', error);
    return NextResponse.json(
      {
        ok: false,
        items: [],
        error: 'Server error in similar references API',
      },
      { status: 500 }
    );
  }
}
