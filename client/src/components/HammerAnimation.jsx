// HammerAnimation -- SOLD gavel slam + screen shake
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export function triggerConfetti() {
  const duration = 4000;
  const end = Date.now() + duration;

  const colors = ['#d4a843', '#f0c96a', '#ffffff', '#9a7620', '#ffd700'];

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.6 },
      colors,
      startVelocity: 45,
      gravity: 0.6,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.6 },
      colors,
      startVelocity: 45,
      gravity: 0.6,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function HammerAnimation({ show, isWinner }) {
  useEffect(() => {
    if (show && isWinner) {
      setTimeout(triggerConfetti, 800);
    }
  }, [show, isWinner]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Gavel */}
          <motion.div
            style={{ fontSize: '8rem', lineHeight: 1, marginBottom: '1rem', display: 'block' }}
            initial={{ rotate: -60, x: -80, y: -60, scale: 0.5, opacity: 0 }}
            animate={{ rotate: [-60, 10, -5, 0], x: [-80, 10, -3, 0], y: [-60, 20, -5, 0], scale: [0.5, 1.3, 0.95, 1], opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', times: [0, 0.6, 0.8, 1] }}
          >
            {'🔨'}
          </motion.div>

          {/* SOLD text */}
          {isWinner ? (
            <motion.div
              className="text-impact text-gradient-gold"
              style={{ fontSize: 'clamp(5rem, 15vw, 10rem)', lineHeight: 1, letterSpacing: '0.06em' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.15, 0.95, 1], opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              SOLD!
            </motion.div>
          ) : (
            <motion.div
              className="text-impact"
              style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', color: 'var(--text-secondary)', lineHeight: 1 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              SOLD
            </motion.div>
          )}

          {/* Sub message */}
          <motion.div
            style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {isWinner ? 'Congratulations! You won!' : 'Better luck next time'}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
