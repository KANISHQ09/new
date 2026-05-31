// OutbidAlert — fullscreen flash when outbid
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuctionStore } from '../store/auctionStore';
import { formatCurrency } from '../utils/formatCurrency';

export default function OutbidAlert() {
  const { showOutbidAlert, currentPrice, outbidBy } = useAuctionStore();

  return (
    <AnimatePresence>
      {showOutbidAlert && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Red border flash */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              border: '6px solid var(--crimson)',
              background: 'rgba(192,57,43,0.12)',
            }}
            animate={{
              opacity: [0, 1, 0.5, 1, 0],
              borderWidth: ['6px', '8px', '6px', '8px', '6px'],
            }}
            transition={{ duration: 0.6 }}
          />

          {/* Center badge */}
          <motion.div
            style={{
              background: 'rgba(15,0,0,0.92)',
              border: '2px solid var(--crimson)',
              borderRadius: '16px',
              padding: '1.5rem 2.5rem',
              textAlign: 'center',
              backdropFilter: 'blur(20px)',
            }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: [0.7, 1.1, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>😤</div>
            <div style={{
              fontFamily: 'var(--font-impact)',
              fontSize: '2rem',
              color: '#ff6b6b',
              letterSpacing: '0.08em',
            }}>
              OUTBID!
            </div>
            {outbidBy && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
                by <strong style={{ color: '#ff6b6b' }}>{outbidBy}</strong>
              </div>
            )}
            <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-impact)', fontSize: '1.4rem', marginTop: '8px' }}>
              New: {formatCurrency(currentPrice)}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
