import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import FoodDetails from './pages/FoodDetails';
import RestaurantDetails from './pages/RestaurantDetails';
import MapPage from './pages/MapPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ScanFood from './pages/ScanFood';
import StreetFoodVideos from './pages/StreetFoodVideos';
import FoodPlan from './pages/FoodPlan';
import Chatbot from './components/Chatbot';

export default function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <Router>
          <div className="min-h-screen transition-colors duration-300">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/food/:id" element={<FoodDetails />} />
                <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/scan" element={<ScanFood />} />
                <Route path="/videos" element={<StreetFoodVideos />} />
                <Route path="/plan" element={<FoodPlan />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            <Chatbot />
          </div>
        </Router>
      </DarkModeProvider>
    </AuthProvider>
  );
}
