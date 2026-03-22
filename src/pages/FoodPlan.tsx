import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ChevronRight, Loader2, Sparkles, Navigation, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const FoodPlan = () => {
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        fetchPlan(loc);
      },
      () => {
        const loc = { lat: 12.9716, lng: 77.5946 };
        setLocation(loc);
        fetchPlan(loc);
      }
    );
  }, []);

  const fetchPlan = async (loc: { lat: number, lng: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/food-plan?lat=${loc.lat}&lng=${loc.lng}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || `Server error ${response.status}`);
        setPlan([]);
        return;
      }
      setPlan(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Network error — please try again.');
      setPlan([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Opens a single restaurant in Google Maps
  const openSingleStop = (item: any) => {
    let url: string;
    if (item.lat && item.lng) {
      // Use coordinates — most reliable
      url = `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`;
    } else {
      // Fall back to name search
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.restaurant + ', Bengaluru')}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ✅ Opens full multi-stop route in Google Maps
  const openFullRoute = () => {
    if (plan.length === 0) return;

    // Build waypoint strings — prefer coordinates
    const points = plan.map(p =>
      (p.lat && p.lng)
        ? `${p.lat},${p.lng}`
        : encodeURIComponent(p.restaurant + ', Bengaluru')
    );

    if (points.length === 1) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${points[0]}`,
        '_blank', 'noopener,noreferrer'
      );
      return;
    }

    const origin      = points[0];
    const destination = points[points.length - 1];
    const waypoints   = points.slice(1, -1).join('|');

    const url = `https://www.google.com/maps/dir/?api=1`
      + `&origin=${origin}`
      + `&destination=${destination}`
      + (waypoints ? `&waypoints=${waypoints}` : '')
      + `&travelmode=driving`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-bold animate-pulse">AI is planning your perfect food day...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 text-emerald-500 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">AI Generated Itinerary</span>
            </div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white">Plan My Food Day</h1>
          </div>
          <button
            onClick={() => location && fetchPlan(location)}
            className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-md hover:shadow-lg transition-all border border-zinc-100 dark:border-zinc-800"
            title="Regenerate plan"
          >
            <Clock className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-8">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Failed to generate plan</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!error && plan.length === 0 && (
          <div className="text-center py-16 text-zinc-400">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold text-lg">No plan available</p>
            <p className="text-sm mt-1">No nearby restaurants found. Try again later.</p>
          </div>
        )}

        {/* Plan */}
        {plan.length > 0 && (
          <>
            <div className="space-y-8 relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-4 bottom-4 w-px bg-zinc-200 dark:bg-zinc-800" />

              {plan.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-20"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[30px] top-6 w-4 h-4 rounded-full bg-emerald-500 border-4 border-zinc-50 dark:border-black z-10" />

                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 group hover:border-emerald-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">{item.time}</span>
                      <div className="flex items-center space-x-2 text-zinc-400">
                        <Navigation className="w-4 h-4" />
                        <span className="text-xs font-bold">Optimized Route</span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">{item.food}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 font-bold flex items-center">
                          <MapPin className="w-4 h-4 mr-1 shrink-0" />
                          <span className="truncate">{item.restaurant}</span>
                        </p>
                      </div>

                      {/* ✅ Per-stop directions button */}
                      <button
                        onClick={() => openSingleStop(item)}
                        className="w-14 h-14 shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center hover:bg-emerald-500 transition-colors group/btn"
                        title={`Directions to ${item.restaurant}`}
                      >
                        <ChevronRight className="w-5 h-5 text-zinc-400 group-hover/btn:text-white transition-colors" />
                      </button>
                    </div>

                    {item.reason && (
                      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm text-zinc-500 italic">"{item.reason}"</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ✅ Full route button */}
            <div className="mt-12 p-8 bg-emerald-500 rounded-3xl text-white shadow-2xl shadow-emerald-500/20">
              <h3 className="text-xl font-black mb-2">Ready to start your journey?</h3>
              <p className="text-emerald-50/80 text-sm mb-6">
                We've calculated the best route to minimize travel time between these spots.
              </p>
              <button
                type="button"
                onClick={openFullRoute}
                className="w-full py-4 bg-white text-emerald-500 rounded-2xl font-black hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
              >
                Open in Google Maps
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FoodPlan;