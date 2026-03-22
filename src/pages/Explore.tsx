
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Navigation, Loader2, Map as MapIcon, Grid, Sparkles, Footprints, Clock, AlertCircle } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import MapView from '../components/MapView';
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [trail, setTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState(20);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [isTrailMode, setIsTrailMode] = useState(searchParams.get('mode') === 'trail');
  const [error, setError] = useState<string | null>(null);

  // ✅ FIX: Separate fetch functions — search always uses /api/foods, nearby uses /api/foods/nearby
  const fetchBySearch = async (searchVal = search, cityVal = city) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', searchVal);
      if (city)   params.append('city', cityVal);
      const res = await fetch(`/api/foods?${params.toString()}`);
      const data = await res.json();
      setFoods(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Search error:", e);
      setError("Failed to fetch foods. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNearby = async (loc: [number, number]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/foods/nearby?lat=${loc[0]}&lng=${loc[1]}&radius=${radius}`);
      const data = await res.json();
      setFoods(Array.isArray(data) ? data : []);

      // AI recommendations
      const recRes = await fetch(`/api/foods/recommended?lat=${loc[0]}&lng=${loc[1]}`);
      const recData = await recRes.json();
      setRecommended(Array.isArray(recData) ? recData : []);

      // Trail
      if (isTrailMode) {
        const trailRes = await fetch(`/api/food-trail?lat=${loc[0]}&lng=${loc[1]}`);
        const trailData = await trailRes.json();
        setTrail(Array.isArray(trailData) ? trailData : []);
      }
    } catch (e) {
      console.error("Nearby fetch error:", e);
      setError("Failed to fetch nearby foods.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load — use search params if present, else load all
  useEffect(() => {
  const initialSearch = searchParams.get('search') || '';
  const initialCity   = searchParams.get('city') || '';
  const mode          = searchParams.get('mode');

  if (initialSearch) setSearch(initialSearch);
  if (initialCity)   setCity(initialCity);

  if (mode === 'trail') {
    handleGetLocation();
  } else if (initialSearch || initialCity) {
    // ✅ Read directly from URL — state is stale at this point
    setLoading(true);
    const params = new URLSearchParams();
    if (initialSearch) params.append('search', initialSearch);
    if (initialCity)   params.append('city', initialCity);
    fetch(`/api/foods?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setFoods(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  } else {
    fetchBySearch();
  }
}, []);

 
  // Re-fetch when city filter changes — only after initial mount
  const isMounted = useRef(false);
  useEffect(() => {
  if (!isMounted.current) { isMounted.current = true; return; }
  if (!isNearbyMode) fetchBySearch();
}, [city]);

  // Re-fetch when radius changes in nearby mode
  useEffect(() => {
    if (isNearbyMode && userLocation) fetchNearby(userLocation);
  }, [radius]);

  const handleSearch = () => {
    // ✅ Always search all foods — never restricted to nearby
    setIsNearbyMode(false);
    fetchBySearch(search, city);
  };

  const handleGetLocation = () => {
    setLocating(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(loc);
        setIsNearbyMode(true);
        setLocating(false);
        setViewMode('map');
        fetchNearby(loc);
      },
      () => {
        setError("Unable to get location. Please check permissions.");
        setLocating(false);
      }
    );
  };

  const clearNearby = () => {
    setIsNearbyMode(false);
    setUserLocation(null);
    setIsTrailMode(false);
    setViewMode('grid');
    fetchBySearch();
  };

  const mapRestaurants = (isTrailMode ? trail : foods).map((f: any) => ({
    id: f.restaurant_id || f.id,
    name: f.restaurant_name || f.name,
    lat: f.restaurant_lat || f.lat,
    lng: f.restaurant_lng || f.lng,
    address: f.restaurant_address || f.address,
    image: f.restaurant_image || f.image,
    food_name: f.food_name || f.name,
    food_image: f.food_image || f.image,
    rating: f.restaurant_rating || f.rating,
    distance: f.distance
  }));

  const uniqueFoods = Array.from(new Map(foods.map((f: any) => [f.id, f])).values());

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4">

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-2">
              {isTrailMode ? 'Food Trail' : isNearbyMode ? 'Nearby Foods' : 'Explore Foods'}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {isTrailMode
                ? 'Your optimized route to try 5 famous dishes nearby'
                : isNearbyMode
                  ? `Showing results within ${radius}km of your location`
                  : 'Discover the best local dishes in your city'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const next = !isTrailMode;
                setIsTrailMode(next);
                if (next) {
                  setIsNearbyMode(true);
                  setViewMode('map');
                  if (!userLocation) handleGetLocation();
                  else fetchNearby(userLocation!);
                }
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isTrailMode
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg'
                  : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <Footprints className="w-4 h-4" />
              <span>{isTrailMode ? 'Trail Active' : 'Food Trail'}</span>
            </button>

            <button
              onClick={handleGetLocation}
              disabled={locating}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isNearbyMode && !isTrailMode
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              <span>{isNearbyMode && !isTrailMode ? 'Nearby Active' : 'Find Nearby'}</span>
            </button>

            <div className="flex p-1 bg-zinc-200 dark:bg-zinc-900 rounded-xl">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
                <Grid className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {recommended.length > 0 && !isTrailMode && (
          <div className="mb-12">
            <div className="flex items-center space-x-2 text-emerald-500 font-bold uppercase tracking-widest text-[10px] mb-4">
              <Sparkles className="w-3 h-3" />
              <span>AI Recommendations Nearby</span>
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
              {recommended.map((rec: any, i) => (
                <div key={i} className="flex-shrink-0 w-72 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center space-x-4">
                  <img src={rec.food_image} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-sm truncate">{rec.food_name}</h3>
                    <p className="text-[10px] text-zinc-500 truncate mb-1">{rec.restaurant_name}</p>
                    <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium italic line-clamp-2">"{rec.ai_reason}"</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trail Steps */}
        {isTrailMode && trail.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-6 flex items-center">
              <Footprints className="w-6 h-6 mr-2 text-emerald-500" />
              Try These 5 Famous Foods Around You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {trail.map((step: any, i) => (
                <div key={i} className="relative bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black shadow-lg z-10">{i + 1}</div>
                  <img src={step.food_image} className="w-full h-24 rounded-xl object-cover mb-3" referrerPolicy="no-referrer" />
                  <h3 className="font-bold text-zinc-900 dark:text-white text-xs mb-1 truncate">{step.food_name}</h3>
                  <p className="text-[10px] text-zinc-500 truncate">{step.restaurant_name}</p>
                  <div className="mt-2 flex items-center justify-between text-[9px] font-bold text-zinc-400">
                    <div className="flex items-center"><MapPin className="w-2.5 h-2.5 mr-1" />{step.distance?.toFixed(1)} km</div>
                    <div className="flex items-center"><Clock className="w-2.5 h-2.5 mr-1" />~{Math.round((step.distance || 0) * 15)} min</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Search bar — always visible, always searches all foods */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search food (e.g. Biryani, Dosa, Vada Pav)..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-900 dark:text-white transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>
          <select
            className="px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none text-zinc-900 dark:text-white"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Delhi">Delhi</option>
            <option value="Chennai">Chennai</option>
            <option value="Pune">Pune</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Lucknow">Lucknow</option>
          </select>
        </div>

        {/* Nearby radius slider */}
        {isNearbyMode && !isTrailMode && (
          <div className="flex items-center space-x-4 mb-8 p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl">
            <div className="flex-1">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Search Radius</div>
              <div className="flex items-center space-x-4">
                <input type="range" min="1" max="30" step="1" value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="flex-1 accent-emerald-500" />
                <span className="text-sm font-black text-zinc-900 dark:text-white w-12">{radius} km</span>
              </div>
            </div>
            <button onClick={clearNearby} className="text-xs font-bold text-zinc-500 hover:text-rose-500 transition-colors">
              Clear Nearby
            </button>
          </div>
        )}

        {/* Map */}
        {viewMode === 'map' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative mb-8">
            <MapView
              restaurants={mapRestaurants}
              userLocation={userLocation}
              radius={radius * 1000}
              zoom={14}
              showTrail={isTrailMode}
            />
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            )}
          </motion.div>
        )}

        {/* Results */}
        {!isTrailMode && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              {uniqueFoods.length} {uniqueFoods.length === 1 ? 'Result' : 'Results'} Found
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : uniqueFoods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {uniqueFoods.map((food: any) => (
                  <div key={food.id} className="relative">
                    <FoodCard food={food} />
                    {food.distance !== undefined && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-lg">
                        {food.distance.toFixed(2)} KM AWAY
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="inline-flex p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
                  <Search className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No food found</h3>
                <p className="text-zinc-500 text-sm">
                  {search ? `No results for "${search}". Try a different keyword.` : 'Try searching for a food name.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}