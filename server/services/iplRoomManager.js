// IPL Room Manager — Manages live IPL auction rooms
// In-memory only (no DB). Each room holds teams, purses, squads, player queue.

import { buildAuctionOrder } from '../data/iplPlayers.js';
import { IPL_TEAMS } from '../data/iplTeams.js';

const STARTING_PURSE = 100; // ₹100 Crore per team
const TIMER_SECONDS = 30;   // seconds per player
const MIN_BID_INCREMENT = 0.2; // ₹20 Lakh in Crore units
const MAX_SQUAD_SIZE = 25;
const MIN_OVERSEAS = 4;
const MAX_OVERSEAS = 8;

export class IPLRoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomCode → room
    this.timers = new Map(); // roomCode → timer
    this.userToRoom = new Map(); // userId → roomCode
  }

  // ── Create Room ────────────────────────────────────────────────
  createRoom(hostUserId, hostTeamId, hostUsername) {
    const roomCode = this._generateCode();
    const room = {
      roomCode,
      hostUserId,
      status: 'lobby', // lobby | auction | complete
      createdAt: new Date(),
      
      // Teams in this room: teamId → { userId, username, purse, squad, passed }
      teams: {},
      
      // Player auction queue
      playerQueue: [],
      currentPlayerIdx: 0,
      currentPlayer: null,
      
      // Current bid state
      currentBid: 0,
      currentBidder: null, // teamId
      currentBidderName: null,
      bidCount: 0,
      
      // Sold players log
      soldLog: [], // { player, teamId, price }
      unsoldPlayers: [],
      
      // Timer
      timerSeconds: TIMER_SECONDS,
      timerActive: false,
    };

    // Add host team
    room.teams[hostTeamId] = {
      teamId: hostTeamId,
      userId: hostUserId,
      username: hostUsername,
      purse: STARTING_PURSE,
      squad: [],
      isHost: true,
    };

    this.rooms.set(roomCode, room);
    this.userToRoom.set(hostUserId, roomCode);
    return room;
  }

  // ── Join Room ──────────────────────────────────────────────────
  joinRoom(roomCode, userId, teamId, username) {
    const room = this.rooms.get(roomCode);
    if (!room) return { success: false, reason: 'Room not found' };
    if (room.status !== 'lobby') return { success: false, reason: 'Auction has already started' };
    if (room.teams[teamId]) return { success: false, reason: 'Team already taken! Choose another.' };
    if (Object.keys(room.teams).length >= 10) return { success: false, reason: 'Room is full (max 10 teams)' };

    // Check if user already joined with another team
    const existingEntry = Object.values(room.teams).find(t => t.userId === userId);
    if (existingEntry) return { success: false, reason: 'You already joined with a different team' };

    room.teams[teamId] = {
      teamId,
      userId,
      username,
      purse: STARTING_PURSE,
      squad: [],
      isHost: false,
    };
    this.userToRoom.set(userId, roomCode);
    this.rooms.set(roomCode, room);
    return { success: true, room };
  }

  // ── Start Auction ──────────────────────────────────────────────
  startAuction(roomCode, hostUserId) {
    const room = this.rooms.get(roomCode);
    if (!room) return { success: false, reason: 'Room not found' };
    if (room.hostUserId !== hostUserId) return { success: false, reason: 'Only host can start' };
    if (Object.keys(room.teams).length < 2) return { success: false, reason: 'Need at least 2 teams to start' };

    // Build player queue — only include players up to a reasonable count
    room.playerQueue = buildAuctionOrder(true).slice(0, 80); // 80 players per auction
    room.currentPlayerIdx = 0;
    room.status = 'auction';
    room.startedAt = new Date();

    this.rooms.set(roomCode, room);

    // Reveal first player
    this._revealNextPlayer(roomCode);
    return { success: true };
  }

  // ── Place Bid ─────────────────────────────────────────────────
  placeBid(roomCode, userId, amount) {
    const room = this.rooms.get(roomCode);
    if (!room) return { success: false, reason: 'Room not found' };
    if (room.status !== 'auction') return { success: false, reason: 'Auction not active' };
    if (!room.currentPlayer) return { success: false, reason: 'No player up for bid' };

    // Find the team of this user
    const team = Object.values(room.teams).find(t => t.userId === userId);
    if (!team) return { success: false, reason: 'You are not in this room' };

    const teamId = team.teamId;

    // Validate amount
    const minBid = room.currentBid === 0
      ? room.currentPlayer.basePrice
      : parseFloat((room.currentBid + MIN_BID_INCREMENT).toFixed(2));

    if (amount < minBid) {
      return { success: false, reason: `Minimum bid is ₹${minBid} Cr` };
    }

    // Validate purse
    if (amount > team.purse) {
      return { success: false, reason: `Insufficient purse! You have ₹${team.purse.toFixed(2)} Cr` };
    }

    // Validate squad size
    if (team.squad.length >= MAX_SQUAD_SIZE) {
      return { success: false, reason: 'Squad is full (25 players max)' };
    }

    // Can't outbid yourself
    if (room.currentBidder === teamId) {
      return { success: false, reason: "You're already the highest bidder!" };
    }

    const prevBidder = room.currentBidder;

    // Update bid state
    room.currentBid = parseFloat(amount.toFixed(2));
    room.currentBidder = teamId;
    room.currentBidderName = team.username;
    room.bidCount += 1;
    room.timerSeconds = TIMER_SECONDS; // Reset timer on each bid

    this.rooms.set(roomCode, room);

    // Broadcast bid
    const bidData = {
      teamId,
      teamName: team.username,
      amount: room.currentBid,
      bidCount: room.bidCount,
      purseRemaining: team.purse,
      prevBidder,
    };
    this._broadcast(roomCode, 'ipl:bid_placed', bidData);

    // Notify previous bidder they were outbid
    if (prevBidder) {
      const prevTeam = room.teams[prevBidder];
      if (prevTeam) {
        const prevSocket = this._findSocket(prevTeam.userId);
        if (prevSocket) {
          prevSocket.emit('ipl:outbid', {
            byTeam: teamId,
            byTeamName: team.username,
            newBid: room.currentBid,
            player: room.currentPlayer?.name,
          });
        }
      }
    }

    return { success: true };
  }

  // ── Pass ──────────────────────────────────────────────────────
  passOnPlayer(roomCode, userId) {
    const room = this.rooms.get(roomCode);
    if (!room) return { success: false, reason: 'Room not found' };
    
    const team = Object.values(room.teams).find(t => t.userId === userId);
    if (!team) return { success: false, reason: 'Not in room' };

    // Record pass (for analytics only — teams can still bid after passing)
    this._broadcast(roomCode, 'ipl:team_passed', {
      teamId: team.teamId,
      teamName: team.username,
    });
    return { success: true };
  }

  // ── Hammer (sell current player) ─────────────────────────────
  _hammerDown(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room || !room.currentPlayer) return;

    this._stopTimer(roomCode);

    const player = room.currentPlayer;

    if (room.currentBidder && room.currentBid >= player.basePrice) {
      // SOLD
      const winningTeam = room.teams[room.currentBidder];
      winningTeam.purse = parseFloat((winningTeam.purse - room.currentBid).toFixed(2));
      winningTeam.squad.push({ ...player, soldPrice: room.currentBid });

      room.soldLog.push({
        player,
        teamId: room.currentBidder,
        teamName: winningTeam.username,
        price: room.currentBid,
      });

      this._broadcast(roomCode, 'ipl:hammer', {
        type: 'sold',
        player,
        teamId: room.currentBidder,
        teamName: winningTeam.username,
        price: room.currentBid,
        purseRemaining: winningTeam.purse,
        squadSize: winningTeam.squad.length,
      });
    } else {
      // UNSOLD
      room.unsoldPlayers.push(player);
      this._broadcast(roomCode, 'ipl:hammer', {
        type: 'unsold',
        player,
      });
    }

    this.rooms.set(roomCode, room);

    // Wait 3s then reveal next player
    setTimeout(() => {
      this._revealNextPlayer(roomCode);
    }, 3500);
  }

  // ── Reveal Next Player ────────────────────────────────────────
  _revealNextPlayer(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    if (room.currentPlayerIdx >= room.playerQueue.length) {
      // Auction complete
      this._endAuction(roomCode);
      return;
    }

    const player = room.playerQueue[room.currentPlayerIdx];
    room.currentPlayerIdx += 1;
    room.currentPlayer = player;
    room.currentBid = 0;
    room.currentBidder = null;
    room.currentBidderName = null;
    room.bidCount = 0;
    room.timerSeconds = TIMER_SECONDS;

    this.rooms.set(roomCode, room);

    // Broadcast reveal
    this._broadcast(roomCode, 'ipl:player_revealed', {
      player,
      playerIdx: room.currentPlayerIdx,
      totalPlayers: room.playerQueue.length,
      basePrice: player.basePrice,
    });

    // Start timer
    setTimeout(() => {
      this._startTimer(roomCode);
    }, 2000); // 2s for reveal animation before timer starts
  }

  // ── Timer ──────────────────────────────────────────────────────
  _startTimer(roomCode) {
    this._stopTimer(roomCode);
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.timerActive = true;
    room.timerSeconds = TIMER_SECONDS;
    this.rooms.set(roomCode, room);

    const interval = setInterval(() => {
      const r = this.rooms.get(roomCode);
      if (!r || !r.timerActive) { clearInterval(interval); return; }

      r.timerSeconds = Math.max(0, r.timerSeconds - 1);
      this.rooms.set(roomCode, r);

      this._broadcast(roomCode, 'ipl:timer_tick', {
        secondsLeft: r.timerSeconds,
        currentBid: r.currentBid,
        currentBidder: r.currentBidder,
      });

      if (r.timerSeconds === 10 && r.currentBidder) {
        this._broadcast(roomCode, 'ipl:auctioneer', {
          message: `Going once... going twice... ₹${r.currentBid} Cr to ${r.currentBidderName}!`,
        });
      }

      if (r.timerSeconds <= 0) {
        clearInterval(interval);
        this.timers.delete(roomCode);
        this._hammerDown(roomCode);
      }
    }, 1000);

    this.timers.set(roomCode, interval);
  }

  _stopTimer(roomCode) {
    const t = this.timers.get(roomCode);
    if (t) { clearInterval(t); this.timers.delete(roomCode); }
    const room = this.rooms.get(roomCode);
    if (room) { room.timerActive = false; this.rooms.set(roomCode, room); }
  }

  // ── End Auction ───────────────────────────────────────────────
  _endAuction(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.status = 'complete';
    room.endedAt = new Date();
    this.rooms.set(roomCode, room);

    const results = Object.values(room.teams).map(team => ({
      teamId: team.teamId,
      username: team.username,
      squad: team.squad,
      purseSpent: STARTING_PURSE - team.purse,
      purseRemaining: team.purse,
      squadSize: team.squad.length,
    }));

    this._broadcast(roomCode, 'ipl:auction_complete', {
      results,
      soldLog: room.soldLog,
      unsoldPlayers: room.unsoldPlayers,
    });
  }

  // ── Public State ──────────────────────────────────────────────
  getPublicState(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    return {
      roomCode: room.roomCode,
      status: room.status,
      teams: room.teams,
      currentPlayer: room.currentPlayer,
      currentBid: room.currentBid,
      currentBidder: room.currentBidder,
      currentBidderName: room.currentBidderName,
      bidCount: room.bidCount,
      timerSeconds: room.timerSeconds,
      playerIdx: room.currentPlayerIdx,
      totalPlayers: room.playerQueue.length,
      soldLog: room.soldLog.slice(-10), // Last 10 sold
      hostUserId: room.hostUserId,
    };
  }

  listOpenRooms() {
    return [...this.rooms.values()]
      .filter(r => r.status === 'lobby')
      .map(r => ({
        roomCode: r.roomCode,
        teamCount: Object.keys(r.teams).length,
        teams: Object.values(r.teams).map(t => t.teamId),
        createdAt: r.createdAt,
      }));
  }

  getRoomByUserId(userId) {
    const code = this.userToRoom.get(userId);
    return code ? this.rooms.get(code) : null;
  }

  // ── Helpers ───────────────────────────────────────────────────
  _broadcast(roomCode, event, data) {
    this.io.to(`ipl_${roomCode}`).emit(event, data);
  }

  _generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'IPL-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  _findSocket(userId) {
    for (const [, socket] of this.io.sockets.sockets) {
      if (socket.userId === userId) return socket;
    }
    return null;
  }
}
