import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Signup] Submitting form...', { name, email });
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      console.log('[Signup] Response status:', res.status);
      const data = await res.json();
      console.log('[Signup] Response data:', data);
      if (res.ok) {
        setStep(2);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('[Signup] Error during signup:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Signup] Verifying OTP...', { email, otp });
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      console.log('[Signup] Verify OTP status:', res.status);
      const data = await res.json();
      console.log('[Signup] Verify OTP data:', data);
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('[Signup] Error during OTP verification:', err);
      setError('Verification failed. Please try again.');
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
              {step === 1 ? (
                <UserPlus className="w-8 h-8 text-emerald-500" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              )}
            </div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
              {step === 1 ? 'Join FoodSpotter' : 'Verify Email'}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
              {step === 1 
                ? 'Start your culinary adventure today' 
                : `We've sent a 6-digit code to ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
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
                <span>{loading ? 'Sending OTP...' : 'Create Account'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Enter 6-Digit Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-center text-2xl font-black tracking-[1em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Join'}</span>
                {!loading && <ShieldCheck className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Back to Signup
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-500 font-bold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
