// Sound effects system using Howler.js
import { Howl, Howler } from 'howler';

// Master volume control
Howler.volume(0.6);

// Sound registry — initialize lazily on first play
const sounds = {};

const SOUND_MAP = {
  bid:        { src: ['/sounds/bid-placed.mp3'],      volume: 0.5 },
  outbid:     { src: ['/sounds/outbid-alert.mp3'],    volume: 0.8 },
  gavel:      { src: ['/sounds/gavel-slam.mp3'],      volume: 0.9 },
  tick:       { src: ['/sounds/countdown-tick.mp3'],  volume: 0.4 },
  win:        { src: ['/sounds/winner-fanfare.mp3'],  volume: 0.85 },
  coins:      { src: ['/sounds/coins.mp3'],           volume: 0.5 },
  crowd:      { src: ['/sounds/crowd-murmur.mp3'],    volume: 0.2, loop: true },
};

function getSound(name) {
  if (!sounds[name]) {
    const cfg = SOUND_MAP[name];
    if (!cfg) return null;
    sounds[name] = new Howl({ ...cfg });
  }
  return sounds[name];
}

export const SFX = {
  play: (name) => {
    try {
      const s = getSound(name);
      if (s) s.play();
    } catch {}
  },
  
  stop: (name) => {
    try {
      if (sounds[name]) sounds[name].stop();
    } catch {}
  },

  stopAll: () => {
    Object.values(sounds).forEach((s) => {
      try { s.stop(); } catch {}
    });
  },

  setMasterVolume: (vol) => {
    Howler.volume(Math.max(0, Math.min(1, vol)));
  },
};

// Play crowd ambience on bid/frenzy states
export function startCrowdAmbience() { SFX.play('crowd'); }
export function stopCrowdAmbience() { SFX.stop('crowd'); }
