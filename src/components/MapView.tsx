import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Restaurant {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
  image: string;
  rating?: number;
  food_name?: string;
  food_image?: string;
  distance?: number;
}

export default function MapView({
  restaurants,
  center = [12.9716, 77.5946],
  zoom = 12,
  userLocation = null,
  radius = 1000,
  showTrail = false,
  heatmapData = [],
}: {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  userLocation?: [number, number] | null;
  radius?: number;
  showTrail?: boolean;
  heatmapData?: { lat: number; lng: number; intensity: number }[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const effectiveCenter: [number, number] =
    userLocation ||
    (restaurants.length > 0 && restaurants[0].lat && restaurants[0].lng
      ? [restaurants[0].lat, restaurants[0].lng]
      : center);

  const effectiveZoom =
    userLocation || (restaurants.length > 0 && restaurants[0].lat) ? 14 : zoom;

  const getHeatmapColor = (intensity: number) => {
    if (intensity > 15) return '#ef4444';
    if (intensity > 8) return '#f59e0b';
    return '#10b981';
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // ✅ KEY FIX: destroy any existing map instance before creating a new one.
    // React StrictMode mounts → unmounts → remounts in dev, causing Leaflet to
    // see the same DOM node twice. Explicit remove() prevents the crash.
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: effectiveCenter,
      zoom: effectiveZoom,
    });
    mapRef.current = map;

    // Tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Heatmap circles
    heatmapData.forEach((point) => {
      L.circle([point.lat, point.lng], {
        radius: 300,
        color: getHeatmapColor(point.intensity),
        fillColor: getHeatmapColor(point.intensity),
        fillOpacity: 0.4,
        weight: 0,
      }).addTo(map);
    });

    // User location marker + radius circle
    if (userLocation) {
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;background:#3b82f6;border:4px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);animation:pulse 2s infinite"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker(userLocation, { icon: userIcon }).addTo(map).bindPopup('You are here');
      L.circle(userLocation, {
        radius,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.1,
      }).addTo(map);
    }

    // Trail polyline
    if (showTrail && restaurants.length > 0) {
      const trailPoints: [number, number][] = [
        ...(userLocation ? [userLocation] : []),
        ...restaurants.filter(r => r.lat && r.lng).map(r => [r.lat, r.lng] as [number, number]),
      ];
      L.polyline(trailPoints, {
        color: '#10b981',
        weight: 4,
        dashArray: '10, 10',
        opacity: 0.6,
      }).addTo(map);
    }

    // Restaurant markers
    restaurants
      .filter(r => r.lat && r.lng)
      .forEach((rest, idx) => {
        const imgSrc = rest.food_image || rest.image;
        const borderColor = showTrail ? '#10b981' : 'white';
        const indexBadge = showTrail
          ? `<div style="position:absolute;top:0;left:0;width:20px;height:20px;background:#10b981;color:white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;border-bottom-right-radius:6px">${idx + 1}</div>`
          : '';

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:48px;height:48px;border-radius:50%;border:4px solid ${borderColor};box-shadow:0 2px 8px rgba(0,0,0,0.3);overflow:hidden;background:#10b981">
              <img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover" onerror="this.src='https://picsum.photos/seed/food/100/100'" />
              ${indexBadge}
              <div style="position:absolute;bottom:0;right:0;width:12px;height:12px;background:#10b981;border:2px solid white;border-radius:50%"></div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 48],
          popupAnchor: [0, -48],
        });

        const popupHtml = `
          <div style="width:192px;font-family:sans-serif">
            <img src="${imgSrc}" alt="${rest.name}" style="width:100%;height:112px;object-fit:cover;border-radius:8px 8px 0 0" referrerpolicy="no-referrer" />
            <div style="padding:12px">
              <h3 style="font-weight:700;color:#18181b;margin:0 0 2px;font-size:14px;line-height:1.3">${rest.food_name || rest.name}</h3>
              <p style="font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px">${rest.name}</p>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <div style="display:flex;align-items:center;gap:4px">
                  <span style="color:#f59e0b">★</span>
                  <span style="font-size:12px;font-weight:700;color:#18181b">${rest.rating?.toFixed(1) ?? 'N/A'}</span>
                </div>
                ${rest.distance !== undefined ? `<span style="font-size:10px;color:#71717a">${rest.distance.toFixed(2)} km away</span>` : ''}
              </div>
              <div style="display:flex;gap:8px">
                <a href="/restaurant/${rest.id}" style="flex:1;text-align:center;padding:6px 0;background:#18181b;color:white;font-size:10px;font-weight:700;border-radius:6px;text-decoration:none">Details</a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${rest.lat},${rest.lng}" target="_blank" rel="noopener noreferrer" style="width:32px;height:32px;background:#10b981;display:flex;align-items:center;justify-content:center;border-radius:6px;color:white;font-size:16px;text-decoration:none">↗</a>
              </div>
            </div>
          </div>
        `;

        L.marker([rest.lat, rest.lng], { icon })
          .addTo(map)
          .bindPopup(popupHtml, { maxWidth: 220 });
      });

    // ✅ Cleanup on unmount — critical for React StrictMode
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    effectiveCenter[0],
    effectiveCenter[1],
    effectiveZoom,
    restaurants.length,
    userLocation,
    radius,
    showTrail,
    heatmapData.length,
  ]);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
      `}</style>
      <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 z-0">
        <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      </div>
    </>
  );
}