// VideoSlot — Placeholder for IPL auction videos
// When user provides video files, pass `videoSrc` prop and it plays automatically
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CRICKET_ANIMATIONS = [
  { emoji: '🏏', label: 'batting' },
  { emoji: '🎳', label: 'bowling' },
  { emoji: '🏆', label: 'trophy' },
  { emoji: '🔨', label: 'auction' },
];

export default function VideoSlot({
  videoSrc = null,
  phase = 'lobby', // lobby | reveal | bidding | hammer | unsold
  playerName = null,
  teamColor = '#D1AB3E',
  onEnded = null,
  style = {},
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tick, setTick] = useState(0);

  // Auto-play when videoSrc changes
  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.src = videoSrc;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [videoSrc]);

  // Animate placeholder
  useEffect(() => {
    const interval = setInterval(() => setTick(t => (t + 1) % 4), 2000);
    return () => clearInterval(interval);
  }, []);

  const phaseColors = {
    lobby: { from: '#0a1628', to: '#1a2e4a' },
    reveal: { from: '#1a0a2e', to: '#3a1a5e' },
    bidding: { from: '#1a2800', to: '#2e4a00' },
    hammer: { from: '#280000', to: '#5e1a00' },
    unsold: { from: '#1a1a1a', to: '#2a2a2a' },
  };
  const colors = phaseColors[phase] || phaseColors.lobby;

  const phaseLabel = {
    lobby: 'Waiting for auction to start...',
    reveal: playerName ? `🎙️ ${playerName} is up next!` : 'Player being revealed...',
    bidding: '🔥 Live Bidding in Progress!',
    hammer: '🔨 SOLD!',
    unsold: '❌ UNSOLD — Moving On',
  }[phase] || '📺 Live Feed';

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      borderRadius: '20px',
      overflow: 'hidden',
      background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
      border: `2px solid ${teamColor}30`,
      boxShadow: `0 0 40px ${teamColor}20`,
      aspectRatio: '16/9',
      ...style,
    }}>
      {/* Actual video (when provided) */}
      {videoSrc && (
        <video
          ref={videoRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onEnded={onEnded}
          playsInline
          muted={false}
        />
      )}

      {/* Placeholder overlay (shown when no video) */}
      {!videoSrc && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '1rem',
        }}>
          {/* Animated cricket field */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.15 }}>
            {/* Cricket pitch lines */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '60px', height: '160px',
              border: `2px solid ${teamColor}`,
              borderRadius: '4px',
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '200px', height: '200px',
              borderRadius: '50%',
              border: `1px solid ${teamColor}50`,
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '400px', height: '400px',
              borderRadius: '50%',
              border: `1px solid ${teamColor}20`,
            }} />
          </div>

          {/* Main emoji */}
          <motion.div
            key={tick}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            style={{ fontSize: '4rem', lineHeight: 1 }}
          >
            {phase === 'hammer' ? '🔨' :
             phase === 'unsold' ? '❌' :
             phase === 'reveal' ? '🎙️' :
             phase === 'bidding' ? '💰' :
             CRICKET_ANIMATIONS[tick].emoji}
          </motion.div>

          {/* Phase label */}
          <div style={{
            fontFamily: 'var(--font-display, Impact)',
            fontSize: '1.1rem',
            color: teamColor,
            textAlign: 'center',
            letterSpacing: '0.06em',
            textShadow: `0 0 20px ${teamColor}80`,
            padding: '0 1.5rem',
          }}>
            {phaseLabel}
          </div>

          {/* Video placeholder badge */}
          <div style={{
            position: 'absolute', bottom: '12px', right: '12px',
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ color: '#ff4444', fontSize: '0.6rem' }}>⬤</span>
            VIDEO SLOT — Share files to activate
          </div>

          {/* Pulsing border for bidding phase */}
          {phase === 'bidding' && (
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                borderRadius: '18px',
                border: `3px solid ${teamColor}`,
                pointerEvents: 'none',
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      )}

      {/* Scan lines effect for TV feel */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        borderRadius: '18px',
      }} />

      {/* LIVE badge when bidding */}
      {phase === 'bidding' && (
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: '#E53935',
          borderRadius: '6px',
          padding: '3px 10px',
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#fff',
          display: 'flex', alignItems: 'center', gap: '5px',
          letterSpacing: '0.1em',
        }}>
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >●</motion.span>
          LIVE
        </div>
      )}
    </div>
  );
}
