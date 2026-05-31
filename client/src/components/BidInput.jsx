// BidInput — bid amount entry and submission
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/formatCurrency';
import { useUserStore } from '../store/userStore';
import { useAuctionStore } from '../store/auctionStore';

const QUICK_INCREMENTS = [25, 50, 100, 250, 500];

export default function BidInput({ onPlaceBid, disabled }) {
  const { balance } = useUserStore();
  const { currentPrice, bidIncrement, buyItNowPrice, status } = useAuctionStore();
  const [bidAmount, setBidAmount] = useState('');
  const [proxyMode, setProxyMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const minBid = currentPrice + bidIncrement;
  const parsedAmount = parseFloat(bidAmount) || 0;
  const isValid = parsedAmount >= minBid && parsedAmount <= balance;

  const handleQuickAdd = (increment) => {
    setBidAmount(String(Math.max(minBid, (parsedAmount || currentPrice) + increment)));
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await onPlaceBid(parsedAmount, proxyMode);
      setBidAmount('');
    } finally {
      setTimeout(() => setSubmitting(false), 1000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const isActive = status === 'bidding' || status === 'frenzy' || status === 'final';

  return (
    <div style={{ width: '100%' }}>
      {/* Proxy toggle */}
      <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Your Bid
        </span>
        <button
          onClick={() => setProxyMode((p) => !p)}
          style={{
            background: proxyMode ? 'rgba(212,168,67,0.15)' : 'rgba(255,255,255,0.04)',
            border: proxyMode ? '1px solid var(--border-gold)' : '1px solid rgba(255,255,255,0.08)',
            color: proxyMode ? 'var(--gold-light)' : 'var(--text-muted)',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600,
          }}
        >
          {proxyMode ? '🤖 Auto-bid ON' : '🤖 Auto-bid'}
        </button>
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--gold)', fontFamily: 'var(--font-impact)', fontSize: '1.1rem',
            pointerEvents: 'none',
          }}>$</span>
          <input
            className="input-field"
            style={{ paddingLeft: '30px', fontFamily: 'var(--font-impact)', fontSize: '1.2rem', color: 'var(--gold-light)' }}
            type="number"
            min={minBid}
            max={balance}
            step={bidIncrement}
            placeholder={minBid.toFixed(0)}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isActive || disabled}
          />
        </div>

        <motion.button
          className="btn btn-gold"
          style={{ padding: '0 20px', fontSize: '0.85rem', letterSpacing: '0.06em', minWidth: '90px' }}
          onClick={handleSubmit}
          disabled={!isValid || submitting || !isActive || disabled}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
        >
          {submitting ? '⏳' : '🔨 BID'}
        </motion.button>
      </div>

      {/* Quick increment buttons */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {QUICK_INCREMENTS.map((inc) => (
          <button
            key={inc}
            className="btn btn-ghost btn-sm"
            style={{ flex: '1', minWidth: '52px', fontSize: '0.78rem' }}
            onClick={() => handleQuickAdd(inc)}
            disabled={!isActive || disabled}
          >
            +{formatCurrency(inc)}
          </button>
        ))}
        <button
          className="btn btn-ghost btn-sm"
          style={{ flex: '1', minWidth: '52px', fontSize: '0.78rem' }}
          onClick={() => setBidAmount(String(minBid))}
          disabled={!isActive || disabled}
        >
          Min
        </button>
      </div>

      {/* Balance + min bid info */}
      <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Min: <span style={{ color: 'var(--gold)' }}>{formatCurrency(minBid)}</span></span>
        <span>Balance: <span style={{ color: parsedAmount > balance ? 'var(--crimson)' : 'var(--emerald)' }}>{formatCurrency(balance)}</span></span>
      </div>

      {/* Buy it now */}
      {buyItNowPrice && isActive && (
        <motion.button
          className="btn btn-crimson w-full"
          style={{ marginTop: '12px', fontSize: '0.88rem', letterSpacing: '0.06em' }}
          onClick={() => onPlaceBid(buyItNowPrice, false, true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          ⚡ Buy It Now — {formatCurrency(buyItNowPrice)}
        </motion.button>
      )}

      {/* Validation feedback */}
      {bidAmount && parsedAmount < minBid && (
        <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--crimson)', textAlign: 'center' }}>
          Minimum bid is {formatCurrency(minBid)}
        </div>
      )}
      {bidAmount && parsedAmount > balance && (
        <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--crimson)', textAlign: 'center' }}>
          Insufficient balance
        </div>
      )}

      {proxyMode && (
        <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          🤖 Auto-bid: system will bid for you up to <strong style={{ color: 'var(--gold)' }}>{formatCurrency(parsedAmount || minBid)}</strong>
        </div>
      )}
    </div>
  );
}
