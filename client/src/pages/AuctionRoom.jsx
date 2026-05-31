// AuctionRoom — MAIN GAME SCREEN
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import VideoBackground from '../components/VideoBackground';
import PriceDisplay from '../components/PriceDisplay';
import CountdownTimer from '../components/CountdownTimer';
import BidInput from '../components/BidInput';
import BidHistory from '../components/BidHistory';
import PlayerList from '../components/PlayerList';
import AuctioneerBot from '../components/AuctioneerBot';
import OutbidAlert from '../components/OutbidAlert';
import HammerAnimation from '../components/HammerAnimation';

import { useAuctionStore } from '../store/auctionStore';
import { useUserStore } from '../store/userStore';
import { useSocket } from '../hooks/useSocket';
import { formatCurrency, getInitials } from '../utils/formatCurrency';

// ── Demo mode: Inject mock auction state ─────────────────────────────
const DEMO_ITEM = {
  name: 'Picasso Sketch — "La Femme" 1932',
  category: 'Art',
  rarity: 'legendary',
  image: '🖼️',
  description: 'A breathtaking charcoal sketch from Picasso\'s golden period, authenticated by the Picasso Administration.',
  estimatedValue: 18000,
  provenance: 'Private collection, Paris, 1978',
};

const DEMO_PLAYERS = [
  { userId: 'bot1', username: 'darkwolf_88', isConnected: true, bidStreak: 3 },
  { userId: 'bot2', username: 'golden_midas', isConnected: true, bidStreak: 0 },
  { userId: 'bot3', username: 'VictoriaA', isConnected: true, bidStreak: 1 },
  { userId: 'bot4', username: 'art_baron', isConnected: true, bidStreak: 0 },
];

