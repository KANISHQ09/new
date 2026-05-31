// HAMMER & GLORY — Auction Game Server (+ IPL Auction)
// Express + Socket.IO real-time backend

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.js';
import auctionRoutes from './routes/auctions.js';
import userRoutes from './routes/users.js';

// Socket handlers
import { registerAuctionHandlers } from './socket/auctionHandler.js';
import { registerRoomHandlers } from './socket/roomHandler.js';
import { registerChatHandlers } from './socket/chatHandler.js';
import { registerIPLHandlers } from './socket/iplHandler.js';

// Services
import { AuctionEngine } from './services/auctionEngine.js';
import { IPLRoomManager } from './services/iplRoomManager.js';

config(); // Load .env

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const allowedOrigins = [
  CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

const checkOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

// ── Express setup ────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: checkOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { error: 'Too many requests' },
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Socket.IO setup ──────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: checkOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

// Auth middleware for socket connections — accept any token (demo mode)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  socket.userId = socket.handshake.query.userId || socket.handshake.auth.userId || `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  next();
});

// Initialize services
const auctionEngine = new AuctionEngine(io);
const iplRoomManager = new IPLRoomManager(io);

// Make iplRoomManager available to routes
app.locals.iplRoomManager = iplRoomManager;

// Register socket event handlers
io.on('connection', (socket) => {
  console.log(`✅ Socket connected: ${socket.id} (user: ${socket.userId})`);

  registerAuctionHandlers(io, socket, auctionEngine);
  registerRoomHandlers(io, socket, auctionEngine);
  registerChatHandlers(io, socket);
  registerIPLHandlers(io, socket, iplRoomManager);

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });

  socket.on('error', (err) => {
    console.error(`Socket error (${socket.id}):`, err.message);
  });
});

// ── Start server ─────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🏏 IPL AUCTION — Server Running       ║
  ║   Port: ${PORT}                              ║
  ║   CORS: ${CORS_ORIGIN}       ║
  ╚══════════════════════════════════════════╝
  `);
});

export { io };
