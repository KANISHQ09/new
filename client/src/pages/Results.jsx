// Results page — Winner / Loser screen
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoBackground from '../components/VideoBackground';
import { useAuctionStore } from '../store/auctionStore';
import { useUserStore } from '../store/userStore';
import { formatCurrency } from '../utils/formatCurrency';
import { triggerConfetti } from '../components/HammerAnimation';

export default function Results() {
  const { id: auctionId } = useParams();
  const navigate = useNavigate();
  const { result, item, totalBids, leadingBidderName } = useAuctionStore();
  const { userId } = useUserStore();

  const isWinner = result?.winnerId === userId;
  const finalPrice = result?.finalPrice || 0;

  useEffect(() => {
    if (isWinner) {
      setTimeout(triggerConfetti, 300);
      setTimeout(triggerConfetti, 2000);
    }
  }, [isWinner]);

  return (
    <VideoBackground videoKey={isWinner ? 'sold-winner' : 'loser'} overlayOpacity={isWinner ? 0.45 : 0.6}>
      <div
        className="page-content flex flex-col items-center justify-center"
        style={{ minHeight: '100vh', padding: '2rem', textAlign: 'center' }}
      >
        {isWinner ? (
          <>
            {/* Gavel */}
            <motion.div
              style={{ fontSize: '6rem', marginBottom: '1rem' }}
              animate={{ rotate: [0, -20, 15, -10, 5, 0] }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              🔨
            </motion.div>

            {/* SOLD text */}
            <motion.h1
              className="text-impact text-gradient-gold"
              style={{ fontSize: 'clamp(5rem, 15vw, 10rem)', lineHeight: 1 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.6 }}
            >
              SOLD!
            </motion.h1>

            <motion.div
              className="glass-panel"
              style={{ marginTop: '2rem', padding: '2rem', maxWidth: '480px', width: '100%' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
              <h2 className="text-display text-gradient-gold" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                Congratulations!
              </h2>
              <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                You won <strong style={{ color: 'var(--gold)' }}>{item?.name || 'this item'}</strong>
              </p>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Final Price</span>
                <span className="text-impact text-gold" style={{ fontSize: '2rem' }}>{formatCurrency(finalPrice)}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <span>Total bids: {totalBids}</span>
                <span>Est. value: {formatCurrency(item?.estimatedValue)}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-gold" onClick={() => navigate('/lobby')}>
                  🔨 Next Auction
                </button>
                <button className="btn btn-ghost" onClick={() => navigate('/leaderboard')}>
                  🏆 Leaderboard
                </button>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            {/* Loser screen */}
            <motion.div
              style={{ fontSize: '5rem', marginBottom: '1rem', filter: 'grayscale(0.5)' }}
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🪑
            </motion.div>

            <motion.h1
              className="text-impact"
              style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', color: 'var(--text-secondary)', lineHeight: 1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Better Luck Next Time
            </motion.h1>

            <motion.div
              className="glass-panel"
              style={{ marginTop: '2rem', padding: '1.75rem', maxWidth: '400px', width: '100%' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-secondary" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                {leadingBidderName || 'Another bidder'} won with:
              </p>
              <div className="text-impact text-gold" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
                {formatCurrency(finalPrice)}
              </div>

              <button className="btn btn-gold w-full" onClick={() => navigate('/lobby')}>
                View Upcoming Auctions →
              </button>
            </motion.div>
          </>
        )}
      </div>
    </VideoBackground>
  );
}
