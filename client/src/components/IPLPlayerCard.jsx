// IPLPlayerCard — Premium card for IPL player display in auction
import { motion } from 'framer-motion';

const TIER_CONFIG = {
  ICON:      { bg: 'linear-gradient(135deg, #D4A843 0%, #B8860B 100%)', badge: '👑 ICON', text: '#1a1000' },
  PLATINUM:  { bg: 'linear-gradient(135deg, #E8E8F0 0%, #9090C0 100%)', badge: '💎 PLATINUM', text: '#1a1a2e' },
  GOLD:      { bg: 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)', badge: '🥇 GOLD', text: '#1a1000' },
  SILVER:    { bg: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)', badge: '🥈 SILVER', text: '#0a0a0a' },
  CAPPED:    { bg: 'linear-gradient(135deg, #4A90E2 0%, #2C5F8A 100%)', badge: '🏏 CAPPED', text: '#ffffff' },
  UNCAPPED:  { bg: 'linear-gradient(135deg, #27AE60 0%, #1E8449 100%)', badge: '⭐ UNCAPPED', text: '#ffffff' },
};

const ROLE_CONFIG = {
  BAT: { color: '#27AE60', label: 'BATSMAN', icon: '🏏' },
  BWL: { color: '#E74C3C', label: 'BOWLER', icon: '🎳' },
  AR:  { color: '#9B59B6', label: 'ALL-ROUNDER', icon: '⚡' },
  WK:  { color: '#F39C12', label: 'WICKET-KEEPER', icon: '🧤' },
};

function StatItem({ label, value }) {
  return (
    <div style={{ textAlign: 'center', padding: '6px' }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f5f0e8', fontFamily: 'var(--font-impact, Impact)', letterSpacing: '0.04em' }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: '0.62rem', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
        {label}
      </div>
    </div>
  );
}

export default function IPLPlayerCard({ player, isRevealing = false, size = 'lg' }) {
  if (!player) return null;

  const tier = TIER_CONFIG[player.tier] || TIER_CONFIG.CAPPED;
  const role = ROLE_CONFIG[player.role] || ROLE_CONFIG.BAT;
  const isSmall = size === 'sm';
  const isBatsman = player.role === 'BAT' || player.role === 'WK';

  return (
    <motion.div
      initial={isRevealing ? { rotateY: -90, opacity: 0 } : false}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        background: 'rgba(12,12,18,0.95)',
        border: '1px solid rgba(212,168,67,0.3)',
        borderRadius: isSmall ? '16px' : '24px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        width: isSmall ? '200px' : '100%',
        maxWidth: isSmall ? '200px' : '380px',
      }}
    >
      {/* Tier color top bar */}
      <div style={{
        height: isSmall ? '4px' : '6px',
        background: tier.bg,
      }} />

      {/* Main content */}
      <div style={{ padding: isSmall ? '0.75rem' : '1.25rem' }}>
        {/* Top row: tier badge + country */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{
            background: tier.bg,
            color: tier.text,
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '0.62rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
          }}>
            {tier.badge}
          </div>
          <span style={{ fontSize: isSmall ? '1.2rem' : '1.5rem' }}>{player.countryFlag}</span>
        </div>

        {/* Player avatar */}
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <div style={{
            width: isSmall ? '64px' : '90px',
            height: isSmall ? '64px' : '90px',
            borderRadius: '50%',
            margin: '0 auto',
            background: `linear-gradient(135deg, ${role.color}40 0%, ${role.color}15 100%)`,
            border: `3px solid ${role.color}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isSmall ? '2rem' : '2.8rem',
            boxShadow: `0 0 30px ${role.color}30`,
          }}>
            {player.emoji || '🏏'}
          </div>
        </div>

        {/* Name */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display, Playfair Display)',
            fontSize: isSmall ? '0.9rem' : '1.3rem',
            color: '#f5f0e8',
            lineHeight: 1.2,
            marginBottom: '4px',
            fontWeight: 800,
          }}>
            {player.name}
          </h2>
          <div style={{ fontSize: '0.7rem', color: 'rgba(245,240,232,0.5)', letterSpacing: '0.06em' }}>
            {player.country}
          </div>
        </div>

        {/* Role badge */}
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <span style={{
            background: `${role.color}20`,
            border: `1px solid ${role.color}50`,
            color: role.color,
            padding: '4px 14px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}>
            {role.icon} {role.label}
          </span>
        </div>

        {/* Stats grid */}
        {!isSmall && player.stats && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '8px',
            marginBottom: '1rem',
            display: 'grid',
            gridTemplateColumns: isBatsman ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
            gap: '4px',
          }}>
            {isBatsman ? (
              <>
                <StatItem label="Matches" value={player.stats.matches} />
                <StatItem label="Runs" value={player.stats.runs?.toLocaleString()} />
                <StatItem label="Avg" value={player.stats.avg} />
                <StatItem label="SR" value={player.stats.sr} />
              </>
            ) : (
              <>
                <StatItem label="Matches" value={player.stats.matches} />
                <StatItem label="Wickets" value={player.stats.wickets} />
                <StatItem label="Economy" value={player.stats.economy} />
              </>
            )}
          </div>
        )}

        {/* Base price */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(212,168,67,0.15) 0%, rgba(212,168,67,0.05) 100%)',
          border: '1px solid rgba(212,168,67,0.3)',
          borderRadius: '12px',
          padding: '10px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(212,168,67,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>
            Base Price
          </div>
          <div style={{
            fontFamily: 'var(--font-impact, Impact)',
            fontSize: isSmall ? '1.2rem' : '1.8rem',
            color: '#D4A843',
            letterSpacing: '0.04em',
            lineHeight: 1,
          }}>
            ₹{player.basePrice} Cr
          </div>
        </div>

        {/* Description */}
        {!isSmall && player.description && (
          <div style={{
            marginTop: '0.75rem',
            fontSize: '0.75rem',
            color: 'rgba(245,240,232,0.5)',
            lineHeight: 1.5,
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            "{player.description}"
          </div>
        )}

        {/* Previous team */}
        {player.previousTeam && player.previousTeam !== 'N/A' && (
          <div style={{
            marginTop: '0.5rem',
            textAlign: 'center',
            fontSize: '0.68rem',
            color: 'rgba(245,240,232,0.35)',
          }}>
            Previously: {player.previousTeam}
          </div>
        )}
      </div>
    </motion.div>
  );
}
