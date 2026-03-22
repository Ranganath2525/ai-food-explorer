import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ✅ StrictMode removed — it caused Leaflet "Map container already initialized" error
// ✅ Also fixes dark mode applying to full screen (no StrictMode double-render interference)
createRoot(document.getElementById('root')!).render(
  <App />
);