function useDemoAuction() {
  const store = useAuctionStore();
  const { userId, username } = useUserStore();

  useEffect(() => {
    // Initialize demo state
    store.setAuctionState({
      auctionId: 'demo-001',
      roomCode: 'HAG-001',
      status: 'bidding',
      currentVideo: 'bidding-calm',
      item: DEMO_ITEM,
      currentPrice: 14200,
      startingPrice: 5000,
      reservePrice: 12000,
      reserveMet: true,
      bidIncrement: 50,
      buyItNowPrice: 20000,
      secondsLeft: 180,
      totalBids: 38,
      leadingBidder: 'bot1',
      leadingBidderName: 'darkwolf_88',
      players: [
        { userId, username: username || 'You', isConnected: true, bidStreak: 0 },
        ...DEMO_PLAYERS,
      ],
      auctioneerName: 'Charles Wellington III',
      bids: [
        { id: 'b1', userId: 'bot1', username: 'darkwolf_88', amount: 14200, timestamp: new Date(Date.now() - 15000), bidType: 'manual' },
        { id: 'b2', userId: 'bot2', username: 'golden_midas', amount: 13800, timestamp: new Date(Date.now() - 45000), bidType: 'manual' },
        { id: 'b3', userId: 'bot3', username: 'VictoriaA', amount: 13400, timestamp: new Date(Date.now() - 80000), bidType: 'proxy' },
        { id: 'b4', userId: 'bot1', username: 'darkwolf_88', amount: 12900, timestamp: new Date(Date.now() - 120000), bidType: 'manual' },
      ],
      messages: [],
    });

    // Simulate timer counting down
    let secs = 180;
    const timer = setInterval(() => {
      secs -= 1;
      if (secs <= 0) { clearInterval(timer); return; }
      store.setAuctionState({ secondsLeft: secs });
      if (secs <= 10) store.setStatus('final');
      else if (secs <= 60) store.setStatus('frenzy');
    }, 1000);

    // Simulate bot bids
    const botBidTimer = setInterval(() => {
      if (Math.random() > 0.65) {
        const bot = DEMO_PLAYERS[Math.floor(Math.random() * DEMO_PLAYERS.length)];
        const currentState = useAuctionStore.getState();
        const newBid = {
          id: `bid-${Date.now()}`,
          userId: bot.userId,
          username: bot.username,
          amount: currentState.currentPrice + 50 + Math.floor(Math.random() * 200),
          timestamp: new Date(),
          bidType: 'manual',
        };
        store.addBid(newBid);
        store.setAuctionState({ priceUpdatedAt: Date.now() });
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(botBidTimer);
    };
  }, []);
}

// ── Chat Panel ────────────────────────────────────────────────────────
function ChatPanel({ onSend }) {
  const { messages } = useAuctionStore();
  const { username } = useUserStore();
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const listRef = useState(null)[0];

  const REACTIONS = ['🔥', '💰', '😮', '👏', '🚀', '💎'];

  const handleSend = () => {
    if (!input.trim()) return;
    onSend?.(input.trim());
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 0' }}>
        {messages.slice(-50).map((msg, i) => (
          <div key={i} className="chat-message">
            {msg.type === 'system' ? (
              <span className="msg-system" style={{ fontSize: '0.78rem', color: 'rgba(212,168,67,0.6)', fontStyle: 'italic' }}>
                ↳ {msg.message}
              </span>
            ) : msg.type === 'auctioneer' ? (
              <span className="msg-auctioneer">
                🎩 <em>{msg.message}</em>
              </span>
            ) : (
              <span className="msg-user">
                <strong style={{ color: 'var(--gold-light)', fontSize: '0.8rem' }}>{msg.username}: </strong>
                {msg.message}
              </span>
            )}
          </div>
        ))}
        {messages.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', padding: '1rem' }}>
            Chat will appear here...
          </div>
        )}
      </div>

      {/* Reactions */}
      <div style={{ display: 'flex', gap: '4px', padding: '6px 0', flexWrap: 'wrap' }}>
        {REACTIONS.map((r) => (
          <button
            key={r}
            onClick={() => onSend?.(`reaction:${r}`)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.transform = 'scale(1.15)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.transform = 'scale(1)'; }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          className="input-field"
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
          placeholder="Say something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          maxLength={120}
        />
        <button
          className="btn btn-ghost"
          style={{ padding: '8px 12px', fontSize: '0.82rem' }}
          onClick={handleSend}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

// ── Main Auction Room ─────────────────────────────────────────────────
export default function AuctionRoom() {
  const { id: auctionId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, userId } = useUserStore();
  const {
    item, status, currentPrice, secondsLeft, reserveMet,
    leadingBidderName, leadingBidder, totalBids, result,
    showExtensionBanner, extensionMessage, currentVideo, auctionId: storeAuctionId,
  } = useAuctionStore();

  const { joinRoom, leaveRoom, placeBid, sendMessage } = useSocket();
  const [showHammer, setShowHammer] = useState(false);
  const [showSidebar, setShowSidebar] = useState('bids'); // 'bids' | 'chat' | 'players'

  // Demo mode — no backend
  useDemoAuction();

  useEffect(() => {
    if (!isLoggedIn) { navigate('/auth'); return; }
    if (auctionId && !import.meta.env.DEV) {
      joinRoom(auctionId);
    }
    return () => {
      if (auctionId && !import.meta.env.DEV) leaveRoom(auctionId);
    };
  }, [auctionId, isLoggedIn]);

  // Show hammer when sold
  useEffect(() => {
    if (status === 'sold' || status === 'passed') {
      setShowHammer(true);
      setTimeout(() => { setShowHammer(false); navigate(`/room/${auctionId}/result`); }, 5000);
    }
  }, [status]);

  const handlePlaceBid = useCallback(async (amount) => {
    // Demo: locally apply bid
    const { addBid, setAuctionState } = useAuctionStore.getState();
    const bid = {
      id: `my-bid-${Date.now()}`,
      userId,
      username: 'You',
      amount,
      timestamp: new Date(),
      bidType: 'manual',
    };
    addBid(bid);
    setAuctionState({ leadingBidder: userId, leadingBidderName: 'You', isLeading: true, myCurrentBid: bid });

    if (!import.meta.env.DEV) {
      placeBid(auctionId, amount);
    }
  }, [auctionId, userId, placeBid]);

  const handleSendMessage = useCallback((msg) => {
    useAuctionStore.getState().addMessage({
      type: 'user',
      userId,
      username: 'You',
      message: msg,
      timestamp: new Date(),
    });
    if (!import.meta.env.DEV) sendMessage(auctionId, msg);
  }, [auctionId, userId, sendMessage]);

  const isLeading = leadingBidder === userId;

  return (
    <>
      <Toaster position="top-right" />
      <OutbidAlert />
      <HammerAnimation show={showHammer} isWinner={result?.winnerId === userId || isLeading} />

      <VideoBackground overlayOpacity={0.55}>
        {/* Extension Banner */}
        <AnimatePresence>
          {showExtensionBanner && (
            <motion.div
              className="extension-banner"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              ⏱️ {extensionMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top bar */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 25,
          background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-gold)',
          padding: '0 1.5rem', height: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/lobby')}
          >
            ← Lobby
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {reserveMet && (
              <motion.span
                className="badge badge-win"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
              >
                ✅ Reserve Met
              </motion.span>
            )}
            <span className="badge badge-live">⚫ LIVE</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--gold)', letterSpacing: '0.08em' }}>
              HAG-001
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leaderboard')}>🏆</button>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div style={{
          paddingTop: '56px', paddingBottom: '70px',
          display: 'grid',
          gridTemplateColumns: '280px 1fr 300px',
          gap: '0',
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
        }} className="auction-room-grid">

          {/* ── LEFT PANEL — Item + Players ──────────────────────── */}
          <div className="glass-panel" style={{
            margin: '12px 0 12px 12px',
            padding: '1.25rem',
            display: 'flex', flexDirection: 'column', gap: '1rem',
            overflowY: 'auto',
          }}>
            {/* Item card */}
            {item && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: '4rem', lineHeight: 1, marginBottom: '0.75rem' }}>
                  {item.image || '🖼️'}
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  {item.category} · {item.rarity}
                </div>
                <h2 className="text-display" style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.75rem' }}>
                  {item.name}
                </h2>

                <div className="gold-divider" />

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, textAlign: 'left', marginTop: '0.5rem' }}>
                  {item.description}
                </div>

                {item.provenance && (
                  <div style={{ marginTop: '0.75rem', padding: '8px 12px', background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    📜 {item.provenance}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Est. Value</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{formatCurrency(item.estimatedValue)}</span>
                </div>
              </motion.div>
            )}

            <div className="gold-divider" />

            {/* Players */}
            <PlayerList />
          </div>

          {/* ── CENTER STAGE ─────────────────────────────────────── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', gap: '1.5rem', position: 'relative',
          }}>
            {/* Leading bidder banner */}
            <AnimatePresence>
              {leadingBidderName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: isLeading ? 'rgba(39,174,96,0.12)' : 'rgba(212,168,67,0.08)',
                    border: `1px solid ${isLeading ? 'rgba(39,174,96,0.3)' : 'rgba(212,168,67,0.25)'}`,
                    borderRadius: '999px',
                    padding: '8px 20px',
                    fontSize: '0.88rem',
                    color: isLeading ? '#5dca85' : 'var(--gold-light)',
                    fontWeight: 600,
                  }}
                >
                  {isLeading ? '👑 You are leading!' : `⚡ ${leadingBidderName} is leading`}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer */}
            <CountdownTimer secondsLeft={secondsLeft} totalSeconds={300} size={140} />

            {/* Current Price — MAIN FOCUS */}
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <PriceDisplay price={currentPrice} label="Current Bid" size="xl" />
              <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {totalBids} bids · {formatCurrency(currentPrice - useAuctionStore.getState().startingPrice)} above start
              </div>
            </div>

            {/* Bid Input */}
            <div className="glass-panel" style={{
              width: '100%', maxWidth: '420px', padding: '1.25rem',
            }}>
              <BidInput onPlaceBid={handlePlaceBid} disabled={status === 'sold' || status === 'passed'} />
            </div>
          </div>

          {/* ── RIGHT PANEL — Bid History + Chat ──────────────────── */}
          <div className="glass-panel" style={{
            margin: '12px 12px 12px 0',
            padding: '1.25rem',
            display: 'flex', flexDirection: 'column',
            overflowY: 'hidden',
          }}>
            {/* Tab switcher */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '3px', marginBottom: '1rem' }}>
              {[['bids', '🔨 Bids'], ['chat', '💬 Chat'], ['players', '👥 All']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setShowSidebar(key)}
                  style={{
                    background: showSidebar === key ? 'rgba(212,168,67,0.15)' : 'transparent',
                    border: showSidebar === key ? '1px solid rgba(212,168,67,0.3)' : '1px solid transparent',
                    color: showSidebar === key ? 'var(--gold-light)' : 'var(--text-secondary)',
                    padding: '7px 4px', cursor: 'pointer', borderRadius: '8px',
                    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {showSidebar === 'bids' && <BidHistory />}
              {showSidebar === 'chat' && <ChatPanel onSend={handleSendMessage} />}
              {showSidebar === 'players' && (
                <div>
                  <PlayerList />
                  <div className="gold-divider" style={{ margin: '1rem 0' }} />
                  <BidHistory />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── AUCTIONEER BAR ────────────────────────────────────── */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 25 }}>
          <AuctioneerBot />
        </div>
      </VideoBackground>
    </>
  );
}
