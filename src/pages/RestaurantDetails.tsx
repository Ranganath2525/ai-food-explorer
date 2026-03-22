import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Clock, IndianRupee, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import MapView from '../components/MapView';
import { useAuth } from '../context/AuthContext';

export default function RestaurantDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [reviewSummary, setReviewSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then(res => res.json())
      .then(data => {
        setRestaurant(data);
        if (data.reviews && data.reviews.length > 0) {
          fetchSummary();
        }
      });
  }, [id]);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch(`/api/restaurants/${id}/review-summary`);
      const data = await res.json();
      setReviewSummary(data.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return alert('Please login to check-in');
    setCheckingIn(true);
    try {
      const res = await fetch(`/api/restaurants/${id}/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setCheckedIn(true);
        setTimeout(() => setCheckedIn(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingIn(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please login to write a review');
    const res = await fetch(`/api/restaurants/${id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newReview)
    });
    if (res.ok) {
      // Refresh data
      const data = await (await fetch(`/api/restaurants/${id}`)).json();
      setRestaurant(data);
      setNewReview({ rating: 5, comment: '' });
    }
  };

  if (!restaurant) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="h-[40vh] relative">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black text-white mb-4">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-zinc-300">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-500" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-emerald-500" />
                  <span>{restaurant.opening_hours}</span>
                </div>
                <div className="flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1 text-emerald-500" />
                  <span>{restaurant.price_range}</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl flex items-center space-x-4 shadow-xl">
              <div className="text-center">
                <div className="text-2xl font-black text-zinc-900 dark:text-white">{restaurant.rating.toFixed(1)}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rating</div>
              </div>
              <div className="w-px h-10 bg-zinc-200 dark:border-zinc-800" />
              <div className="text-center">
                <div className="text-2xl font-black text-zinc-900 dark:text-white">{restaurant.reviews.length}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reviews</div>
              </div>
              <div className="w-px h-10 bg-zinc-200 dark:border-zinc-800" />
              <button
                onClick={handleCheckIn}
                disabled={checkingIn || checkedIn}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
                  checkedIn 
                    ? 'bg-emerald-500 text-white' 
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white'
                }`}
              >
                {checkedIn ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <MapPin className={`w-6 h-6 ${checkingIn ? 'animate-bounce' : ''}`} />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
                  {checkedIn ? 'Checked In' : 'Check In'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* AI Review Summary */}
          {restaurant.reviews.length > 0 && (
            <section className="bg-emerald-500/5 dark:bg-emerald-500/10 p-8 rounded-[32px] border border-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Star className="w-24 h-24 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 text-emerald-500 font-bold uppercase tracking-widest text-[10px] mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  <span>AI Review Summary</span>
                </div>
                {loadingSummary ? (
                  <div className="flex items-center space-x-2 text-zinc-500">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">AI is analyzing reviews...</span>
                  </div>
                ) : (
                  <p className="text-xl font-medium text-zinc-900 dark:text-white leading-relaxed italic">
                    "{reviewSummary}"
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Menu / Famous Foods */}
          <section>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-6">Famous Foods Served Here</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {restaurant.foods.map((food: any) => (
                <div key={food.id} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center space-x-4">
                  <img src={food.image} alt={food.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">{food.name}</h3>
                    <p className="text-xs text-zinc-500">{food.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Customer Reviews</h2>
              <div className="flex items-center text-emerald-500 font-bold">
                <MessageSquare className="w-5 h-5 mr-2" />
                <span>{restaurant.reviews.length} Comments</span>
              </div>
            </div>

            {user && (
              <form onSubmit={submitReview} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-10">
                <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Write a Review</h3>
                <div className="flex items-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className={`p-1 transition-colors ${newReview.rating >= star ? 'text-amber-500' : 'text-zinc-300'}`}
                    >
                      <Star className={`w-6 h-6 ${newReview.rating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Share your experience..."
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 mb-4 h-32"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Post Review</span>
                </button>
              </form>
            )}

            <div className="space-y-6">
              {restaurant.reviews.map((review: any) => (
                <div key={review.id} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white">{review.user_name}</div>
                      <div className="text-xs text-zinc-500">{new Date(review.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Location</h3>
            <MapView restaurants={[restaurant]} center={[restaurant.lat, restaurant.lng]} zoom={15} />
            <div className="mt-4 text-sm text-zinc-500">
              <p>{restaurant.address}</p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center"
            >
              Get Directions
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
