import React, { useState, useEffect, useRef } from 'react';
import { Play, MapPin, Loader2, Heart, Share2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const StreetFoodVideos = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [likes, setLikes] = useState<Record<number, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos/street-food?city=Bengaluru');
      const data = await response.json();
      setVideos(data);
      // Init like counts from data or default
      const initLikes: Record<number, number> = {};
      data.forEach((_: any, i: number) => { initLikes[i] = Math.floor(Math.random() * 3000) + 500; });
      setLikes(initLikes);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollPos = containerRef.current.scrollTop;
      const height = containerRef.current.clientHeight;
      const newIdx = Math.round(scrollPos / height);
      if (newIdx !== activeIdx) setActiveIdx(newIdx);
    }
  };

  // ✅ Watch Full Video — opens YouTube
  const handleWatchVideo = (video: any) => {
    if (video.videoId) {
      window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank', 'noopener,noreferrer');
    }
  };

  // ✅ Find Food — navigates to map/search with video location
  const handleFindFood = (video: any) => {
    const city = video.location || 'Bengaluru';
    navigate(`/?search=${encodeURIComponent(city)}`);
  };

  // ✅ Like — toggles heart and updates count
  const handleLike = (idx: number) => {
    setLiked(prev => {
      const isLiked = prev[idx];
      setLikes(l => ({ ...l, [idx]: l[idx] + (isLiked ? -1 : 1) }));
      return { ...prev, [idx]: !isLiked };
    });
  };

  // ✅ Share — uses Web Share API or copies link to clipboard
  const handleShare = async (video: any) => {
    const url = video.videoId
      ? `https://www.youtube.com/watch?v=${video.videoId}`
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, url });
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  // ✅ Comment — scroll to comments or show toast
  const handleComment = () => {
    alert('Comments coming soon!');
  };

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-black overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="hidden md:flex w-80 bg-zinc-900 border-r border-zinc-800 flex-col p-6 pt-24">
        <h1 className="text-2xl font-black text-white mb-2">Street Food Feed</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Discover the most viral street foods near you through short videos.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <h3 className="text-emerald-500 font-bold text-sm mb-1">Trending Now</h3>
            <p className="text-white text-xs">"Best Masala Dosa in Gandhi Bazaar" is going viral!</p>
          </div>
        </div>
      </div>

      {/* Video feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {videos.map((video, idx) => (
          <div
            key={video.id}
            className="h-screen w-full snap-start relative flex items-center justify-center bg-zinc-900"
          >
            {/* Background thumbnail */}
            <div className="absolute inset-0">
              <img
                src={video.thumbnail}
                className="w-full h-full object-cover opacity-60"
                alt={video.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
            </div>

            {/* Bottom overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 pb-24 md:pb-12 max-w-lg mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={activeIdx === idx ? { opacity: 1, y: 0 } : {}}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                    Trending
                  </span>
                  <span className="flex items-center text-white/80 text-xs font-bold">
                    <MapPin className="w-3 h-3 mr-1" /> {video.location}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white leading-tight">{video.title}</h2>

                <div className="flex items-center space-x-4 pt-4">
                  {/* ✅ Watch Full Video */}
                  <button
                    onClick={() => handleWatchVideo(video)}
                    className="flex-1 py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-zinc-200 active:scale-95 transition-all"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Watch Full Video</span>
                  </button>

                  {/* ✅ Find Food */}
                  <button
                    onClick={() => handleFindFood(video)}
                    className="px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-600 active:scale-95 transition-all"
                  >
                    Find Food
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Sidebar action buttons */}
            <div className="absolute right-4 bottom-32 flex flex-col space-y-6 items-center">
              {/* ✅ Like */}
              <button
                onClick={() => handleLike(idx)}
                className="flex flex-col items-center space-y-1"
              >
                <div className={`w-12 h-12 bg-zinc-800/80 backdrop-blur-md rounded-full flex items-center justify-center transition-colors ${liked[idx] ? 'text-red-500' : 'text-white hover:text-red-400'}`}>
                  <Heart className={`w-6 h-6 transition-all ${liked[idx] ? 'fill-current scale-110' : ''}`} />
                </div>
                <span className="text-white text-[10px] font-bold">{formatCount(likes[idx] ?? 0)}</span>
              </button>

              {/* ✅ Comment */}
              <button
                onClick={handleComment}
                className="flex flex-col items-center space-y-1"
              >
                <div className="w-12 h-12 bg-zinc-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-emerald-400 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-white text-[10px] font-bold">128</span>
              </button>

              {/* ✅ Share */}
              <button
                onClick={() => handleShare(video)}
                className="flex flex-col items-center space-y-1"
              >
                <div className="w-12 h-12 bg-zinc-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-emerald-400 transition-colors">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-white text-[10px] font-bold">Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreetFoodVideos;