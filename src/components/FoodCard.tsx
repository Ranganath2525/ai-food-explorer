import { Link } from 'react-router-dom';
import { Star, MapPin, IndianRupee } from 'lucide-react';
import { motion } from 'motion/react';

interface Food {
  id: number;
  name: string;
  description: string;
  city: string;
  category: string;
  image: string;
  popularity_score: number;
  price_range?: string;        // "$" | "$$" | "$$$"
  restaurant_name?: string;
  restaurant_rating?: number;
  distance?: number;
}

// ✅ Convert $ symbols to rupee range
function getPriceLabel(price?: string) {
  if (!price) return null;
  const map: Record<string, string> = {
    '$':   '₹100–200',
    '$$':  '₹200–500',
    '$$$': '₹500+',
  };
  return map[price] ?? price;
}

export default function FoodCard({ food }: { food: Food }) {
  const priceLabel = getPriceLabel(food.price_range);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
    >
      <Link to={`/food/${food.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
            }}
          />
          {/* Rating badge */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-zinc-900 dark:text-white">
              {food.restaurant_rating?.toFixed(1) ?? food.popularity_score}
            </span>
          </div>

          {/* ✅ Price badge */}
          {priceLabel && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-lg flex items-center space-x-0.5">
              <IndianRupee className="w-3 h-3 text-white" />
              <span className="text-[10px] font-black text-white">{priceLabel}</span>
            </div>
          )}

          {/* Category pill */}
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{food.category}</span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 truncate">{food.name}</h3>

          {/* Restaurant name if available */}
          {food.restaurant_name && (
            <p className="text-xs font-semibold text-emerald-500 mb-1 truncate">{food.restaurant_name}</p>
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-sm">
              <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
              <span className="truncate">{food.city}</span>
            </div>
            {/* ✅ Distance if available */}
            {food.distance !== undefined && (
              <span className="text-xs font-bold text-emerald-500 shrink-0 ml-2">
                {food.distance.toFixed(1)} km
              </span>
            )}
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {food.description}
          </p>

          {/* ✅ Bottom price row */}
          {priceLabel && (
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-xs">
                <IndianRupee className="w-3 h-3 mr-0.5" />
                <span className="font-medium">{priceLabel} per person</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                {food.price_range === '$' ? 'Budget' : food.price_range === '$$' ? 'Mid-range' : 'Premium'}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}