// Auth page — Login & Registration
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import VideoBackground from '../components/VideoBackground';
import { useUserStore } from '../store/userStore';

export default function Auth() {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const [mode, setMode] = useState('login'); // login | register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(`${BACKEND}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      
      setUser({
        userId: data.user.id,
        username: data.user.username,
        email: data.user.email,
        balance: data.user.balance,
        token: data.token,
      });
      navigate('/lobby');
    } catch (err) {
      // Demo mode — allow guest login without backend
      if (import.meta.env.DEV) {
        setUser({
          userId: `guest_${Date.now()}`,
          username: form.username || form.email?.split('@')[0] || 'GuestBidder',
          email: form.email || 'guest@auction.com',
          balance: 5000,
          token: 'demo-token',
        });
        navigate('/lobby');
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VideoBackground videoKey="waiting" overlayOpacity={0.6}>
      <div
        className="page-content flex items-center justify-center"
        style={{ minHeight: '100vh', padding: '2rem' }}
      >
        <motion.div
          className="glass-panel"
          style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔨</div>
            <h1 className="text-display text-gradient-gold" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              HAMMER & GLORY
            </h1>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
              {mode === 'login' ? 'Welcome back, distinguished bidder' : 'Join the auction house'}
            </p>
          </div>

          {/* Tab Toggle */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '1.5rem',
            }}
          >
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="btn"
                style={{
                  padding: '10px',
                  background: mode === m ? 'linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.1))' : 'transparent',
                  color: mode === m ? 'var(--gold-light)' : 'var(--text-secondary)',
                  border: mode === m ? '1px solid var(--border-gold)' : '1px solid transparent',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  borderRadius: '8px',
                }}
              >
                {m === 'login' ? '🔑 Sign In' : '✨ Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="username-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="text-secondary" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Bidder Name
                  </label>
                  <input
                    className="input-field"
                    name="username"
                    placeholder="e.g. darkwolf_88"
                    value={form.username}
                    onChange={handleChange}
                    required={mode === 'register'}
                    minLength={3}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-secondary" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Email
              </label>
              <input
                className="input-field"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="text-secondary" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Password
              </label>
              <input
                className="input-field"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(192,57,43,0.1)',
                  border: '1px solid rgba(192,57,43,0.3)',
                  borderRadius: '8px',
                  color: '#ff6b6b',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="btn btn-gold w-full text-display"
              style={{ marginTop: '0.5rem', letterSpacing: '0.1em' }}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? '⏳ Please wait...' : mode === 'login' ? '🔑 Sign In' : '✨ Create Account'}
            </motion.button>

            {import.meta.env.DEV && (
              <button
                type="button"
                className="btn btn-ghost btn-sm w-full"
                onClick={() => {
                  setUser({ userId: `demo_${Date.now()}`, username: 'DemoBidder', email: 'demo@auction.com', balance: 5000, token: 'demo' });
                  navigate('/lobby');
                }}
                style={{ marginTop: '-0.25rem' }}
              >
                🎮 Quick Demo (No Account)
              </button>
            )}
          </form>

          <p className="text-muted text-center" style={{ marginTop: '1.5rem', fontSize: '0.78rem' }}>
            Starting balance: <span className="text-gold">$5,000 virtual coins</span>
          </p>
        </motion.div>
      </div>
    </VideoBackground>
  );
}
