// BidHistory — live scrolling bid log
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuctionStore } from '../store/auctionStore';
import { useUserStore } from '../store/userStore';
import { formatCurrency, timeAgo, getInitials } from '../utils/formatCurrency';

export default function BidHistory() {
  const { bids, leadingBidder, totalBids } = useAuctionStore();
  const { userId } = useUserStore();
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [bids.length]);

  if (bids.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔨</div>
        <div style={{ fontSize: '0.85rem' }}>No bids yet. Be the first!</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Bid History
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700 }}>
          {totalBids} total
        </span>
      </div>

      {/* List */}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <AnimatePresence initial={false}>
          {bids.map((bid, i) => {
            const isMe = bid.userId === userId;
            const isLeading = bid.userId === leadingBidder && i === 0;

            return (
              <motion.div
                key={bid.id || i}
                className={`bid-history-item ${isLeading ? 'is-winner' : ''} ${isMe && !isLeading ? 'is-me' : ''}`}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Avatar */}
                <div
                  className="player-avatar"
                  style={{
                    width: '30px', height: '30px', fontSize: '0.7rem',
                    border: isLeading ? '2px solid var(--gold)' : '1px solid var(--border-glass)',
                    boxShadow: isLeading ? '0 0 10px var(--gold-glow)' : 'none',
                  }}
                >
                  {getInitials(bid.username)}
                </div>

                {/* Bidder name + amount */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: isMe ? 'var(--emerald)' : isLeading ? 'var(--gold-light)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '90px',
                    }}>
                      {isMe ? 'You' : bid.username}
                    </span>
                    {isLeading && <span style={{ fontSize: '0.65rem', color: 'var(--gold)' }}>👑</span>}
                    {bid.bidType === 'proxy' && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>🤖</span>}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {timeAgo(bid.timestamp)}
                  </div>
                </div>

                {/* Amount */}
                <span className="text-impact" style={{
                  fontSize: '1rem',
                  color: isLeading ? 'var(--gold)' : 'var(--text-primary)',
                }}>
                  {formatCurrency(bid.amount)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
