import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Loader2, ChevronRight, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function RestaurantMiniMap({
  center,
  restaurants,
}: {
  center: [number, number];
  restaurants: { lat: number; lng: number; restaurant_name: string; distance: number }[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

    const map = L.map(containerRef.current, { center, zoom: 13 });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    restaurants.forEach((rest) => {
      L.marker([rest.lat, rest.lng])
        .addTo(map)
        .bindPopup(`<b>${rest.restaurant_name}</b><br/>${rest.distance.toFixed(1)} km away`);
    });

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], restaurants.length]);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}

// ✅ Helper: find the auth token regardless of which key your app uses
function getAuthToken(): string | null {
  // Check common key names — add yours here if different
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('jwt') ||
    sessionStorage.getItem('token') ||
    null
  );
}

const ScanFood = () => {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Check if user is logged in
  const token = getAuthToken();
  const isLoggedIn = !!token;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: 12.9716, lng: 77.5946 })
    );
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      scanImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const scanImage = async (base64Image: string) => {
    setScanning(true);
    setResult(null);
    setError(null);

    const authToken = getAuthToken();
    if (!authToken) {
      setError('You must be logged in to use the food scanner.');
      setScanning(false);
      return;
    }

    try {
      const response = await fetch('/api/scan-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          image: base64Image,
          lat: location?.lat ?? 12.9716,
          lng: location?.lng ?? 77.5946,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ✅ Server returned 4xx/5xx — show the error message, don't crash
        setError(data?.error || `Server error: ${response.status}`);
        return;
      }

      // ✅ Guarantee restaurants is always an array, even if API returns something unexpected
      setResult({
        ...data,
        restaurants: Array.isArray(data.restaurants) ? data.restaurants : [],
      });
    } catch (err) {
      console.error('Scan failed:', err);
      setError('Network error — please check your connection and try again.');
    } finally {
      setScanning(false);
    }
  };

  const mapCenter: [number, number] = [location?.lat ?? 12.9716, location?.lng ?? 77.5946];

  // ✅ Show login prompt if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Login Required</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            You need to be logged in to use the AI Food Scanner.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-zinc-900 dark:text-white mb-4"
          >
            AI Food Scanner
          </motion.h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Snap a photo of any dish and we'll find where you can eat it nearby.
          </p>
        </div>

        {!image ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
              <Camera className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Take a Photo</h3>
            <p className="text-zinc-500">or click to upload from your gallery</p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img src={image} alt="Scanned food" className="w-full h-full object-cover" />
                {scanning && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-bold text-lg">AI Identifying Food...</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => { setImage(null); setResult(null); setError(null); }}
                className="w-full py-4 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-bold hover:opacity-80 transition-opacity"
              >
                Scan Another Dish
              </button>
            </div>

            <div className="space-y-6">
              {/* ✅ Error state — shown instead of crashing */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl font-medium">
                  {error}
                </div>
              )}

              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-500">AI Identification</span>
                        <span className="text-xs font-bold text-zinc-400">{Math.round((result.confidence ?? 0) * 100)}% Confidence</span>
                      </div>
                      <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">{result.name}</h2>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        {/* ✅ Safe access — result.restaurants is guaranteed to be an array */}
                        We found {result.restaurants.length} place{result.restaurants.length !== 1 ? 's' : ''} serving {result.name} within 5km of you.
                      </p>
                    </div>

                    {result.restaurants.length > 0 && (
                      <div className="h-64 rounded-3xl overflow-hidden shadow-xl border border-zinc-100 dark:border-zinc-800">
                        <RestaurantMiniMap center={mapCenter} restaurants={result.restaurants} />
                      </div>
                    )}

                    {result.restaurants.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Nearby Places</h3>
                        {result.restaurants.map((rest: any, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-zinc-900 p-4 rounded-2xl flex items-center space-x-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-zinc-100 dark:border-zinc-800"
                          >
                            <img
                              src={rest.food_image || 'https://picsum.photos/seed/food/100/100'}
                              className="w-16 h-16 rounded-xl object-cover"
                              alt={rest.food_name}
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/food/100/100'; }}
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-zinc-900 dark:text-white">{rest.restaurant_name}</h4>
                              <div className="flex items-center text-xs text-zinc-500 space-x-2">
                                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{rest.distance?.toFixed(1)} km</span>
                                <span>•</span>
                                <span className="text-emerald-500 font-bold">★ {rest.rating}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-300" />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      // ✅ Empty state instead of blank screen
                      <div className="text-center py-8 text-zinc-400 dark:text-zinc-600">
                        <p className="font-medium">No nearby restaurants found for <span className="text-zinc-600 dark:text-zinc-400">"{result.name}"</span>.</p>
                        <p className="text-sm mt-1">Try expanding your search area or scan a different dish.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanFood;