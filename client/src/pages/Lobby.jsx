// Lobby — Browse and join active auctions
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import VideoBackground from '../components/VideoBackground';
import { useUserStore } from '../store/userStore';
import { formatCurrency } from '../utils/formatCurrency';

const DEMO_AUCTIONS = [
  {
    id: 'auction-001', roomCode: 'HAG-001',
    item: { name: 'Picasso Sketch — "La Femme" 1932', category: 'ART', rarity: 'legendary', image: '🖼️', estimatedValue: 18000 },
    status: 'active', currentPrice: 14200, startingPrice: 5000,
    secondsLeft: 124, maxPlayers: 20, playerCount: 11, totalBids: 38,
    auctioneerName: 'Charles Wellington III',
  },
  {
    id: 'auction-002', roomCode: 'HAG-002',
    item: { name: 'Rolex Daytona Stainless Steel 2004', category: 'WATCHES', rarity: 'rare', image: '⌚', estimatedValue: 35000 },
    status: 'active', currentPrice: 31500, startingPrice: 20000,
    secondsLeft: 48, maxPlayers: 15, playerCount: 15, totalBids: 72,
    auctioneerName: 'Victoria Ashworth',
  },
  {
    id: 'auction-003', roomCode: 'HAG-003',
    item: { name: 'Vintage Ferrari 250 Replica Model', category: 'COLLECTIBLES', rarity: 'rare', image: '🏎️', estimatedValue: 9500 },
    status: 'waiting', currentPrice: 0, startingPrice: 2500,
    secondsLeft: 720, maxPlayers: 12, playerCount: 5, totalBids: 0,
    auctioneerName: 'Charles Wellington III',
  },
  {
    id: 'auction-004', roomCode: 'HAG-004',
    item: { name: 'Diamond & Sapphire Necklace — 18ct', category: 'JEWELRY', rarity: 'mythic', image: '💎', estimatedValue: 28000 },
    status: 'active', currentPrice: 22750, startingPrice: 15000,
    secondsLeft: 310, maxPlayers: 20, playerCount: 9, totalBids: 21,
    auctioneerName: 'Victoria Ashworth',
  },
  {
    id: 'auction-005', roomCode: 'HAG-005',
    item: { name: 'First Edition — Shakespeare Folio', category: 'BOOKS', rarity: 'legendary', image: '📖', estimatedValue: 52000 },
    status: 'active', currentPrice: 44000, startingPrice: 30000,
    secondsLeft: 852, maxPlayers: 10, playerCount: 7, totalBids: 15,
    auctioneerName: 'Edmund Hargrove IV',
  },
  {
    id: 'auction-006', roomCode: 'HAG-006',
    item: { name: 'Antique Bourbon Whiskey 1965', category: 'SPIRITS', rarity: 'common', image: '🥃', estimatedValue: 4200 },
    status: 'waiting', currentPrice: 0, startingPrice: 1000,
    secondsLeft: 1800, maxPlayers: 20, playerCount: 3, totalBids: 0,
    auctioneerName: 'Charles Wellington III',
  },
];

const RARITY_COLORS = {
  mythic: { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.4)', text: '#c4b5fd' },
  legendary: { bg: 'rgba(212,168,67,0.15)', border: 'rgba(212,168,67,0.4)', text: '#d4a843' },
  rare: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#93c5fd' },
  common: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', text: '#9ca3af' },
};

function TimerDisplay({ seconds }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const isUrgent = seconds < 60;
  return (
    <span style={{ color: isUrgent ? '#ff6b6b' : 'var(--text-secondary)', fontWeight: 700, fontFamily: 'var(--font-impact)', fontSize: '1.1rem' }}>
      {m}:{s.toString().padStart(2, '0')}
    </span>
  );
}

