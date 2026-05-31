// IPLResults — Final squad results after auction completes
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIPLStore } from '../store/iplStore';
import { getTeamById, IPL_TEAMS } from '../data/iplTeams';

const ROLE_ICON = { BAT: '🏏', WK: '🧤', AR: '⚡', BWL: '🎳' };

function formatCr(val) {
  const v = parseFloat(val || 0);
  return `₹${v.toFixed(2)} Cr`;
}

function SquadCard({ teamResult, rank, isMyTeam }) {
  const team = getTeamById(teamResult.teamId);
  const bgGrad = team?.gradient || 'linear-gradient(135deg, #1a1a1a, #2a2a2a)';
  const color = team?.primaryColor || '#D4A843';

  const roleBreakdown = { BAT: [], WK: [], AR: [], BWL: [] };
  teamResult.squad?.forEach(p => {
    if (roleBreakdown[p.role]) roleBreakdown[p.role].push(p);
  });

  const mostExpensive = teamResult.squad?.reduce((best, p) =>
    (p.soldPrice || 0) > (best?.soldPrice || 0) ? p : best, null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      style={{
        background: 'rgba(12,12,18,0.97)',
        border: `2px solid ${isMyTeam ? color : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: isMyTeam ? `0 0 40px ${color}30` : '0 4px 20px rgba(0,0,0,0.4)',
        position: 'relative',
      }}
    >
      {/* Rank badge */}
      {rank <= 2 && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          fontSize: '1.5rem',
        }}>
          {rank === 0 ? '🥇' : '🥈'}
        </div>
      )}

      {/* Team header */}
      <div style={{
        background: bgGrad,
        padding: '1.25rem',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '14px',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.2rem',
        }}>
          {team?.emoji}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-impact, Impact)', fontSize: '1.4rem', color: '#fff', letterSpacing: '0.08em' }}>
            {team?.shortName || teamResult.teamId}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
            {teamResult.username} · {teamResult.squadSize || teamResult.squad?.length || 0} players
          </div>
        </div>
        {isMyTeam && (
          <div style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.2)', borderRadius: '999px',
            padding: '3px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#fff',
          }}>
            YOU
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0.75rem 1.25rem',
        gap: '0',
      }}>
        {[
          ['Purse Spent', formatCr(teamResult.purseSpent)],
          ['Remaining', formatCr(teamResult.purseRemaining)],
          ['Squad', `${teamResult.squad?.length || 0} Players`],
        ].map(([label, value]) => (
          <div key={label} style={{ textAlign: 'center', padding: '4px' }}>
            <div style={{ fontSize: '0.62rem', color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-impact, Impact)', fontSize: '1rem', color: '#D4A843' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Most expensive buy */}
      {mostExpensive && (
        <div style={{
          margin: '0.75rem 1.25rem',
          background: 'rgba(212,168,67,0.08)',
          border: '1px solid rgba(212,168,67,0.2)',
          borderRadius: '10px', padding: '8px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(212,168,67,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Biggest Buy</div>
            <div style={{ fontSize: '0.82rem', color: '#f5f0e8', fontWeight: 700 }}>
              {mostExpensive.emoji} {mostExpensive.name}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-impact, Impact)', fontSize: '1.1rem', color: '#D4A843' }}>
            {formatCr(mostExpensive.soldPrice)}
          </div>
        </div>
      )}

      {/* Player list by role */}
      <div style={{ padding: '0 1.25rem 1.25rem' }}>
        {Object.entries(roleBreakdown).map(([role, players]) => {
          if (!players.length) return null;
          return (
            <div key={role} style={{ marginBottom: '0.75rem' }}>
              <div style={{
                fontSize: '0.65rem', color: 'rgba(245,240,232,0.35)',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px',
              }}>
                {ROLE_ICON[role]} {role === 'BAT' ? 'Batsmen' : role === 'BWL' ? 'Bowlers' : role === 'AR' ? 'All-Rounders' : 'Wicket-Keepers'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {players.map(p => (
                  <div key={p.id} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px', padding: '3px 8px',
                    fontSize: '0.7rem', color: '#f5f0e8',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <span>{p.countryFlag}</span>
                    <span>{p.name}</span>
                    <span style={{ color: '#D4A843', fontSize: '0.65rem' }}>₹{parseFloat(p.soldPrice || 0).toFixed(1)}Cr</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function IPLResults() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { results, myTeamId, teams } = useIPLStore();

  // Sort by purse spent descending (higher spend = more aggressive bidding)
  const sorted = results
    ? [...results].sort((a, b) => (b.purseSpent || 0) - (a.purseSpent || 0))
    : [];

  // Find player of the auction (most expensive)
  const allSold = results?.flatMap(r => r.squad?.map(p => ({ ...p, team: r.teamId, teamName: r.username })) || []) || [];
  const playerOfAuction = allSold.reduce((best, p) => (p.soldPrice > (best?.soldPrice || 0) ? p : best), null);

  // If no results yet, use teams from store
  const displayResults = sorted.length > 0 ? sorted : Object.values(teams).map(t => ({
    teamId: t.teamId,
    username: t.username,
    squad: t.squad || [],
    purseSpent: 100 - (t.purse || 100),
    purseRemaining: t.purse || 100,
    squadSize: t.squad?.length || 0,
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0D1B2A 0%, #050508 60%)',
      padding: '0 0 4rem',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(5,5,8,0.95)',
        borderBottom: '1px solid rgba(212,168,67,0.2)',
        padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => navigate('/ipl')}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '6px 14px',
            color: 'rgba(245,240,232,0.7)', fontSize: '0.8rem', cursor: 'pointer',
          }}
        >
          ← New Auction
        </button>
        <h1 style={{
          fontFamily: 'var(--font-impact, Impact)',
          fontSize: '1.6rem', letterSpacing: '0.12em',
          background: 'linear-gradient(135deg, #D4A843, #FFD700)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          🏆 AUCTION COMPLETE
        </h1>
        <div style={{ width: '80px' }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Player of the Auction */}
        {playerOfAuction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center', marginBottom: '2.5rem',
              background: 'linear-gradient(135deg, rgba(212,168,67,0.12), rgba(212,168,67,0.04))',
              border: '1px solid rgba(212,168,67,0.3)',
              borderRadius: '24px', padding: '1.75rem',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'rgba(212,168,67,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
              🏅 Player of the Auction
            </div>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{playerOfAuction.emoji}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#f5f0e8', fontWeight: 800, marginBottom: '0.25rem' }}>
              {playerOfAuction.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(245,240,232,0.5)', marginBottom: '0.75rem' }}>
              {playerOfAuction.country} · {playerOfAuction.roleLabel}
            </div>
            <div style={{ fontFamily: 'var(--font-impact, Impact)', fontSize: '2.5rem', color: '#D4A843', letterSpacing: '0.06em' }}>
              {formatCr(playerOfAuction.soldPrice)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(245,240,232,0.45)', marginTop: '4px' }}>
              Bought by {playerOfAuction.teamName}
            </div>
          </motion.div>
        )}

        {/* Squad cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}>
          {displayResults.map((teamResult, i) => (
            <SquadCard
              key={teamResult.teamId}
              teamResult={teamResult}
              rank={i}
              isMyTeam={teamResult.teamId === myTeamId}
            />
          ))}
        </div>

        {displayResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(245,240,232,0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
            <div>Auction results not available</div>
            <button
              onClick={() => navigate('/ipl')}
              style={{
                marginTop: '1rem',
                background: 'linear-gradient(135deg, #D4A843, #B8860B)',
                color: '#1a1000', border: 'none', borderRadius: '12px',
                padding: '10px 24px', cursor: 'pointer',
                fontFamily: 'var(--font-impact, Impact)', fontSize: '1rem',
              }}
            >
              Start New Auction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
