// Auction & IPL REST routes
import express from 'express';
import IPL_PLAYERS, { buildAuctionOrder } from '../data/iplPlayers.js';
import IPL_TEAMS from '../data/iplTeams.js';

const router = express.Router();

// GET /api/auctions — List active auctions (legacy)
router.get('/', (req, res) => {
  res.json({ auctions: [], message: 'Connect via Socket.IO for live data' });
});

// GET /api/auctions/:id — Get single auction (legacy)
router.get('/:id', (req, res) => {
  res.json({ auctionId: req.params.id, message: 'Use socket for real-time state' });
});

// ── IPL Routes ────────────────────────────────────────────────────
// GET /api/auctions/ipl/players
router.get('/ipl/players', (req, res) => {
  const { tier, role } = req.query;
  let players = IPL_PLAYERS;
  if (tier) players = players.filter(p => p.tier === tier.toUpperCase());
  if (role) players = players.filter(p => p.role === role.toUpperCase());
  res.json({ players, total: players.length });
});

// GET /api/auctions/ipl/teams
router.get('/ipl/teams', (req, res) => {
  res.json({ teams: IPL_TEAMS });
});

// GET /api/auctions/ipl/rooms — list open rooms
router.get('/ipl/rooms', (req, res) => {
  // iplRoomManager injected via app.locals
  const manager = req.app.locals.iplRoomManager;
  if (!manager) return res.json({ rooms: [] });
  res.json({ rooms: manager.listOpenRooms() });
});

// GET /api/auctions/ipl/rooms/:code — get room state
router.get('/ipl/rooms/:code', (req, res) => {
  const manager = req.app.locals.iplRoomManager;
  if (!manager) return res.status(503).json({ error: 'Service unavailable' });
  const state = manager.getPublicState(req.params.code);
  if (!state) return res.status(404).json({ error: 'Room not found' });
  res.json({ state });
});

export default router;
