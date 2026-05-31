// IPLLobby — Create or Join an IPL Auction Room
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useIPLStore } from '../store/iplStore';
import { useUserStore } from '../store/userStore';
import { useIPLSocket } from '../hooks/useIPLSocket';
import { IPL_TEAMS, getTeamById } from '../data/iplTeams';

function TeamPill({ teamId, username }) {
  const team = getTeamById(teamId);
  if (!team) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      background: `${team.primaryColor}15`,
      border: `1px solid ${team.primaryColor}40`,
      borderRadius: '10px',
      padding: '8px 14px',
    }}>
      <span style={{ fontSize: '1.2rem' }}>{team.emoji}</span>
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f5f0e8' }}>{team.shortName}</div>
        <div style={{ fontSize: '0.68rem', color: 'rgba(245,240,232,0.45)' }}>{username}</div>
      </div>
    </div>
  );
}

function AvailableTeamPill({ teamId, taken }) {
  const team = getTeamById(teamId);
  if (!team) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      background: taken ? 'rgba(255,255,255,0.03)' : `${team.primaryColor}10`,
      border: `1px solid ${taken ? 'rgba(255,255,255,0.06)' : team.primaryColor + '30'}`,
      borderRadius: '8px',
      padding: '6px 10px',
      opacity: taken ? 0.4 : 1,
    }}>
      <span style={{ fontSize: '0.9rem' }}>{team.emoji}</span>
      <span style={{ fontSize: '0.72rem', color: taken ? 'rgba(255,255,255,0.3)' : '#f5f0e8', fontWeight: 600 }}>
        {team.shortName}
      </span>
      {taken && <span style={{ fontSize: '0.6rem', color: '#ff6b6b' }}>✕</span>}
    </div>
  );
}

