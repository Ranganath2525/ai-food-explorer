import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit, LayoutDashboard, Utensils, Store, Star } from 'lucide-react';

export default function Admin() {
  const { user, token } = useAuth();
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activeTab, setActiveTab] = useState<'foods' | 'restaurants'>('foods');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/foods')
        .then(res => res.json())
        .then(data => {
          const uniqueFoods = Array.from(new Map(data.map((f: any) => [f.id, f])).values());
          setFoods(uniqueFoods);
        });
      fetch('/api/restaurants').then(res => res.json()).then(setRestaurants);
    }
  }, [user]);

  if (user?.role !== 'admin') return <div className="min-h-screen flex items-center justify-center">Access Denied.</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center space-x-2 text-emerald-500 font-bold uppercase tracking-widest text-xs mb-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Control Panel</span>
            </div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white">Management Dashboard</h1>
          </div>
          <button className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add New Entry</span>
          </button>
        </div>

        <div className="flex space-x-1 p-1 bg-zinc-200 dark:bg-zinc-900 rounded-2xl mb-8 w-fit">
          <button
            onClick={() => setActiveTab('foods')}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'foods' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <div className="flex items-center space-x-2">
              <Utensils className="w-4 h-4" />
              <span>Foods</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'restaurants' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4" />
              <span>Restaurants</span>
            </div>
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">{activeTab === 'foods' ? 'City' : 'Address'}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">{activeTab === 'foods' ? 'Category' : 'Rating'}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {(activeTab === 'foods' ? foods : restaurants).map((item: any) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={item.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <span className="font-bold text-zinc-900 dark:text-white">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">{activeTab === 'foods' ? item.city : item.address}</td>
                  <td className="px-6 py-4">
                    {activeTab === 'foods' ? (
                      <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold rounded-full uppercase">
                        {item.category}
                      </span>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">{item.rating?.toFixed(1)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
