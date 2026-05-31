// PriceDisplay — animated rolling price counter
import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

function AnimatedNumber({ value, duration = 0.6 }) {
  const spring = useSpring(value, { stiffness: 180, damping: 26 });
  const display = useTransform(spring, (v) =>
    Math.round(v).toLocaleString('en-US')
  );

  useEffect(() => { spring.set(value); }, [value]);

  return <motion.span>{display}</motion.span>;
}

export default function PriceDisplay({ price, label = 'Current Bid', size = 'normal' }) {
  const [flash, setFlash] = useState(false);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price !== prevPrice.current) {
      setFlash(true);
      prevPrice.current = price;
      setTimeout(() => setFlash(false), 800);
    }
  }, [price]);

  const fontSize = size === 'large' ? 'clamp(2.5rem, 6vw, 4.5rem)'
    : size === 'xl' ? 'clamp(3rem, 8vw, 6rem)'
    : 'clamp(1.8rem, 4vw, 3rem)';

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
        {label}
      </div>
      <motion.div
        className="text-impact"
        style={{
          fontSize,
          lineHeight: 1,
          color: flash ? 'var(--gold-light)' : 'var(--text-primary)',
          textShadow: flash ? '0 0 30px rgba(212,168,67,0.6)' : 'none',
          transition: 'color 0.4s ease, text-shadow 0.4s ease',
        }}
        animate={flash ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        $<AnimatedNumber value={price} />
      </motion.div>

      {/* Spark particles on price change */}
      {flash && (
        <div style={{ position: 'absolute', pointerEvents: 'none' }}>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="bid-spark"
              style={{
                left: `${50 + (Math.random() - 0.5) * 80}%`,
                top: `${50 + (Math.random() - 0.5) * 60}%`,
                background: i % 2 === 0 ? 'var(--gold-light)' : 'white',
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0, y: -40 * Math.random() - 20 }}
              transition={{ duration: 0.6 + Math.random() * 0.3 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
