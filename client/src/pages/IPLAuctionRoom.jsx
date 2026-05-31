// IPLAuctionRoom — Main live auction screen (TV broadcast style)
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { useIPLStore } from '../store/iplStore';
import { useUserStore } from '../store/userStore';
import { useIPLSocket } from '../hooks/useIPLSocket';
import { getTeamById, IPL_TEAMS } from '../data/iplTeams';

import IPLPlayerCard from '../components/IPLPlayerCard';
import IPLBidControls from '../components/IPLBidControls';
import IPLHammer from '../components/IPLHammer';
import VideoSlot from '../components/VideoSlot';

// ── Countdown ring ────────────────────────────────────────────────────
function CountdownRing({ seconds, total = 30 }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const progress = Math.max(0, seconds / total);
  const color = seconds <= 5 ? '#ff4444' : seconds <= 10 ? '#ff8800' : seconds <= 20 ? '#FFD700' : '#27AE60';

  return (
    <div style={{ position: 'relative', width: '88px', height: '88px', flexShrink: 0 }}>
      <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="44" cy="44" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div
          key={seconds}
          initial={{ scale: seconds <= 5 ? 1.4 : 1 }}
          animate={{ scale: 1 }}
          style={{
            fontFamily: 'var(--font-impact, Impact)',
            fontSize: seconds <= 9 ? '1.8rem' : '1.5rem',
            color,
            lineHeight: 1,
            textShadow: seconds <= 5 ? `0 0 15px ${color}` : 'none',
          }}
        >
          {seconds}
        </motion.div>
        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>SEC</div>
      </div>
    </div>
  );
}

