// AuctioneerBot — animated auctioneer messages bar
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuctionStore } from '../store/auctionStore';

const AUCTIONEER_PHRASES = {
  bidding: [
    "Do I hear higher? Somebody give me a number!",
    "We have {price} on the floor — who'll raise it?",
    "Ladies and gentlemen, {price} is an extraordinary deal for this piece.",
    "I can see interest from all corners of the room!",
    "Going at {price} — someone make your move!",
    "A fine bid of {price}! Can anyone top this magnificent offer?",
  ],
  frenzy: [
    "The room is alive! {price} — we're not done yet!",
    "⚡ The bidding war intensifies! {price} on the block!",
    "Unprecedented excitement here tonight! {price} — and climbing!",
    "This is what we live for! {price}! Who wants to win?",
  ],
  final: [
    "Going once at {price}... anyone?",
    "Going TWICE at {price}... last chance!",
    "This is your final opportunity — {price} going to the highest bidder!",
    "🔨 FAIR WARNING — {price}!",
  ],
  waiting: [
    "Ladies and gentlemen, please take your seats...",
    "We'll begin shortly. Have your paddles ready.",
    "Tonight's item is absolutely extraordinary...",
    "Welcome to Hammer & Glory. An evening to remember.",
  ],
  reveal: [
    "Ladies and gentlemen, prepare yourselves...",
    "What we have here is truly exceptional...",
    "A rare opportunity you will not want to miss...",
  ],
};

function pickPhrase(status, price) {
  const pool = AUCTIONEER_PHRASES[status] || AUCTIONEER_PHRASES.bidding;
  const phrase = pool[Math.floor(Math.random() * pool.length)];
  return phrase.replace('{price}', `$${Math.round(price || 0).toLocaleString()}`);
}

export default function AuctioneerBot() {
  const { auctioneerMessage, auctioneerName, currentPrice, status } = useAuctionStore();
  const [displayMsg, setDisplayMsg] = useState(auctioneerMessage);

  // Rotate phrases every 6 seconds in bidding states
  useEffect(() => {
    if (!['bidding', 'frenzy', 'final', 'waiting', 'reveal'].includes(status)) return;
    const interval = setInterval(() => {
      setDisplayMsg(pickPhrase(status, currentPrice));
    }, 6000);
    return () => clearInterval(interval);
  }, [status, currentPrice]);

  // Always update when server sends a phrase
  useEffect(() => {
    if (auctioneerMessage) setDisplayMsg(auctioneerMessage);
  }, [auctioneerMessage]);

  return (
    <div className="auctioneer-bar">
      {/* Avatar */}
      <motion.div
        className="auctioneer-avatar"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🎩
      </motion.div>

      {/* Message */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="auctioneer-name">{auctioneerName}</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={displayMsg}
            className="auctioneer-message"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
          >
            "{displayMsg}"
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mic icon — pulses when "talking" */}
      <motion.div
        style={{ fontSize: '1.2rem', color: 'var(--gold)', opacity: 0.7 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        🎤
      </motion.div>
    </div>
  );
}
