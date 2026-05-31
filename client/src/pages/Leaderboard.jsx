// Leaderboard page
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoBackground from '../components/VideoBackground';
import { useUserStore } from '../store/userStore';
import { formatCurrency } from '../utils/formatCurrency';

const DEMO_LEADERBOARD = [
  { rank: 1, username: 'The_Sovereign', wins: 47, totalSpent: 284000, reputation: 998, badge: '💎' },
  { rank: 2, username: 'golden_midas', wins: 38, totalSpent: 196500, reputation: 942, badge: '🥇' },
  { rank: 3, username: 'VictoriaAshworth', wins: 31, totalSpent: 158200, reputation: 918, badge: '🥈' },
  { rank: 4, username: 'darkwolf_88', wins: 29, totalSpent: 132000, reputation: 875, badge: '🥉' },
  { rank: 5, username: 'art_baron', wins: 22, totalSpent: 98700, reputation: 832, badge: '🏆' },
  { rank: 6, username: 'CryptoRaider', wins: 18, totalSpent: 76400, reputation: 798, badge: '⚔️' },
  { rank: 7, username: 'PearlDiver', wins: 15, totalSpent: 62100, reputation: 754, badge: '🌊' },
  { rank: 8, username: 'EdmundH', wins: 12, totalSpent: 48900, reputation: 712, badge: '📚' },
  { rank: 9, username: 'MysticBidder', wins: 10, totalSpent: 38500, reputation: 681, badge: '🔮' },
  { rank: 10, username: 'SilverFox', wins: 8, totalSpent: 28000, reputation: 645, badge: '🦊' },
];

const RANK_STYLES = {
  1: { bg: 'linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.08))', border: 'rgba(212,168,67,0.5)', textColor: 'var(--gold-light)', glow: '0 0 20px rgba(212,168,67,0.2)' },
  2: { bg: 'linear-gradient(135deg, rgba(192,196,208,0.15), rgba(192,196,208,0.06))', border: 'rgba(192,196,208,0.4)', textColor: '#c0c4d0', glow: 'none' },
  3: { bg: 'linear-gradient(135deg, rgba(180,100,50,0.15), rgba(180,100,50,0.06))', border: 'rgba(180,100,50,0.4)', textColor: '#cd7f32', glow: 'none' },
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const { username } = useUserStore();

  return (
    <VideoBackground videoKey="leaderboard" overlayOpacity={0.55}>
      <div className="page-content" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <motion.header
          style={{
            background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-gold)', padding: '0 2rem',
            height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 30,
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/lobby')}
          >
            ← Back
          </button>
          <span className="text-display text-gradient-gold" style={{ fontSize: '1.2rem', letterSpacing: '0.1em' }}>
            🏆 Hall of Fame
          </span>
          <div style={{ width: '80px' }} />
        </motion.header>

        {/* Content */}
        <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
          <motion.h1
            className="text-display text-gradient-gold"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', textAlign: 'center', marginBottom: '0.5rem' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Top Bidders
          </motion.h1>
          <motion.p
            className="text-secondary"
            style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            All-time rankings — updated live
          </motion.p>

          {/* Leaderboard entries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DEMO_LEADERBOARD.map((entry, i) => {
              const style = RANK_STYLES[entry.rank] || {};
              const isMe = entry.username === username;

              return (
                <motion.div
                  key={entry.rank}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '44px 44px 1fr auto',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 18px',
                    background: isMe ? 'rgba(39,174,96,0.12)' : style.bg || 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isMe ? 'rgba(39,174,96,0.4)' : style.border || 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '12px',
                    boxShadow: style.glow || 'none',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  {/* Rank */}
                  <div className="text-impact" style={{ fontSize: '1.4rem', color: style.textColor || 'var(--text-muted)', textAlign: 'center' }}>
                    {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
                  </div>

                  {/* Avatar */}
                  <div className="player-avatar" style={{ border: `2px solid ${style.border || 'var(--border-glass)'}` }}>
                    {entry.badge}
                  </div>

                  {/* Name + stats */}
                  <div>
                    <div style={{ fontWeight: 700, color: isMe ? '#5dca85' : style.textColor || 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {isMe ? `${entry.username} (You)` : entry.username}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {entry.wins} wins · Rep: {entry.reputation}
                    </div>
                  </div>

                  {/* Total spent */}
                  <div className="text-right">
                    <div className="text-impact text-gold" style={{ fontSize: '1.1rem' }}>
                      {formatCurrency(entry.totalSpent, true)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>total spent</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            style={{ textAlign: 'center', marginTop: '2.5rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button className="btn btn-gold btn-lg" onClick={() => navigate('/lobby')}>
              🔨 Join an Auction
            </button>
          </motion.div>
        </div>
      </div>
    </VideoBackground>
  );
}
