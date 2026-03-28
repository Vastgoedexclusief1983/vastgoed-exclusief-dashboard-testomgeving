'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Slider } from '@/components/ui/slider';

/* =======================
   Types
======================= */

export type RefItem = {
  _id?: string;
  id?: string;
  title?: string;

  // ✅ NULL-SAFE: caller mag null doorgeven
  city?: string | null;
  place?: string | null;

  price?: number;
  basicInfo?: {
    title?: string;
    city?: string | null;
    basePrice?: number;
    price?: number;
  };
  map?: {
    lat: number | string | null;
    lng: number | string | null;
    label?: string | null;
    city?: string | null;
  };
};

export type MapCenter =
  | {
      lat: number;
      lng: number;
      label?: string | null;
    }
  | null;

/* =======================
   Helpers
======================= */

function formatPriceNL(v: number) {
  return `€ ${v.toLocaleString('nl-NL')}`;
}

function escapeHtml(s: string) {
  return (s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function toNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.trim().replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * NL bbox (rough): lat 50..54.5, lng 3..8.5
 */
function isLikelyNL(lat: number, lng: number) {
  return lat >= 50 && lat <= 54.5 && lng >= 3 && lng <= 8.5;
}

/**
 * Normalize coords:
 * - parse
 * - if swapped, swap
 */
function normalizeLatLng(latRaw: unknown, lngRaw: unknown): { lat: number; lng: number } | null {
  const lat = toNumber(latRaw);
  const lng = toNumber(lngRaw);
  if (lat === null || lng === null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;

  if (isLikelyNL(lat, lng)) return { lat, lng };
  if (isLikelyNL(lng, lat)) return { lat: lng, lng: lat };

  // accepteer ook "wereld" coords zolang valide
  if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };

  return null;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/* =======================
   Radius helpers
======================= */

function makeCirclePath(center: google.maps.LatLngLiteral, radiusMeters: number, points = 180) {
  const path: google.maps.LatLngLiteral[] = [];
  for (let i = 0; i <= points; i++) {
    const heading = (i * 360) / points;
    const p = google.maps.geometry.spherical.computeOffset(
      new google.maps.LatLng(center.lat, center.lng),
      radiusMeters,
      heading
    );
    path.push({ lat: p.lat(), lng: p.lng() });
  }
  return path;
}

function drawDashedRadius(map: google.maps.Map, center: google.maps.LatLngLiteral, radiusKm: number) {
  const radiusMeters = Math.max(1, radiusKm) * 1000;
  const path = makeCirclePath(center, radiusMeters);

  return new google.maps.Polyline({
    map,
    path,
    strokeOpacity: 0,
    strokeWeight: 2,
    icons: [
      {
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          strokeColor: '#d00000',
          scale: 3,
        },
        offset: '0',
        repeat: '12px',
      },
    ],
  });
}

/* =======================
   Component
======================= */

export default function ReferenceMapGoogle({
  items,
  height = 520,
  debug = false,
  maxZoomOnFit = 13,
  center = null,
  radiusKm: radiusKmProp,
  defaultRadiusKm = 25,
  showRadiusSlider = true,
  minRadiusKm = 5,
  maxRadiusKm = 100,
  stepRadiusKm = 5,
  onRadiusKmChange,
}: {
  items: RefItem[];
  height?: number;
  debug?: boolean;
  maxZoomOnFit?: number;
  center?: MapCenter;
  radiusKm?: number;
  defaultRadiusKm?: number;
  showRadiusSlider?: boolean;
  minRadiusKm?: number;
  maxRadiusKm?: number;
  stepRadiusKm?: number;
  onRadiusKmChange?: (km: number) => void;
}) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const dashedRef = useRef<google.maps.Polyline | null>(null);
  const targetMarkerRef = useRef<google.maps.Marker | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  // internal slider state (alleen als radiusKmProp niet gezet is)
  const initial = clamp(defaultRadiusKm, minRadiusKm, maxRadiusKm);
  const [radiusDraft, setRadiusDraft] = useState<number>(initial);
  const [radiusInternal, setRadiusInternal] = useState<number>(initial);

  const radiusEffective =
    typeof radiusKmProp === 'number' ? clamp(radiusKmProp, minRadiusKm, maxRadiusKm) : radiusInternal;

  // sync defaultRadiusKm → internal (alleen als prop niet actief is)
  useEffect(() => {
    if (typeof radiusKmProp === 'number') return;
    const next = clamp(defaultRadiusKm, minRadiusKm, maxRadiusKm);
    setRadiusDraft(next);
    setRadiusInternal(next);
  }, [defaultRadiusKm, minRadiusKm, maxRadiusKm, radiusKmProp]);

  // debounce draft → applied
  useEffect(() => {
    if (typeof radiusKmProp === 'number') return;
    const t = setTimeout(() => {
      const v = clamp(radiusDraft, minRadiusKm, maxRadiusKm);
      setRadiusInternal(v);
      onRadiusKmChange?.(v);
    }, 120);
    return () => clearTimeout(t);
  }, [radiusDraft, radiusKmProp, minRadiusKm, maxRadiusKm, onRadiusKmChange]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const markersData = useMemo(() => {
    return (items || [])
      .map((p) => {
        const n = normalizeLatLng(p?.map?.lat, p?.map?.lng);
        if (!n) return null;

        const id = p._id ?? p.id ?? `${n.lat}:${n.lng}`;
        const title = p?.title ?? p?.basicInfo?.title ?? 'Referentiewoning';
        const city =
          p?.city ?? p?.place ?? p?.map?.city ?? p?.basicInfo?.city ?? '';

        const price = p?.price ?? p?.basicInfo?.basePrice ?? p?.basicInfo?.price ?? null;

        return { id, lat: n.lat, lng: n.lng, title, city, price };
      })
      .filter(Boolean) as Array<{
      id: string;
      lat: number;
      lng: number;
      title: string;
      city: string;
      price: number | null;
    }>;
  }, [items]);

  const debugCounts = useMemo(() => {
    const total = items?.length ?? 0;
    const plotted = markersData.length;
    return { total, plotted, missing: total - plotted };
  }, [items, markersData]);

  useEffect(() => {
    if (!apiKey) {
      setLoadError('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ontbreekt');
      return;
    }
    if (!mapDivRef.current) return;

    let cancelled = false;

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['geometry'],
    });

    (async () => {
      try {
        await loader.load();
        if (cancelled) return;

        const el = mapDivRef.current;
        if (!el) return;

        // init map once
        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(el, {
            center: { lat: 52.1326, lng: 5.2913 },
            zoom: 7,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });
          infoWindowRef.current = new google.maps.InfoWindow();
        }

        const map = mapRef.current!;
        const infoWindow = infoWindowRef.current!;

        // cleanup old markers/cluster
        if (clustererRef.current) {
          clustererRef.current.clearMarkers();
          clustererRef.current = null;
        }
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        // cleanup overlays
        if (dashedRef.current) {
          dashedRef.current.setMap(null);
          dashedRef.current = null;
        }
        if (targetMarkerRef.current) {
          targetMarkerRef.current.setMap(null);
          targetMarkerRef.current = null;
        }

        // focus priority: center > first ref > NL
        const nlCenter = { lat: 52.1326, lng: 5.2913 };
        const focusCenter: google.maps.LatLngLiteral =
          center && Number.isFinite(center.lat) && Number.isFinite(center.lng)
            ? { lat: center.lat, lng: center.lng }
            : markersData[0]
              ? { lat: markersData[0].lat, lng: markersData[0].lng }
              : nlCenter;

        // target marker if center exists
        if (center && Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
          targetMarkerRef.current = new google.maps.Marker({
            position: { lat: center.lat, lng: center.lng },
            map,
            zIndex: 9999,
            title: center.label ?? 'Doelwoning',
            icon: {
              url: '/icons/target-home.png',
              scaledSize: new google.maps.Size(80, 80),
              anchor: new google.maps.Point(36, 64),
            },
          });
        }

        // reference markers
        const newMarkers = markersData.map((m) => {
          const marker = new google.maps.Marker({
            position: { lat: m.lat, lng: m.lng },
            title: m.title,
          });

          marker.addListener('click', () => {
            const parts: string[] = [];
            parts.push(`<div style="font-weight:600;">${escapeHtml(m.title)}</div>`);
            if (m.city) parts.push(`<div style="color:#666;margin-top:2px;">${escapeHtml(m.city)}</div>`);
            if (typeof m.price === 'number')
              parts.push(`<div style="margin-top:6px;">Prijs: ${escapeHtml(formatPriceNL(m.price))}</div>`);
            if (debug)
              parts.push(`<div style="margin-top:6px;color:#888;">coords: ${m.lat.toFixed(5)}, ${m.lng.toFixed(5)}</div>`);

            infoWindow.setContent(`<div style="font-size:13px;line-height:1.35;">${parts.join('')}</div>`);
            infoWindow.open({ map, anchor: marker });
          });

          return marker;
        });

        markersRef.current = newMarkers;
        clustererRef.current = new MarkerClusterer({ map, markers: newMarkers });

        // dashed radius around focus
        dashedRef.current = drawDashedRadius(map, focusCenter, radiusEffective);

        // fit bounds: focus + refs + radius extremes
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(focusCenter);
        markersData.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));

        const rM = Math.max(1, radiusEffective) * 1000;
        const north = google.maps.geometry.spherical.computeOffset(
          new google.maps.LatLng(focusCenter.lat, focusCenter.lng),
          rM,
          0
        );
        const east = google.maps.geometry.spherical.computeOffset(
          new google.maps.LatLng(focusCenter.lat, focusCenter.lng),
          rM,
          90
        );
        const south = google.maps.geometry.spherical.computeOffset(
          new google.maps.LatLng(focusCenter.lat, focusCenter.lng),
          rM,
          180
        );
        const west = google.maps.geometry.spherical.computeOffset(
          new google.maps.LatLng(focusCenter.lat, focusCenter.lng),
          rM,
          270
        );

        bounds.extend({ lat: north.lat(), lng: north.lng() });
        bounds.extend({ lat: east.lat(), lng: east.lng() });
        bounds.extend({ lat: south.lat(), lng: south.lng() });
        bounds.extend({ lat: west.lat(), lng: west.lng() });

        map.fitBounds(bounds, 40);

        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const z = map.getZoom();
          if (typeof z === 'number' && z > maxZoomOnFit) map.setZoom(maxZoomOnFit);
        });
      } catch (e: any) {
        setLoadError(e?.message ?? 'Google Maps kon niet laden');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiKey, markersData, center, radiusEffective, maxZoomOnFit, debug]);

  return (
    <div className="w-full">
      {debug && (
        <div className="mb-2 text-sm text-muted-foreground">
          Resultaten: <b>{debugCounts.total}</b> — Geplot: <b>{debugCounts.plotted}</b> — Zonder/ongeldige coords:{' '}
          <b>{debugCounts.missing}</b>
        </div>
      )}

      {showRadiusSlider && !loadError && typeof radiusKmProp !== 'number' && (
        <div className="mb-3 rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Zoekradius</div>
              <div className="text-xs text-muted-foreground">
                Stel in hoe ver rondom de woning referenties getoond worden.
              </div>
            </div>
            <div className="text-sm font-semibold tabular-nums">{radiusDraft} km</div>
          </div>

          <div className="mt-3">
            <Slider
              value={[radiusDraft]}
              min={minRadiusKm}
              max={maxRadiusKm}
              step={stepRadiusKm}
              onValueChange={(v) => setRadiusDraft(v[0] ?? defaultRadiusKm)}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{minRadiusKm} km</span>
              <span>{maxRadiusKm} km</span>
            </div>
          </div>
        </div>
      )}

      {loadError ? (
        <div className="rounded-2xl border p-4 text-sm">
          <div className="font-semibold">Kaartfout</div>
          <div className="mt-1 text-muted-foreground">{loadError}</div>
        </div>
      ) : (
        <div style={{ height }} className="w-full overflow-hidden rounded-2xl border">
          <div ref={mapDivRef} className="h-full w-full" />
        </div>
      )}
    </div>
  );
}

