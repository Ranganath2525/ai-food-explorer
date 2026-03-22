import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import { Search, Map as MapIcon, User, LogOut, Sun, Moon, UtensilsCrossed, Camera, Play, Calendar, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: '/explore', label: 'Explore' },
    { to: '/map', label: 'Map', icon: MapIcon },
    { to: '/scan', label: 'Scan', icon: Camera },
    { to: '/videos', label: 'Videos', icon: Play },
    { to: '/plan', label: 'Plan', icon: Calendar },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">AI Food Explorer</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
              >
                {link.icon && <link.icon className="w-4 h-4 mr-1" />}
                {link.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors">Admin</Link>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={toggle}
              className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/profile" className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <User className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-4 px-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-4 py-3 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              {link.icon && <link.icon className="w-5 h-5 mr-3 text-emerald-500" />}
              {link.label}
            </Link>
          ))}
          <hr className="border-zinc-100 dark:border-zinc-800 my-2" />
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-3 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <User className="w-5 h-5 mr-3 text-zinc-400" />
                Profile
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center w-full px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
