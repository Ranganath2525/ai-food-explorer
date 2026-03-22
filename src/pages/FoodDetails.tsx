import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Heart, Share2, Info } from 'lucide-react';
import RestaurantCard from '../components/RestaurantCard';
import { useAuth } from '../context/AuthContext';

export default function FoodDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [food, setFood] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetch(`/api/foods/${id}`)
      .then(res => res.json())
      .then(data => setFood(data));

    if (user) {
      fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setIsFavorite(data.foods.some((f: any) => f.id === Number(id)));
        });
    }
  }, [id, user, token]);

  const toggleFavorite = async () => {
    if (!user) return alert('Please login to save favorites');
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ itemId: id, type: 'food' })
    });
    if (res.ok) setIsFavorite(!isFavorite);
  };

  if (!food) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img src={food.image} alt={food.name} className="w-full h-full object-cover aspect-square" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center space-x-4 mb-6">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest rounded-full">
                {food.category}
              </span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{food.popularity_score} Popularity</span>
              </div>
            </div>
            
            <h1 className="text-5xl font-black text-zinc-900 dark:text-white mb-4">{food.name}</h1>
            <div className="flex items-center text-xl text-zinc-500 dark:text-zinc-400 mb-8">
              <MapPin className="w-6 h-6 mr-2" />
              <span>Famous in {food.city}</span>
            </div>

            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-10">
              {food.description}
            </p>

            <div className="flex space-x-4">
              <button
                onClick={toggleFavorite}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl font-bold transition-all ${
                  isFavorite
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}</span>
              </button>
              <button className="p-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-16">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Best Places to Eat {food.name}</h2>
            <div className="flex items-center text-sm text-zinc-500">
              <Info className="w-4 h-4 mr-2" />
              <span>Based on local ratings</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {food.restaurants.map((rest: any) => (
              <RestaurantCard key={rest.id} restaurant={rest} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