function AuctionCard({ auction, onJoin, index }) {
  const rarity = RARITY_COLORS[auction.item.rarity] || RARITY_COLORS.common;
  const isActive = auction.status === 'active';

  return (
    <motion.div
      className="glass-card"
      style={{
        padding: '1.5rem',
        cursor: 'pointer',
        border: `1px solid ${rarity.border}`,
        position: 'relative',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ scale: 1.02, borderColor: 'var(--gold)' }}
    >
      {/* Rarity shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${rarity.text}, transparent)`,
      }} />

      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: rarity.text, background: rarity.bg, padding: '3px 10px', borderRadius: '999px', border: `1px solid ${rarity.border}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {auction.item.rarity}
        </div>
        {isActive ? (
          <span className="badge badge-live">⚫ LIVE</span>
        ) : (
          <span className="badge badge-gold">⏰ Soon</span>
        )}
      </div>

      {/* Item display */}
      <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '3rem', lineHeight: 1 }}>{auction.item.image}</div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '4px' }}>
            {auction.item.name}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {auction.item.category}
          </span>
        </div>
      </div>

      {/* Price */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px', marginBottom: '1rem' }}>
        <div className="flex justify-between items-center">
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
              {isActive ? 'Current Bid' : 'Starting Bid'}
            </div>
            <div className="text-impact text-gold" style={{ fontSize: '1.6rem' }}>
              {formatCurrency(isActive ? auction.currentPrice : auction.startingPrice)}
            </div>
          </div>
          <div className="text-right">
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
              Est. Value
            </div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
              {formatCurrency(auction.item.estimatedValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex justify-between items-center" style={{ marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <span>👥 {auction.playerCount}/{auction.maxPlayers}</span>
        <span>🔨 {auction.totalBids} bids</span>
        {isActive && <TimerDisplay seconds={auction.secondsLeft} />}
      </div>

      {/* CTA */}
      <motion.button
        className={`btn w-full ${isActive ? 'btn-gold' : 'btn-ghost'}`}
        style={{ letterSpacing: '0.08em' }}
        onClick={() => onJoin(auction)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        {isActive ? '⚡ Join Auction' : '👀 Watch & Wait'}
      </motion.button>
    </motion.div>
  );
}

export default function Lobby() {
  const navigate = useNavigate();
  const { username, balance, isLoggedIn } = useUserStore();
  const [filter, setFilter] = useState('all');
  const [auctions, setAuctions] = useState(DEMO_AUCTIONS);

  useEffect(() => {
    if (!isLoggedIn) navigate('/auth');
  }, [isLoggedIn]);

  const filtered = filter === 'all' ? auctions
    : filter === 'live' ? auctions.filter((a) => a.status === 'active')
    : auctions.filter((a) => a.status === 'waiting');

  const handleJoin = (auction) => {
    navigate(`/room/${auction.id}`);
  };

  return (
    <VideoBackground videoKey="lobby" overlayOpacity={0.6}>
      <div className="page-content" style={{ minHeight: '100vh', padding: '0' }}>
        {/* Header Bar */}
        <motion.header
          style={{
            background: 'rgba(5,5,5,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-gold)',
            padding: '0 2rem',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            className="text-display text-gradient-gold"
            style={{ fontSize: '1.3rem', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em' }}
            onClick={() => navigate('/')}
          >
            🔨 H&amp;G
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Balance</span>
              <span className="text-impact text-gold" style={{ fontSize: '1.3rem' }}>{formatCurrency(balance)}</span>
            </div>

            <div className="player-avatar" style={{ width: '36px', height: '36px', fontSize: '0.75rem' }}>
              {username?.[0]?.toUpperCase() || '?'}
            </div>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/leaderboard')}
            >
              🏆
            </button>
          </div>
        </motion.header>

        {/* Main content */}
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Page title */}
          <motion.div style={{ marginBottom: '2rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-display" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Active Auctions
            </h1>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
              {auctions.filter((a) => a.status === 'active').length} live now · {auctions.filter((a) => a.status === 'waiting').length} starting soon
            </p>
          </motion.div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            {[['all', 'All'], ['live', '🔴 Live'], ['waiting', '⏰ Soon']].map(([key, label]) => (
              <button
                key={key}
                className="btn btn-sm"
                style={{
                  background: filter === key ? 'linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.1))' : 'rgba(255,255,255,0.04)',
                  color: filter === key ? 'var(--gold-light)' : 'var(--text-secondary)',
                  border: filter === key ? '1px solid var(--border-gold)' : '1px solid rgba(255,255,255,0.08)',
                }}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Auction grid */}
          <AnimatePresence mode="wait">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {filtered.map((auction, i) => (
                <AuctionCard key={auction.id} auction={auction} onJoin={handleJoin} index={i} />
              ))}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </VideoBackground>
  );
}