export default function IPLLobby() {
  const navigate = useNavigate();
  const { username, userId } = useUserStore();
  const { roomCode, roomStatus, teams, myTeamId, isHost } = useIPLStore();
  const { createRoom, joinRoom, startAuction, getState } = useIPLSocket();

  const [tab, setTab] = useState('create'); // 'create' | 'join'
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const myTeam = getTeamById(myTeamId);
  const takenTeams = Object.keys(teams);
  const availableTeams = IPL_TEAMS.filter(t => !takenTeams.includes(t.id));
  const teamEntries = Object.entries(teams);
  const canStart = isHost && teamEntries.length >= 2;

  // Navigate to auction room once started
  useEffect(() => {
    if (roomStatus === 'auction' && roomCode) {
      navigate(`/ipl/room/${roomCode}`);
    }
    if (roomStatus === 'complete' && roomCode) {
      navigate(`/ipl/results/${roomCode}`);
    }
  }, [roomStatus, roomCode]);

  // Redirect back if no team selected
  useEffect(() => {
    if (!myTeamId) navigate('/ipl');
  }, [myTeamId]);

  // Refresh state periodically in lobby
  useEffect(() => {
    if (!roomCode) return;
    const interval = setInterval(() => getState(roomCode), 3000);
    return () => clearInterval(interval);
  }, [roomCode]);

  const handleCreate = () => {
    if (!myTeamId || !username) return;
    setIsCreating(true);
    setError('');
    createRoom(myTeamId, username);
    setTimeout(() => setIsCreating(false), 2000);
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length < 4) { setError('Enter a valid room code'); return; }
    setIsJoining(true);
    setError('');
    joinRoom(code, myTeamId, username);
    setTimeout(() => setIsJoining(false), 2000);
  };

  const handleStart = () => {
    if (!canStart) return;
    startAuction(roomCode);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, #0D1B2A 0%, #050508 70%)',
      padding: '2rem',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '2rem', maxWidth: '900px', margin: '0 auto 2rem',
        }}
      >
        <button
          onClick={() => navigate('/ipl')}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', padding: '8px 16px', cursor: 'pointer',
            color: 'rgba(245,240,232,0.7)', fontSize: '0.85rem',
          }}
        >
          ← Back
        </button>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-impact, Impact)',
            fontSize: '1.8rem', letterSpacing: '0.1em',
            background: 'linear-gradient(135deg, #D4A843, #FFD700)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            🏏 AUCTION LOBBY
          </h1>
          {myTeam && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '1rem' }}>{myTeam.emoji}</span>
              <span style={{ fontSize: '0.82rem', color: myTeam.primaryColor, fontWeight: 700 }}>
                {myTeam.name}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(245,240,232,0.4)' }}>· ₹100 Cr purse</span>
            </div>
          )}
        </div>

        <div style={{ width: '80px' }} />
      </motion.div>

      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* LEFT: Create / Join */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: 'rgba(12,12,18,0.95)',
            border: '1px solid rgba(212,168,67,0.2)',
            borderRadius: '24px',
            padding: '1.75rem',
          }}
        >
          {/* In a room already */}
          {roomCode ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏠</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#f5f0e8', marginBottom: '4px' }}>
                  Room Created!
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'rgba(245,240,232,0.5)' }}>
                  Share this code with friends
                </p>
              </div>

              {/* Room code display */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(212,168,67,0.12), rgba(212,168,67,0.05))',
                border: '2px solid rgba(212,168,67,0.4)',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'center',
                marginBottom: '1.25rem',
                cursor: 'pointer',
              }}
                onClick={() => navigator.clipboard?.writeText(roomCode)}
                title="Click to copy"
              >
                <div style={{ fontSize: '0.68rem', color: 'rgba(212,168,67,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
                  Room Code (click to copy)
                </div>
                <div style={{
                  fontFamily: 'var(--font-impact, Impact)',
                  fontSize: '2.5rem',
                  letterSpacing: '0.2em',
                  color: '#D4A843',
                  textShadow: '0 0 20px rgba(212,168,67,0.4)',
                }}>
                  {roomCode}
                </div>
              </div>

              {/* Start button */}
              {isHost && (
                <motion.button
                  onClick={handleStart}
                  disabled={!canStart}
                  whileHover={canStart ? { scale: 1.03 } : {}}
                  whileTap={canStart ? { scale: 0.97 } : {}}
                  style={{
                    width: '100%',
                    background: canStart
                      ? 'linear-gradient(135deg, #D4A843, #B8860B)'
                      : 'rgba(255,255,255,0.05)',
                    color: canStart ? '#1a1000' : 'rgba(255,255,255,0.25)',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '15px',
                    cursor: canStart ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--font-impact, Impact)',
                    fontSize: '1.1rem',
                    letterSpacing: '0.1em',
                    marginBottom: '8px',
                  }}
                >
                  {canStart ? '🔨 START AUCTION' : `Waiting for players... (${teamEntries.length}/2 min)`}
                </motion.button>
              )}
              {!isHost && (
                <div style={{
                  textAlign: 'center', color: 'rgba(245,240,232,0.4)',
                  fontSize: '0.82rem', padding: '12px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                }}>
                  ⏳ Waiting for host to start the auction...
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Tab switcher */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '12px', padding: '4px', marginBottom: '1.5rem',
              }}>
                {[['create', '🏗️ Create Room'], ['join', '🔗 Join Room']].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setTab(key); setError(''); }}
                    style={{
                      background: tab === key ? 'rgba(212,168,67,0.15)' : 'transparent',
                      border: tab === key ? '1px solid rgba(212,168,67,0.3)' : '1px solid transparent',
                      color: tab === key ? '#D4A843' : 'rgba(245,240,232,0.45)',
                      borderRadius: '9px', padding: '9px 6px',
                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === 'create' && (
                  <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏗️</div>
                      <p style={{ color: 'rgba(245,240,232,0.55)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        Create a private auction room and invite friends with the room code. You'll be the host.
                      </p>
                    </div>

                    {error && <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <motion.button
                      onClick={handleCreate}
                      disabled={isCreating}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #D4A843, #B8860B)',
                        color: '#1a1000', border: 'none',
                        borderRadius: '14px', padding: '15px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-impact, Impact)',
                        fontSize: '1.1rem', letterSpacing: '0.1em',
                        opacity: isCreating ? 0.7 : 1,
                      }}
                    >
                      {isCreating ? '⏳ Creating...' : '🏗️ CREATE PRIVATE ROOM'}
                    </motion.button>
                  </motion.div>
                )}

                {tab === 'join' && (
                  <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔗</div>
                      <p style={{ color: 'rgba(245,240,232,0.55)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        Got a code from a friend? Enter it below to join their auction.
                      </p>
                    </div>

                    {error && <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginBottom: '0.75rem', textAlign: 'center' }}>{error}</div>}

                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                      placeholder="IPL-XXXX"
                      maxLength={8}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(212,168,67,0.3)',
                        borderRadius: '14px', padding: '14px 18px',
                        color: '#f5f0e8', fontSize: '1.3rem',
                        fontFamily: 'var(--font-impact, Impact)',
                        outline: 'none', marginBottom: '1rem',
                        textAlign: 'center', letterSpacing: '0.2em',
                        boxSizing: 'border-box',
                      }}
                    />
                    <motion.button
                      onClick={handleJoin}
                      disabled={isJoining || !joinCode.trim()}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: '100%',
                        background: joinCode.trim() ? 'linear-gradient(135deg, #D4A843, #B8860B)' : 'rgba(255,255,255,0.05)',
                        color: joinCode.trim() ? '#1a1000' : 'rgba(255,255,255,0.2)',
                        border: 'none', borderRadius: '14px', padding: '15px',
                        cursor: joinCode.trim() ? 'pointer' : 'not-allowed',
                        fontFamily: 'var(--font-impact, Impact)',
                        fontSize: '1.1rem', letterSpacing: '0.1em',
                        opacity: isJoining ? 0.7 : 1,
                      }}
                    >
                      {isJoining ? '⏳ Joining...' : '🔗 JOIN AUCTION'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* RIGHT: Teams in room */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: 'rgba(12,12,18,0.95)',
            border: '1px solid rgba(212,168,67,0.2)',
            borderRadius: '24px',
            padding: '1.75rem',
          }}
        >
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '1rem',
            color: '#f5f0e8', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            👥 Teams in Room
            <span style={{
              background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)',
              borderRadius: '999px', padding: '2px 10px',
              fontSize: '0.72rem', color: '#D4A843',
            }}>
              {teamEntries.length}/10
            </span>
          </h3>

          {/* Joined teams */}
          {teamEntries.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '2rem',
              color: 'rgba(245,240,232,0.3)', fontSize: '0.85rem',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏟️</div>
              No teams yet. Create or join a room.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {teamEntries.map(([teamId, teamData]) => (
                <motion.div
                  key={teamId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <TeamPill teamId={teamId} username={teamData.username} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Available teams */}
          {teamEntries.length > 0 && (
            <>
              <div style={{
                fontSize: '0.7rem', color: 'rgba(245,240,232,0.3)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: '0.75rem',
              }}>
                Available Teams
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {IPL_TEAMS.map(team => (
                  <AvailableTeamPill
                    key={team.id}
                    teamId={team.id}
                    taken={takenTeams.includes(team.id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Room info panel */}
          {roomCode && (
            <div style={{
              marginTop: '1.5rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '14px', padding: '1rem',
              fontSize: '0.78rem', color: 'rgba(245,240,232,0.45)',
              lineHeight: 1.8,
            }}>
              <div>📦 Starting Purse: <strong style={{ color: '#D4A843' }}>₹100 Cr</strong> per team</div>
              <div>👥 Players to bid: <strong style={{ color: '#f5f0e8' }}>80</strong></div>
              <div>⏱️ Timer per player: <strong style={{ color: '#f5f0e8' }}>30 seconds</strong></div>
              <div>🏏 Minimum raise: <strong style={{ color: '#f5f0e8' }}>₹20 Lakh</strong></div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
