// IPLHammer — Sold/Unsold animation overlay
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamById } from '../data/iplTeams';

function formatCrore(val) {
  if (!val && val !== 0) return '—';
  const v = parseFloat(val);
  return `₹${v.toFixed(2)} Cr`;
}

export default function IPLHammer({ show, data }) {
  if (!data) return null;

  const isSold = data.type === 'sold';
  const team = isSold ? getTeamById(data.teamId) : null;
  const teamColor = team?.primaryColor || '#D4A843';
  const teamGradient = team?.gradient || 'linear-gradient(135deg, #1a1000, #3a2800)';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.3, y: 60 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.3, y: 60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              textAlign: 'center',
              padding: '3rem 4rem',
              background: isSold ? teamGradient : 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
              border: `3px solid ${isSold ? teamColor : '#555'}`,
              borderRadius: '32px',
              boxShadow: `0 40px 120px ${isSold ? teamColor : '#000'}60`,
              maxWidth: '500px',
              width: '90vw',
            }}
          >
            {/* Hammer animation */}
            <motion.div
              initial={{ rotate: -45, y: -50 }}
              animate={{ rotate: 0, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
              style={{ fontSize: '5rem', marginBottom: '1rem', display: 'block' }}
            >
              {isSold ? '🔨' : '❌'}
            </motion.div>

            {/* Sold/Unsold label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontFamily: 'var(--font-impact, Impact)',
                fontSize: '3rem',
                letterSpacing: '0.1em',
                color: isSold ? '#ffffff' : '#888',
                textShadow: isSold ? `0 0 40px ${teamColor}` : 'none',
                marginBottom: '0.5rem',
              }}
            >
              {isSold ? 'SOLD!' : 'UNSOLD'}
            </motion.div>

            {/* Player name */}
            {data.player && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontFamily: 'var(--font-display, Playfair Display)',
                  fontSize: '1.4rem',
                  color: isSold ? teamColor : '#aaa',
                  marginBottom: '1rem',
                }}
              >
                {data.player.name}
              </motion.div>
            )}

            {/* Sold details */}
            {isSold && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '16px',
                  padding: '1rem 1.5rem',
                  marginBottom: '0.75rem',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    Sold to
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                    {team?.emoji || '🏏'} {data.teamName}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '16px',
                  padding: '0.75rem 1.5rem',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    Final Price
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-impact, Impact)',
                    fontSize: '2.5rem',
                    color: teamColor,
                    letterSpacing: '0.06em',
                    textShadow: `0 0 20px ${teamColor}80`,
                  }}>
                    {formatCrore(data.price)}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Confetti particles for sold */}
            {isSold && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    animate={{
                      opacity: 0,
                      x: (Math.random() - 0.5) * 300,
                      y: Math.random() * -200 - 50,
                      scale: 0,
                      rotate: Math.random() * 360,
                    }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 1.2 }}
                    style={{
                      position: 'absolute',
                      top: '50%', left: '50%',
                      width: '12px', height: '12px',
                      background: [teamColor, '#FFD700', '#fff'][i % 3],
                      borderRadius: i % 2 ? '50%' : '2px',
                      pointerEvents: 'none',
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
