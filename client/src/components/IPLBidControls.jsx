// IPLBidControls — Bidding panel for the IPL auction
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamById } from '../data/iplTeams';

const MIN_INCREMENT = 0.2; // ₹20 Lakh

function formatCrore(val) {
  if (val === undefined || val === null) return '—';
  const v = parseFloat(val);
  if (v >= 1) return `₹${v.toFixed(2)} Cr`;
  return `₹${(v * 100).toFixed(0)} L`;
}

const QUICK_RAISES = [
  { label: '+₹20L', amount: 0.2 },
  { label: '+₹50L', amount: 0.5 },
  { label: '+₹1Cr', amount: 1 },
  { label: '+₹2Cr', amount: 2 },
];

export default function IPLBidControls({
  currentBid = 0,
  basePrice = 0,
  myTeamId,
  currentBidder,
  currentBidderName,
  myPurse = 100,
  timerSeconds = 30,
  onPlaceBid,
  onPass,
  disabled = false,
  teamColor = '#D4A843',
}) {
  const [customBid, setCustomBid] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const minBid = currentBid === 0
    ? basePrice
    : parseFloat((currentBid + MIN_INCREMENT).toFixed(2));

  const isLeading = currentBidder === myTeamId;
  const canAfford = (amount) => amount <= myPurse;

  const handleQuickBid = useCallback((extra) => {
    const amount = currentBid === 0
      ? basePrice
      : parseFloat((currentBid + extra).toFixed(2));
    if (!canAfford(amount)) return;
    onPlaceBid?.(amount);
  }, [currentBid, basePrice, myPurse, onPlaceBid]);

  const handleCustomBid = () => {
    const amount = parseFloat(customBid);
    if (isNaN(amount) || amount < minBid) return;
    if (!canAfford(amount)) return;
    onPlaceBid?.(amount);
    setCustomBid('');
    setIsCustom(false);
  };

  const urgentColor = timerSeconds <= 10 ? '#ff4444'
    : timerSeconds <= 20 ? '#ff8800'
    : teamColor;

  return (
    <div style={{
      background: 'rgba(10,10,14,0.95)',
      border: `1px solid ${teamColor}30`,
      borderRadius: '20px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {/* Current bid display */}
      <div style={{
        textAlign: 'center',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '14px',
        padding: '1rem',
        border: isLeading ? `1px solid #27AE6060` : `1px solid rgba(255,255,255,0.06)`,
      }}>
        <div style={{ fontSize: '0.68rem', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>
          Current Bid
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBid}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              fontFamily: 'var(--font-impact, Impact)',
              fontSize: '2.5rem',
              color: urgentColor,
              letterSpacing: '0.04em',
              lineHeight: 1,
              textShadow: `0 0 20px ${urgentColor}60`,
            }}
          >
            {currentBid === 0 ? formatCrore(basePrice) : formatCrore(currentBid)}
          </motion.div>
        </AnimatePresence>

        {/* Leading bidder */}
        {currentBidder && (
          <div style={{
            marginTop: '6px',
            fontSize: '0.78rem',
            color: isLeading ? '#5dca85' : 'rgba(245,240,232,0.5)',
            fontWeight: 600,
          }}>
            {isLeading ? '👑 You are leading!' : `⚡ ${currentBidderName} is leading`}
          </div>
        )}
        {!currentBidder && (
          <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'rgba(245,240,232,0.4)' }}>
            No bids yet — be the first!
          </div>
        )}
      </div>

      {/* Purse indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0 4px' }}>
        <span style={{ color: 'rgba(245,240,232,0.5)' }}>Your Purse</span>
        <span style={{ color: myPurse < 10 ? '#ff6b6b' : teamColor, fontWeight: 700 }}>
          ₹{myPurse.toFixed(2)} Cr remaining
        </span>
      </div>

      {/* Quick bid buttons */}
      {!disabled && !isLeading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* Base/min bid */}
          <motion.button
            onClick={() => onPlaceBid?.(minBid)}
            disabled={!canAfford(minBid)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              gridColumn: '1/-1',
              background: `linear-gradient(135deg, ${teamColor}25 0%, ${teamColor}10 100%)`,
              border: `2px solid ${teamColor}60`,
              borderRadius: '14px',
              padding: '14px',
              color: canAfford(minBid) ? teamColor : 'rgba(255,255,255,0.2)',
              cursor: canAfford(minBid) ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-impact, Impact)',
              fontSize: '1.2rem',
              letterSpacing: '0.06em',
              transition: 'all 0.2s ease',
              opacity: canAfford(minBid) ? 1 : 0.4,
            }}
          >
            🔨 BID {formatCrore(minBid)}
          </motion.button>

          {QUICK_RAISES.map(({ label, amount }) => {
            const bidAmount = parseFloat((currentBid + amount).toFixed(2));
            const affordable = canAfford(bidAmount);
            return (
              <motion.button
                key={label}
                onClick={() => affordable && onPlaceBid?.(bidAmount)}
                whileHover={affordable ? { scale: 1.04 } : {}}
                whileTap={affordable ? { scale: 0.96 } : {}}
                style={{
                  background: affordable ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '10px',
                  color: affordable ? '#f5f0e8' : 'rgba(255,255,255,0.2)',
                  cursor: affordable ? 'pointer' : 'not-allowed',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  opacity: affordable ? 1 : 0.35,
                  transition: 'all 0.2s ease',
                }}
              >
                {label}
                {affordable && (
                  <div style={{ fontSize: '0.68rem', color: teamColor, marginTop: '2px' }}>
                    → {formatCrore(bidAmount)}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Custom bid */}
      {!disabled && !isLeading && (
        <div>
          {isCustom ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                step="0.1"
                min={minBid}
                max={myPurse}
                value={customBid}
                onChange={(e) => setCustomBid(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomBid()}
                placeholder={`Min: ${minBid} Cr`}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px', padding: '10px 14px',
                  color: '#f5f0e8', fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCustomBid}
                style={{
                  background: teamColor, color: '#1a1000',
                  border: 'none', borderRadius: '10px',
                  padding: '10px 16px', cursor: 'pointer',
                  fontWeight: 800, fontSize: '0.82rem',
                }}
              >
                BID
              </button>
              <button
                onClick={() => { setIsCustom(false); setCustomBid(''); }}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '10px',
                  cursor: 'pointer', color: '#f5f0e8',
                  fontSize: '0.82rem',
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => setIsCustom(true)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '10px',
                  color: 'rgba(245,240,232,0.6)', cursor: 'pointer',
                  fontSize: '0.8rem', transition: 'all 0.2s ease',
                }}
              >
                ✏️ Custom Bid
              </button>
              <button
                onClick={() => onPass?.()}
                style={{
                  background: 'rgba(255,100,100,0.06)',
                  border: '1px solid rgba(255,100,100,0.2)',
                  borderRadius: '12px', padding: '10px',
                  color: 'rgba(255,100,100,0.7)', cursor: 'pointer',
                  fontSize: '0.8rem', transition: 'all 0.2s ease',
                }}
              >
                ✋ Pass
              </button>
            </div>
          )}
        </div>
      )}

      {/* Leading state */}
      {isLeading && !disabled && (
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            background: 'rgba(39,174,96,0.1)',
            border: '1px solid rgba(39,174,96,0.3)',
            borderRadius: '14px',
            padding: '14px',
            textAlign: 'center',
            color: '#5dca85',
            fontWeight: 700,
            fontSize: '0.95rem',
          }}
        >
          👑 You're the highest bidder! <br />
          <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>
            Wait for the hammer to fall...
          </span>
        </motion.div>
      )}

      {/* Disabled state */}
      {disabled && (
        <div style={{
          textAlign: 'center', color: 'rgba(245,240,232,0.35)',
          fontSize: '0.82rem', padding: '8px',
        }}>
          Auction not active
        </div>
      )}
    </div>
  );
}
