// IPL Landing — Team selection page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IPL_TEAMS } from '../data/iplTeams';
import { useUserStore } from '../store/userStore';
import { useIPLStore } from '../store/iplStore';

function TrophyCount({ count }) {
  if (!count) return <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>No titles yet</span>;
  return (
    <span style={{ color: '#D4A843', fontSize: '0.72rem' }}>
      {'🏆'.repeat(Math.min(count, 5))} {count}x Champions
    </span>
  );
}

function TeamCard({ team, selected, onSelect }) {
  return (
    <motion.div
      onClick={() => onSelect(team.id)}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: selected
          ? `${team.gradient}, rgba(0,0,0,0.3)`
          : 'rgba(15,15,22,0.9)',
        border: selected
          ? `2px solid ${team.primaryColor}`
          : '2px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        padding: '1.25rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.3s ease',
        boxShadow: selected ? `0 0 30px ${team.primaryColor}60, 0 8px 32px rgba(0,0,0,0.4)` : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Glow bar on top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: selected ? team.gradient : 'transparent',
        transition: 'background 0.3s ease',
      }} />

      {/* Selected check */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '24px', height: '24px',
            background: '#27AE60',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem',
          }}
        >
          ✓
        </motion.div>
      )}

      {/* Team emoji + short name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{
          width: '48px', height: '48px',
          background: selected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem',
          border: `1px solid ${selected ? team.primaryColor + '60' : 'rgba(255,255,255,0.08)'}`,
        }}>
          {team.emoji}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-impact, Impact)',
            fontSize: '1.4rem',
            color: selected ? '#fff' : 'rgba(255,255,255,0.8)',
            letterSpacing: '0.08em',
          }}>
            {team.shortName}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
            {team.city}
          </div>
        </div>
      </div>

      <div style={{
        fontSize: '0.78rem',
        color: selected ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
        lineHeight: 1.4,
        marginBottom: '10px',
        fontWeight: selected ? 600 : 400,
      }}>
        {team.name}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TrophyCount count={team.titles} />
        <span style={{
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.3)',
          fontStyle: 'italic',
        }}>
          "{team.motto}"
        </span>
      </div>
    </motion.div>
  );
}

export default function IPLLanding() {
  const navigate = useNavigate();
  const { username, isLoggedIn, setUser } = useUserStore();
  const iplStore = useIPLStore();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [name, setName] = useState(username || '');
  const [step, setStep] = useState('name'); // name | team

  // Guest login if not logged in
  useEffect(() => {
    if (!isLoggedIn && name) {
      setUser({
        userId: `guest_${Date.now()}`,
        username: name,
        isLoggedIn: true,
        balance: 100,
      });
    }
  }, []);

  const handleNameSubmit = () => {
    if (!name.trim()) return;
    const guestId = `guest_${Date.now()}`;
    setUser({ userId: guestId, username: name.trim(), isLoggedIn: true, balance: 100 });
    iplStore.setMyUserId(guestId);
    setStep('team');
  };

  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId === selectedTeam ? null : teamId);
  };

  const handleContinue = () => {
    if (!selectedTeam) return;
    iplStore.setMyTeam(selectedTeam);
    navigate('/ipl/lobby');
  };

  const selectedTeamData = IPL_TEAMS.find(t => t.id === selectedTeam);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0D1B2A 0%, #050508 60%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Cricket field background pattern */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.04,
        backgroundImage: `
          radial-gradient(ellipse 800px 600px at 50% 120%, #27AE60 0%, transparent 70%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Star particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.1, 0.6, 0.1], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
          style={{
            position: 'fixed',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            borderRadius: '50%',
            background: '#D4A843',
            pointerEvents: 'none',
          }}
        />
      ))}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}
        >
          {/* IPL Logo Area */}
          <div style={{ marginBottom: '1rem' }}>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '4rem', display: 'inline-block' }}
            >
              🏏
            </motion.div>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-impact, Impact)',
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            letterSpacing: '0.12em',
            background: 'linear-gradient(135deg, #D4A843 0%, #FFD700 50%, #D4A843 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}>
            IPL MEGA AUCTION
          </h1>
          <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: '1rem', letterSpacing: '0.06em' }}>
            LIVE MULTIPLAYER · BID FOR YOUR DREAM SQUAD
          </p>
          <div style={{
            margin: '1rem auto 0',
            width: '80px', height: '2px',
            background: 'linear-gradient(90deg, transparent, #D4A843, transparent)',
          }} />
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Enter name */}
          {step === 'name' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'center' }}
            >
              <div style={{
                background: 'rgba(15,15,22,0.95)',
                border: '1px solid rgba(212,168,67,0.25)',
                borderRadius: '24px',
                padding: '2.5rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👤</div>
                <h2 style={{
                  fontFamily: 'var(--font-display, Playfair Display)',
                  fontSize: '1.4rem',
                  color: '#f5f0e8',
                  marginBottom: '0.5rem',
                }}>
                  Who's bidding today?
                </h2>
                <p style={{ color: 'rgba(245,240,232,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Enter your name to continue
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                  placeholder="Your name..."
                  maxLength={20}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(212,168,67,0.3)',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    color: '#f5f0e8',
                    fontSize: '1.1rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    letterSpacing: '0.04em',
                    boxSizing: 'border-box',
                  }}
                />
                <motion.button
                  onClick={handleNameSubmit}
                  disabled={!name.trim()}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%',
                    background: name.trim()
                      ? 'linear-gradient(135deg, #D4A843 0%, #B8860B 100%)'
                      : 'rgba(255,255,255,0.06)',
                    color: name.trim() ? '#1a1000' : 'rgba(255,255,255,0.3)',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '14px',
                    cursor: name.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--font-impact, Impact)',
                    fontSize: '1.1rem',
                    letterSpacing: '0.1em',
                    transition: 'all 0.3s ease',
                  }}
                >
                  ENTER THE AUCTION →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select team */}
          {step === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display, Playfair Display)',
                  fontSize: '1.5rem',
                  color: '#f5f0e8',
                  marginBottom: '0.5rem',
                }}>
                  Welcome, <span style={{ color: '#D4A843' }}>{name}</span>! Choose your franchise
                </h2>
                <p style={{ color: 'rgba(245,240,232,0.4)', fontSize: '0.85rem' }}>
                  You'll bid on behalf of this team · Starting Purse: ₹100 Crore
                </p>
              </div>

              {/* Team grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}>
                {IPL_TEAMS.map((team, i) => (
                  <motion.div key={team.id} transition={{ delay: i * 0.05 }}>
                    <TeamCard
                      team={team}
                      selected={selectedTeam === team.id}
                      onSelect={handleTeamSelect}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Selected team preview + CTA */}
              <AnimatePresence>
                {selectedTeamData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    style={{
                      position: 'sticky',
                      bottom: '1.5rem',
                      background: selectedTeamData.gradient,
                      border: `2px solid ${selectedTeamData.primaryColor}`,
                      borderRadius: '20px',
                      padding: '1.25rem 2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: `0 8px 40px ${selectedTeamData.primaryColor}60`,
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '2rem' }}>{selectedTeamData.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                          {selectedTeamData.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                          Purse: ₹100 Cr · {selectedTeamData.homeGround}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleContinue}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '2px solid rgba(255,255,255,0.4)',
                        color: '#fff',
                        borderRadius: '14px',
                        padding: '12px 28px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-impact, Impact)',
                        fontSize: '1rem',
                        letterSpacing: '0.1em',
                        whiteSpace: 'nowrap',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      ENTER LOBBY →
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
