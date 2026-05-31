// PlayerList — who's in the room with bid indicators
import { motion, AnimatePresence } from 'framer-motion';
import { useAuctionStore } from '../store/auctionStore';
import { useUserStore } from '../store/userStore';
import { getInitials } from '../utils/formatCurrency';

export default function PlayerList() {
  const { players, leadingBidder } = useAuctionStore();
  const { userId } = useUserStore();

  return (
    <div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
        Players ({players.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <AnimatePresence>
          {players.map((player) => {
            const isMe = player.userId === userId;
            const isLeading = player.userId === leadingBidder;

            return (
              <motion.div
                key={player.userId}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: isLeading ? 'rgba(212,168,67,0.08)' : isMe ? 'rgba(39,174,96,0.06)' : 'transparent',
                  border: isLeading ? '1px solid rgba(212,168,67,0.2)' : '1px solid transparent',
                }}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="player-avatar"
                  style={{
                    width: '30px', height: '30px', fontSize: '0.68rem',
                    border: isLeading ? '2px solid var(--gold)' : isMe ? '2px solid var(--emerald)' : '1px solid var(--border-glass)',
                    boxShadow: isLeading ? '0 0 10px var(--gold-glow)' : 'none',
                  }}
                >
                  {getInitials(player.username)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: isLeading ? 'var(--gold-light)' : isMe ? '#5dca85' : 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {isMe ? 'You' : player.username}
                  </div>
                  {player.bidStreak >= 3 && (
                    <div style={{ fontSize: '0.65rem', color: '#f39c12' }}>🔥 On fire!</div>
                  )}
                </div>

                {isLeading && (
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontSize: '0.9rem' }}
                  >
                    👑
                  </motion.span>
                )}

                {/* Online dot */}
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: player.isConnected !== false ? 'var(--emerald)' : '#666',
                  boxShadow: player.isConnected !== false ? '0 0 6px var(--emerald-glow)' : 'none',
                }} />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {players.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
            Waiting for players...
          </div>
        )}
      </div>
    </div>
  );
}
