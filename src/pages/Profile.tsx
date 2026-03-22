import React, { useState, useEffect } from 'react';
import { User, Award, MapPin, Star, Settings, ChevronRight, LogOut, Loader2, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [badgesRes, leaderboardRes] = await Promise.all([
        fetch('/api/user/badges', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/leaderboard')
      ]);
      const badgesData = await badgesRes.json();
      const leaderboardData = await leaderboardRes.json();
      setBadges(badgesData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: User Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl text-center border border-zinc-100 dark:border-zinc-800">
            <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-black">
              {user?.name?.[0] || 'U'}
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">{user?.name}</h2>
            <p className="text-zinc-500 text-sm mb-6">{user?.email}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                <div className="text-xl font-black text-zinc-900 dark:text-white">12</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Check-ins</div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                <div className="text-xl font-black text-zinc-900 dark:text-white">4</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Badges</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
            <button className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-zinc-400" />
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-300" />
            </button>
            <button 
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              className="w-full p-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-red-500"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5" />
                <span className="font-bold">Logout</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Badges & Leaderboard */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Badges Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center">
                <Award className="w-6 h-6 mr-2 text-emerald-500" />
                Your Badges
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges.map((badge, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-3xl text-center border transition-all ${
                    badge.awarded_at 
                      ? 'bg-white dark:bg-zinc-900 border-emerald-500/20 shadow-lg' 
                      : 'bg-zinc-100 dark:bg-zinc-800 border-transparent opacity-40 grayscale'
                  }`}
                >
                  <div className="text-4xl mb-3">{badge.icon}</div>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white mb-1 uppercase tracking-tight">{badge.name}</h4>
                  <p className="text-[10px] text-zinc-500 leading-tight">{badge.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Leaderboard Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                Food Explorer Leaderboard
              </h3>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
              {leaderboard.map((entry, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-4 border-b border-zinc-50 dark:border-zinc-800 last:border-0 ${
                    entry.name === user?.name ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`w-6 text-center font-black ${
                      idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-zinc-400' : idx === 2 ? 'text-orange-400' : 'text-zinc-300'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-500">
                      {entry.name[0]}
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-white">{entry.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-black text-zinc-900 dark:text-white">{entry.checkin_count}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Check-ins</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Profile;
