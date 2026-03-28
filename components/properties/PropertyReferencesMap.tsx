'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type PropertyLocation = {
  lat: number;
  lng: number;
  city?: string;
  label?: string;
};

type Property = {
  _id: string;
  propertyCode?: string | null;
  title?: string | null;
  location?: PropertyLocation | null;
};

type Props = {
  properties: Property[];
};

function FitToMarkers({ properties }: { properties: Property[] }) {
  const map = useMap();

  const bounds = useMemo(() => {
    const pts = properties
      .filter((p) => p.location && Number.isFinite(p.location.lat) && Number.isFinite(p.location.lng))
      .map((p) => [p.location!.lat, p.location!.lng] as [number, number]);

    if (pts.length === 0) return null;
    return L.latLngBounds(pts);
  }, [properties]);

  useEffect(() => {
    if (!bounds) return;

    map.fitBounds(bounds, { padding: [30, 30] });

    // Soms nodig in dashboards: kaart wordt in container gerenderd
    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [30, 30] });
    }, 150);
  }, [bounds, map]);

  return null;
}

export default function PropertyReferencesMap({ properties }: Props) {
  const validProperties = properties.filter(
    (p) => p.location && Number.isFinite(p.location.lat) && Number.isFinite(p.location.lng)
  );

  if (validProperties.length === 0) {
    return <div className="text-sm text-muted-foreground">Geen locaties beschikbaar voor kaartweergave.</div>;
  }

  // startcenter (wordt direct overschreven door fitBounds)
  const center: [number, number] = [validProperties[0].location!.lat, validProperties[0].location!.lng];

  return (
    <div className="h-[420px] w-full rounded-lg overflow-hidden border">
      <MapContainer center={center} zoom={10} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* ✅ alle markers in beeld */}
        <FitToMarkers properties={validProperties} />

        {validProperties.map((p) => (
          <Marker key={p._id} position={[p.location!.lat, p.location!.lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{p.propertyCode || p.title || 'Referentie'}</div>
                {p.location?.city && <div>{p.location.city}</div>}
                {p.location?.label && <div className="text-muted-foreground">{p.location.label}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
