import { useState, useEffect } from 'react';
import MapView from '../components/MapView';

export default function MapPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    fetch('/api/restaurants')
      .then(res => res.json())
      .then(setRestaurants);

    fetch('/api/food-heatmap')
      .then(res => res.json())
      .then(setHeatmapData);
  }, []);

  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <MapView restaurants={restaurants} heatmapData={heatmapData} />
    </div>
  );
}
