import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import React from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Login] Submitting form...', { email });
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      console.log('[Login] Response status:', res.status);
      const data = await res.json();
      console.log('[Login] Response data:', data);
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('[Login] Error during login:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <div className="text-center mb-10">
            <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl mb-4">
              <LogIn className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Welcome Back</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Sign in to your FoodSpotter account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@foodspotter.com');
                  setPassword('admin123');
                }}
                className="w-full py-2 text-sm text-zinc-500 hover:text-emerald-500 transition-colors"
              >
                Use Admin Credentials (Testing)
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-500 font-bold hover:underline">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
