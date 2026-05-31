// Landing Page — Video-first luxury auction house entrance
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoBackground from '../components/VideoBackground';

const LIVE_TICKERS = [
  { label: 'Picasso Sketch — 1932', price: '$14,200', status: '🔴 LIVE' },
  { label: 'Rolex Daytona — 2004', price: '$32,500', status: '🔴 LIVE' },
  { label: 'Vintage Ferrari Model', price: '$8,900', status: '⏰ Starts in 12m' },
  { label: 'Rare 1st Ed. Shakespeare', price: '$45,000', status: '🔴 LIVE' },
  { label: 'Diamond Necklace — 18ct', price: '$22,750', status: '⏰ Starts in 4m' },
];

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 4,
}));

export default function Landing() {
  const navigate = useNavigate();
  const tickerRef = useRef(null);

  return (
    <VideoBackground videoKey="lobby" overlayOpacity={0.5}>
      {/* Gold Particle System */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: `radial-gradient(circle, rgba(240,201,106,0.9), rgba(212,168,67,0.3))`,
              boxShadow: `0 0 ${p.size * 2}px rgba(212,168,67,0.6)`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div
        className="page-content flex flex-col items-center justify-center"
        style={{ minHeight: '100vh', padding: '2rem', position: 'relative', zIndex: 10 }}
      >
        {/* Logo area */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Gavel icon */}
          <motion.div
            animate={{ rotate: [0, -8, 0, 8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}
          >
            🔨
          </motion.div>

          <h1
            className="text-display text-gradient-gold"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1.05, marginBottom: '0.5rem' }}
          >
            HAMMER
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <div className="gold-divider" style={{ width: '80px' }} />
            <span
              className="text-display"
              style={{ color: 'rgba(212,168,67,0.5)', fontSize: '1.2rem', letterSpacing: '0.3em' }}
            >
              &amp;
            </span>
            <div className="gold-divider" style={{ width: '80px' }} />
          </div>
          <h1
            className="text-display text-gradient-gold"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1.05 }}
          >
            GLORY
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-secondary text-center"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginTop: '1.5rem',
            marginBottom: '3rem',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Where Every Second Counts
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <motion.button
            className="btn btn-gold btn-xl text-display"
            onClick={() => navigate('/lobby')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            style={{ letterSpacing: '0.12em' }}
          >
            ⚡ Enter the Auction
          </motion.button>
          <motion.button
            className="btn btn-ghost btn-lg"
            onClick={() => navigate('/leaderboard')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            🏆 Leaderboard
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          style={{
            display: 'flex',
            gap: '2rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {[
            { label: 'Live Auctions', value: '8' },
            { label: 'Active Bidders', value: '142' },
            { label: 'Items Sold Today', value: '23' },
            { label: 'Total Value', value: '$2.1M' },
          ].map((stat) => (
            <div key={stat.label} className="text-center" style={{ minWidth: '80px' }}>
              <div className="text-impact text-gold" style={{ fontSize: '2rem' }}>{stat.value}</div>
              <div className="text-secondary" style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Live Ticker */}
        <motion.div
          style={{
            width: '100%',
            maxWidth: '900px',
            background: 'rgba(5,5,5,0.8)',
            borderTop: '1px solid rgba(212,168,67,0.3)',
            borderBottom: '1px solid rgba(212,168,67,0.3)',
            padding: '10px 0',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            style={{ display: 'flex', gap: '3rem', whiteSpace: 'nowrap' }}
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          >
            {[...LIVE_TICKERS, ...LIVE_TICKERS].map((item, i) => (
              <span key={i} style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ color: '#ff6b6b', fontWeight: 700 }}>{item.status}</span>
                <span className="text-secondary">{item.label}</span>
                <span className="text-gold" style={{ fontWeight: 700 }}>— {item.price}</span>
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </VideoBackground>
  );
}
