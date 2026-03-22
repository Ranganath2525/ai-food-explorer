import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, TrendingUp, Sparkles, Map as MapIcon, Star, Clock, Camera, Play, Calendar } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import { motion } from 'framer-motion'; // ✅ FIXED: was 'motion/react'

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [trendingFoods, setTrendingFoods] = useState([]);
  const [recommendedFoods, setRecommendedFoods] = useState([]);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch general foods
    fetch('/api/foods')
      .then(res => res.json())
      .then(data => {
        const uniqueFoods = Array.from(new Map(data.map((f: any) => [f.id, f])).values());
        setFoods(uniqueFoods.slice(0, 6) as any);
      });

    // Fetch recent check-ins
    fetch('/api/check-ins/nearby')
      .then(res => res.json())
      .then(setRecentCheckins);

    // Get location for personalized features
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserLocation([lat, lng]);

      // Fetch trending
      fetch(`/api/foods/trending?lat=${lat}&lng=${lng}`)
        .then(res => res.json())
        .then(setTrendingFoods);

      // Fetch recommended
      fetch(`/api/foods/recommended?lat=${lat}&lng=${lng}`)
        .then(res => res.json())
        .then(setRecommendedFoods);
    }, () => {
      // Fallback trending without location
      fetch('/api/foods/trending')
        .then(res => res.json())
        .then(setTrendingFoods);
    });
  }, []);

  const handleSearch = () => {
    if (!search.trim() && !city.trim()) {
      alert('Please enter a food name or city to search');
      return;
    }
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (city.trim()) params.append('city', city.trim().charAt(0).toUpperCase() + city.trim().slice(1).toLowerCase());
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070"
            className="w-full h-full object-cover opacity-40 dark:opacity-20"
            alt="Hero background"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-50/50 to-zinc-50 dark:via-zinc-950/50 dark:to-zinc-950" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-zinc-900 dark:text-white mb-6"
          >
            AI <span className="text-emerald-500">Food Explorer</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto"
          >
            Discover iconic dishes with AI vision, personalized taste predictions, and viral street food feeds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 mb-8">
              <div className="flex items-center flex-1 w-full px-4 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
                <Search className="w-5 h-5 text-zinc-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search for food (e.g. Biryani)"
                  className="w-full py-4 bg-transparent outline-none text-zinc-900 dark:text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex items-center flex-1 w-full px-4">
                <MapPin className="w-5 h-5 text-zinc-400 mr-3" />
                <input
                  type="text"
                  placeholder="Enter city"
                  className="w-full py-4 bg-transparent outline-none text-zinc-900 dark:text-white"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="w-full md:w-auto px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/scan"
                className="px-6 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center space-x-2 border border-zinc-200 dark:border-zinc-800"
              >
                <Camera className="w-5 h-5 text-emerald-500" />
                <span>Scan Food</span>
              </Link>
              <Link
                to="/videos"
                className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center space-x-2"
              >
                <Play className="w-5 h-5 text-emerald-500" />
                <span>Watch Videos</span>
              </Link>
              <Link
                to="/map"
                className="px-6 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center space-x-2 border border-zinc-200 dark:border-zinc-800"
              >
                <MapIcon className="w-5 h-5 text-emerald-500" />
                <span>Food Map</span>
              </Link>
              <Link
                to="/plan"
                className="px-6 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center space-x-2 border border-zinc-200 dark:border-zinc-800"
              >
                <Calendar className="w-5 h-5 text-emerald-500" />
                <span>Meal Plan</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Recommended Section */}
      {recommendedFoods.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center space-x-2 text-emerald-500 font-bold uppercase tracking-widest text-xs mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI Taste Prediction</span>
          </div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-8">Foods You May Love</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedFoods.map((food: any, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                <div className="relative h-48">
                  <img src={food.food_image} alt={food.food_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-lg">
                    AI PREDICTION
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white">{food.food_name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{food.restaurant_rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500 mb-4">{food.restaurant_name} • {food.distance?.toFixed(1)} km away</p>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium italic">"{food.ai_reason}"</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Check-ins */}
      {recentCheckins.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center space-x-2 text-blue-500 font-bold uppercase tracking-widest text-xs mb-4">
            <MapPin className="w-4 h-4" />
            <span>Social Feed</span>
          </div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-8">Recent Food Check-ins</h2>
          <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
            {recentCheckins.map((checkin: any, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-72 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    {checkin.user_name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{checkin.user_name}</h4>
                    <p className="text-[10px] text-zinc-500">{new Date(checkin.timestamp).toLocaleTimeString()} • {checkin.restaurant_name}</p>
                  </div>
                </div>
                <img src={checkin.restaurant_image} className="w-full h-32 object-cover rounded-2xl mb-3" alt={checkin.restaurant_name} />
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Just checked in at <span className="font-bold text-emerald-500">{checkin.restaurant_name}</span>!</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Food Trail CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-zinc-900 dark:bg-emerald-950 rounded-[40px] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4">
              <MapIcon className="w-4 h-4" />
              <span>New Feature</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Take a Food Trail</h2>
            <p className="text-zinc-400 text-lg mb-8">We've mapped out the perfect route to try 5 of the most iconic dishes in your area. Ready for a culinary adventure?</p>
            <Link
              to="/explore?mode=trail"
              className="inline-flex items-center px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all hover:scale-105"
            >
              Start Food Trail <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
          <div className="relative z-10 w-full md:w-1/3 aspect-square bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col justify-center">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">{i}</div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/50 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <div className="text-3xl font-black text-white">5 Spots</div>
              <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest mt-1">Optimized Route</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {trendingFoods.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center space-x-2 text-rose-500 font-bold uppercase tracking-widest text-xs mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>🔥 Trending in the Area</span>
              </div>
              <h2 className="text-4xl font-black text-zinc-900 dark:text-white">What's Hot Right Now</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingFoods.slice(0, 4).map((food: any, i) => (
              <div key={i} className="group relative bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-zinc-900 dark:text-white mb-1">{food.name}</h3>
                  <p className="text-xs text-zinc-500 mb-3">{food.restaurant_name}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">{food.restaurant_rating}</span>
                    </div>
                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      Trending Score: {Math.round(food.trending_score)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Foods */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center space-x-2 text-emerald-500 font-bold uppercase tracking-widest text-xs mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Discover</span>
            </div>
            <h2 className="text-4xl font-black text-zinc-900 dark:text-white">Popular Local Foods</h2>
          </div>
          <Link to="/explore" className="group flex items-center text-zinc-500 hover:text-emerald-500 font-bold transition-colors">
            View All <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {foods.map((food: any, index: number) => (
            <div key={food.id || index}>
              <FoodCard food={food} />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-zinc-100 dark:bg-zinc-900 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-zinc-900 dark:text-white mb-16">How AI Food Explorer Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Pick a Location', desc: 'Choose the city you are in or planning to visit.' },
              { step: '02', title: 'Find Iconic Foods', desc: 'Browse through famous dishes that define the local culture.' },
              { step: '03', title: 'Locate Best Spots', desc: 'Get exact locations of restaurants and vendors serving them.' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-6xl font-black text-emerald-500/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}