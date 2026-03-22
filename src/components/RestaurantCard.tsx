import { Link } from 'react-router-dom';
import { Star, Clock, IndianRupee } from 'lucide-react';
import { motion } from 'motion/react';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  price_range: string;
  rating: number;
  opening_hours: string;
  image: string;
}

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row"
    >
      <div className="sm:w-48 h-48 sm:h-auto overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{restaurant.name}</h3>
            <div className="flex items-center space-x-1 px-2 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-500">{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{restaurant.address}</p>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-zinc-400" />
              <span>{restaurant.opening_hours}</span>
            </div>
            <div className="flex items-center">
              <IndianRupee className="w-4 h-4 mr-1 text-zinc-400" />
              <span>{restaurant.price_range}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Link
            to={`/restaurant/${restaurant.id}`}
            className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