// ── Team purse strip (top TV ticker) ─────────────────────────────────
function TeamPurseStrip({ teams, myTeamId }) {
  return (
    <div style={{
      display: 'flex', gap: '0', overflowX: 'auto',
      background: 'rgba(0,0,0,0.9)',
      borderBottom: '1px solid rgba(212,168,67,0.2)',
      scrollbarWidth: 'none',
    }}>
      {Object.values(teams).map(teamData => {
        const team = getTeamById(teamData.teamId);
        if (!team) return null;
        const isMe = teamData.teamId === myTeamId;
        return (
          <div
            key={teamData.teamId}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              background: isMe ? `${team.primaryColor}15` : 'transparent',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {isMe && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
                background: team.primaryColor,
              }} />
            )}
            <span style={{ fontSize: '0.85rem' }}>{team.emoji}</span>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: isMe ? team.primaryColor : '#f5f0e8', letterSpacing: '0.05em' }}>
                {team.shortName}
              </div>
              <div style={{ fontSize: '0.62rem', color: '#D4A843', fontFamily: 'var(--font-impact, Impact)' }}>
                ₹{parseFloat(teamData.purse || 100).toFixed(1)}Cr
              </div>
            </div>
            {teamData.squad && (
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginLeft: '2px' }}>
                {teamData.squad.length}👤
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Sold log sidebar ──────────────────────────────────────────────────
function SoldLog({ soldLog }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [soldLog]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {soldLog.length === 0 && (
        <div style={{ color: 'rgba(245,240,232,0.3)', fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem' }}>
          No players sold yet...
        </div>
      )}
      {[...soldLog].reverse().map((entry, i) => {
        const team = getTeamById(entry.teamId);
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${team?.primaryColor || '#333'}30`,
              borderLeft: `3px solid ${team?.primaryColor || '#D4A843'}`,
              borderRadius: '10px',
              padding: '8px 12px',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f5f0e8', marginBottom: '2px' }}>
              {entry.player?.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: team?.primaryColor || '#D4A843' }}>
                {team?.emoji} {entry.teamName}
              </span>
              <span style={{
                fontFamily: 'var(--font-impact, Impact)',
                fontSize: '0.85rem',
                color: '#D4A843',
              }}>
                ₹{parseFloat(entry.price).toFixed(2)}Cr
              </span>
            </div>
          </motion.div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

// ── My Squad panel ────────────────────────────────────────────────────
function MySquad({ squad, purse, teamId }) {
  const team = getTeamById(teamId);
  const roles = { BAT: 0, WK: 0, AR: 0, BWL: 0 };
  squad?.forEach(p => { if (roles[p.role] !== undefined) roles[p.role]++; });

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Purse summary */}
      <div style={{
        background: `${team?.primaryColor || '#D4A843'}10`,
        border: `1px solid ${team?.primaryColor || '#D4A843'}30`,
        borderRadius: '12px', padding: '10px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(245,240,232,0.5)' }}>Purse Left</span>
          <span style={{ fontFamily: 'var(--font-impact)', fontSize: '1rem', color: '#D4A843' }}>
            ₹{parseFloat(purse || 100).toFixed(2)} Cr
          </span>
        </div>
        {/* Role breakdown */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {Object.entries({ '🏏 BAT': roles.BAT, '🧤 WK': roles.WK, '⚡ AR': roles.AR, '🎳 BWL': roles.BWL }).map(([label, count]) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: '6px',
              padding: '3px 8px', fontSize: '0.65rem', color: 'rgba(245,240,232,0.6)',
            }}>
              {label}: <strong style={{ color: '#f5f0e8' }}>{count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Squad list */}
      {(!squad || squad.length === 0) ? (
        <div style={{ color: 'rgba(245,240,232,0.3)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
          No players acquired yet
        </div>
      ) : (
        squad.map((player, i) => (
          <motion.div
            key={player.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{player.emoji || '🏏'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f5f0e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {player.name}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(245,240,232,0.4)' }}>
                {player.roleLabel}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-impact)', fontSize: '0.78rem', color: '#D4A843', flexShrink: 0 }}>
              ₹{parseFloat(player.soldPrice || 0).toFixed(1)}Cr
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

// ── Auctioneer bar ────────────────────────────────────────────────────
function AuctioneerBar({ message }) {
  return (
    <motion.div
      key={message}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
        background: 'rgba(5,5,8,0.95)',
        borderTop: '1px solid rgba(212,168,67,0.2)',
        backdropFilter: 'blur(20px)',
        padding: '10px 1.5rem',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #D4A843, #B8860B)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', flexShrink: 0,
      }}>
        🎙️
      </div>
      <div style={{
        fontFamily: 'var(--font-display, Playfair Display)',
        fontSize: '0.88rem', color: '#f5f0e8',
        fontStyle: 'italic', flex: 1,
      }}>
        {message}
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAIN AUCTION ROOM
// ══════════════════════════════════════════════════════════════════════
export default function IPLAuctionRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { username, userId } = useUserStore();
  const {
    roomCode, roomStatus, teams, myTeamId, isHost,
    currentPlayer, playerIdx, totalPlayers,
    currentBid, currentBidder, currentBidderName, bidCount,
    timerSeconds, soldLog, auctioneerMessage,
    showHammer, lastHammer,
  } = useIPLStore();
  const { placeBid, pass, getState } = useIPLSocket();

  const [sidePanel, setSidePanel] = useState('sold'); // 'sold' | 'squad'
  const [isRevealing, setIsRevealing] = useState(false);

  const myTeam = getTeamById(myTeamId);
  const myTeamData = teams[myTeamId];
  const myPurse = myTeamData?.purse ?? 100;
  const mySquad = myTeamData?.squad ?? [];
  const teamColor = myTeam?.primaryColor || '#D4A843';

  // Reveal animation trigger on new player
  useEffect(() => {
    if (currentPlayer) {
      setIsRevealing(true);
      setTimeout(() => setIsRevealing(false), 800);
    }
  }, [currentPlayer?.id]);

  // Redirect to results when complete
  useEffect(() => {
    if (roomStatus === 'complete') {
      navigate(`/ipl/results/${roomCode || code}`);
    }
  }, [roomStatus]);

  // Periodic state sync
  useEffect(() => {
    const interval = setInterval(() => getState(code || roomCode), 5000);
    return () => clearInterval(interval);
  }, [code, roomCode]);

  const handlePlaceBid = useCallback((amount) => {
    placeBid(code || roomCode, amount);
  }, [code, roomCode, placeBid]);

  const handlePass = useCallback(() => {
    pass(code || roomCode);
  }, [code, roomCode, pass]);

  // Determine video phase
  const videoPhase = showHammer
    ? (lastHammer?.type === 'sold' ? 'hammer' : 'unsold')
    : currentPlayer
      ? (bidCount > 0 ? 'bidding' : 'reveal')
      : 'lobby';

  // Status color
  const isActive = roomStatus === 'auction';
  const urgentTimer = timerSeconds <= 10;

  return (
    <>
      <Toaster position="top-center" />
      <IPLHammer show={showHammer} data={lastHammer} />

      <div style={{
        height: '100vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: '#06060A',
      }}>
        {/* ── TOP BAR ──────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(5,5,8,0.98)',
          borderBottom: '1px solid rgba(212,168,67,0.2)',
          padding: '0 1rem',
          height: '50px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, zIndex: 20,
        }}>
          <button
            onClick={() => navigate('/ipl/lobby')}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '5px 12px',
              color: 'rgba(245,240,232,0.6)', fontSize: '0.78rem', cursor: 'pointer',
            }}
          >
            ← Lobby
          </button>

          {/* Center: player progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {currentPlayer && (
              <div style={{ fontSize: '0.72rem', color: 'rgba(245,240,232,0.5)' }}>
                Player <span style={{ color: '#D4A843', fontWeight: 700 }}>{playerIdx}</span> / {totalPlayers}
              </div>
            )}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: urgentTimer ? 'rgba(255,68,68,0.1)' : 'rgba(212,168,67,0.1)',
              border: `1px solid ${urgentTimer ? '#ff444440' : 'rgba(212,168,67,0.3)'}`,
              borderRadius: '8px', padding: '4px 12px',
            }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ color: urgentTimer ? '#ff4444' : '#E53935', fontSize: '0.6rem' }}
              >
                ⬤
              </motion.span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f5f0e8', letterSpacing: '0.06em' }}>
                LIVE AUCTION
              </span>
            </div>
            <span style={{
              fontSize: '0.8rem', fontFamily: 'var(--font-impact, Impact)',
              color: '#D4A843', letterSpacing: '0.1em',
            }}>
              {code || roomCode}
            </span>
          </div>

          {/* Right: my team */}
          {myTeam && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1rem' }}>{myTeam.emoji}</span>
              <span style={{ fontSize: '0.75rem', color: teamColor, fontWeight: 700 }}>{myTeam.shortName}</span>
              <span style={{ fontSize: '0.72rem', color: '#D4A843' }}>₹{parseFloat(myPurse).toFixed(1)}Cr</span>
            </div>
          )}
        </div>

        {/* ── TEAM PURSE TICKER ────────────────────────────────── */}
        <div style={{ flexShrink: 0 }}>
          <TeamPurseStrip teams={teams} myTeamId={myTeamId} />
        </div>

        {/* ── MAIN CONTENT GRID ────────────────────────────────── */}
        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '280px 1fr 300px',
          overflow: 'hidden',
          minHeight: 0,
        }}>

          {/* ── LEFT: Video + Bid Controls ─────────────────────── */}
          <div style={{
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column',
            padding: '1rem',
            gap: '1rem',
            overflowY: 'auto',
          }}>
            {/* Video slot */}
            <VideoSlot
              phase={videoPhase}
              playerName={currentPlayer?.name}
              teamColor={teamColor}
            />

            {/* Bid controls */}
            <IPLBidControls
              currentBid={currentBid}
              basePrice={currentPlayer?.basePrice || 0}
              myTeamId={myTeamId}
              currentBidder={currentBidder}
              currentBidderName={currentBidderName}
              myPurse={myPurse}
              timerSeconds={timerSeconds}
              onPlaceBid={handlePlaceBid}
              onPass={handlePass}
              disabled={!isActive || !currentPlayer}
              teamColor={teamColor}
            />
          </div>

          {/* ── CENTER: Player spotlight ────────────────────────── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center',
            padding: '1.5rem 1rem',
            gap: '1.25rem',
            overflowY: 'auto',
            position: 'relative',
          }}>
            {/* Player card */}
            <AnimatePresence mode="wait">
              {currentPlayer ? (
                <motion.div
                  key={currentPlayer.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.5 }}
                >
                  <IPLPlayerCard player={currentPlayer} isRevealing={isRevealing} size="lg" />
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', padding: '3rem 1rem' }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontSize: '4rem', marginBottom: '1rem' }}
                  >
                    🏏
                  </motion.div>
                  <div style={{ color: 'rgba(245,240,232,0.4)', fontSize: '0.9rem' }}>
                    {roomStatus === 'lobby' ? 'Waiting for auction to start...' : 'Loading next player...'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bid amount + Timer row */}
            {currentPlayer && (
              <motion.div
                layout
                style={{
                  width: '100%', maxWidth: '380px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(12,12,18,0.95)',
                  border: `1px solid ${urgentTimer ? '#ff444440' : 'rgba(212,168,67,0.2)'}`,
                  borderRadius: '16px',
                  padding: '0.75rem 1.25rem',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                    Highest Bid
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentBid}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      style={{
                        fontFamily: 'var(--font-impact, Impact)',
                        fontSize: '2rem',
                        color: urgentTimer ? '#ff4444' : '#D4A843',
                        letterSpacing: '0.04em',
                        lineHeight: 1,
                        textShadow: urgentTimer ? '0 0 15px #ff444480' : '0 0 10px rgba(212,168,67,0.4)',
                      }}
                    >
                      {currentBid === 0 ? `₹${currentPlayer.basePrice} Cr` : `₹${parseFloat(currentBid).toFixed(2)} Cr`}
                    </motion.div>
                  </AnimatePresence>
                  {currentBidder && (
                    <div style={{ fontSize: '0.7rem', color: 'rgba(245,240,232,0.45)', marginTop: '2px' }}>
                      {currentBidder === myTeamId ? '👑 You' : `⚡ ${currentBidderName}`}
                    </div>
                  )}
                  <div style={{ fontSize: '0.68rem', color: 'rgba(245,240,232,0.3)' }}>
                    {bidCount} bid{bidCount !== 1 ? 's' : ''}
                  </div>
                </div>

                <CountdownRing seconds={timerSeconds} total={30} />
              </motion.div>
            )}

            {/* Bidding activity pulses */}
            {bidCount > 0 && currentPlayer && (
              <div style={{
                display: 'flex', gap: '4px', alignItems: 'center',
                flexWrap: 'wrap', justifyContent: 'center', maxWidth: '380px',
              }}>
                {Object.values(teams).map(teamData => {
                  const team = getTeamById(teamData.teamId);
                  const isLeading = teamData.teamId === currentBidder;
                  return (
                    <motion.div
                      key={teamData.teamId}
                      animate={isLeading ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isLeading ? Infinity : 0 }}
                      style={{
                        padding: '3px 8px',
                        background: isLeading ? `${team?.primaryColor}25` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isLeading ? team?.primaryColor + '60' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '8px',
                        fontSize: '0.65rem',
                        color: isLeading ? team?.primaryColor : 'rgba(255,255,255,0.3)',
                        fontWeight: isLeading ? 700 : 400,
                      }}
                    >
                      {team?.emoji} {team?.shortName}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: Sold Log + My Squad ─────────────────────── */}
          <div style={{
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column',
            padding: '1rem',
            gap: '1rem',
            minHeight: 0,
          }}>
            {/* Tab switcher */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px', padding: '3px',
              flexShrink: 0,
            }}>
              {[['sold', '🔨 Sold'], ['squad', `👥 My Squad (${mySquad.length})`]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSidePanel(key)}
                  style={{
                    background: sidePanel === key ? 'rgba(212,168,67,0.15)' : 'transparent',
                    border: sidePanel === key ? '1px solid rgba(212,168,67,0.3)' : '1px solid transparent',
                    color: sidePanel === key ? '#D4A843' : 'rgba(245,240,232,0.4)',
                    borderRadius: '9px', padding: '7px 4px',
                    cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              {sidePanel === 'sold' && <SoldLog soldLog={soldLog} />}
              {sidePanel === 'squad' && (
                <MySquad squad={mySquad} purse={myPurse} teamId={myTeamId} />
              )}
            </div>
          </div>
        </div>

        {/* ── AUCTIONEER BAR ───────────────────────────────────── */}
        <AuctioneerBar message={auctioneerMessage} />
      </div>
    </>
  );
}
