// VideoBackground component — crossfade between videos based on auction state
import { useRef, useEffect, useState } from 'react';
import { useAuctionStore } from '../store/auctionStore';

// Map video state keys to file paths
const VIDEO_PATHS = {
  'lobby':           '/videos/lobby.mp4',
  'waiting':         '/videos/waiting.mp4',
  'reveal':          '/videos/item-reveal.mp4',
  'bidding-calm':    '/videos/bidding-calm.mp4',
  'bidding-frenzy':  '/videos/bidding-frenzy.mp4',
  'final-countdown': '/videos/final-countdown.mp4',
  'sold-winner':     '/videos/sold-winner.mp4',
  'loser':           '/videos/loser.mp4',
  'leaderboard':     '/videos/leaderboard.mp4',
  'gallery':         '/videos/gallery.mp4',
};

// Fallback gradient if video not available
const FALLBACK_GRADIENTS = {
  'lobby':           'linear-gradient(135deg, #0a0608 0%, #1a0e20 50%, #0a0608 100%)',
  'waiting':         'linear-gradient(135deg, #070512 0%, #120c24 50%, #070512 100%)',
  'reveal':          'linear-gradient(135deg, #0a0800 0%, #1f1400 50%, #0a0800 100%)',
  'bidding-calm':    'linear-gradient(135deg, #04080a 0%, #081420 50%, #04080a 100%)',
  'bidding-frenzy':  'linear-gradient(135deg, #0a0300 0%, #1a0a00 50%, #0a0300 100%)',
  'final-countdown': 'linear-gradient(135deg, #0a0000 0%, #1a0000 50%, #0a0000 100%)',
  'sold-winner':     'linear-gradient(135deg, #050a00 0%, #0e1a00 50%, #050a00 100%)',
  'loser':           'linear-gradient(135deg, #050508 0%, #0a0a0e 50%, #050508 100%)',
  'leaderboard':     'linear-gradient(135deg, #080600 0%, #1a1400 50%, #080600 100%)',
};

export default function VideoBackground({ videoKey, overlayOpacity = 0.45, children }) {
  const storeVideo = useAuctionStore((s) => s.currentVideo);
  const activeVideo = videoKey || storeVideo || 'lobby';
  
  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const [activeSlot, setActiveSlot] = useState('a');
  const [slotA, setSlotA] = useState(activeVideo);
  const [slotB, setSlotB] = useState(null);
  const prevVideoRef = useRef(activeVideo);
  const preloadedRef = useRef({});

  // Preload upcoming video
  const preloadVideo = (src) => {
    if (!src || preloadedRef.current[src]) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = src;
    document.head.appendChild(link);
    preloadedRef.current[src] = true;
  };

  useEffect(() => {
    if (activeVideo === prevVideoRef.current) return;
    prevVideoRef.current = activeVideo;

    const path = VIDEO_PATHS[activeVideo];
    if (path) preloadVideo(path);

    if (activeSlot === 'a') {
      setSlotB(activeVideo);
      setActiveSlot('b');
    } else {
      setSlotA(activeVideo);
      setActiveSlot('a');
    }
  }, [activeVideo]);

  useEffect(() => {
    const vid = activeSlot === 'a' ? videoARef.current : videoBRef.current;
    if (vid) {
      vid.load();
      vid.play().catch(() => {});
    }
    const inactiveVid = activeSlot === 'a' ? videoBRef.current : videoARef.current;
    if (inactiveVid) {
      setTimeout(() => inactiveVid.pause(), 800);
    }
  }, [activeSlot, slotA, slotB]);

  const getPath = (key) => key ? VIDEO_PATHS[key] : null;
  const getFallback = (key) => FALLBACK_GRADIENTS[key] || FALLBACK_GRADIENTS['lobby'];

  return (
    <div className="video-bg-container" style={{ background: getFallback(activeVideo) }}>
      {/* Slot A */}
      {slotA && getPath(slotA) && (
        <video
          ref={videoARef}
          key={`a-${slotA}`}
          className={activeSlot === 'a' ? 'video-active' : 'video-inactive'}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={getPath(slotA)} type="video/mp4" />
        </video>
      )}

      {/* Slot B */}
      {slotB && getPath(slotB) && (
        <video
          ref={videoBRef}
          key={`b-${slotB}`}
          className={activeSlot === 'b' ? 'video-active' : 'video-inactive'}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={getPath(slotB)} type="video/mp4" />
        </video>
      )}

      {/* Gradient overlay */}
      <div
        className="video-overlay"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(5,5,5,${overlayOpacity * 0.7}) 0%,
            rgba(5,5,5,${overlayOpacity * 0.5}) 40%,
            rgba(5,5,5,${overlayOpacity}) 80%,
            rgba(5,5,5,${Math.min(overlayOpacity + 0.3, 1)}) 100%
          )`
        }}
      />

      {children}
    </div>
  );
}
