// CountdownTimer — animated circular SVG timer
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '../utils/formatCurrency';

const SIZE = 120;
const STROKE = 6;
const RADIUS = (SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CountdownTimer({ secondsLeft, totalSeconds = 300, size = 120 }) {
  const strokeSize = STROKE;
  const r = (size - strokeSize * 2) / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const dashOffset = circ * (1 - progress);

  const isRed = secondsLeft <= 10;
  const isOrange = secondsLeft <= 30 && secondsLeft > 10;

  const strokeColor = isRed
    ? '#e74c3c'
    : isOrange
    ? '#f39c12'
    : 'var(--gold)';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeSize}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeSize}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{
            filter: `drop-shadow(0 0 6px ${strokeColor})`,
            transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
          }}
        />
      </svg>

      {/* Center text */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div
          className="text-impact"
          style={{
            fontSize: size * 0.22,
            color: isRed ? '#e74c3c' : 'var(--text-primary)',
            lineHeight: 1.1,
            textShadow: isRed ? '0 0 12px rgba(231,76,60,0.6)' : 'none',
          }}
          animate={isRed ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {formatTime(secondsLeft)}
        </motion.div>
        <div style={{ fontSize: size * 0.09, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          left
        </div>
      </div>

      {/* Pulse ring on urgent */}
      {isRed && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: '2px solid rgba(231,76,60,0.4)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  );
}
