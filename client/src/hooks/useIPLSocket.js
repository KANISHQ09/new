// IPL Socket Hook — handles all ipl:* events
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useIPLStore } from '../store/iplStore';
import { useUserStore } from '../store/userStore';
import toast from 'react-hot-toast';
import { SFX } from '../utils/sounds';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let iplSocket = null;

export function useIPLSocket() {
  const socketRef = useRef(null);
  const { userId, token } = useUserStore();
  const store = useIPLStore();

  const getSocket = useCallback(() => {
    if (!iplSocket) {
      iplSocket = io(SOCKET_URL, {
        auth: { token: token || 'ipl-guest', userId },
        query: { userId },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket'],
      });
    }
    return iplSocket;
  }, [token, userId]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    // ── Room events ──────────────────────────────────────────────
    socket.on('ipl:room_created', ({ roomCode, state }) => {
      store.setRoomCode(roomCode);
      store.setIsHost(true);
      if (state) store.setRoomState(state);
    });

    socket.on('ipl:joined_room', ({ roomCode, state }) => {
      store.setRoomCode(roomCode);
      if (state) store.setRoomState(state);
    });

    socket.on('ipl:room_state', (state) => {
      store.setRoomState(state);
    });

    socket.on('ipl:team_joined', ({ teamId, username, teamCount }) => {
      store.teamJoined(teamId, username);
      toast(`🏏 ${username} joined as ${teamId}!`, {
        style: { background: '#1a2e0a', color: '#5dca85', border: '1px solid #27ae60' },
      });
    });

    socket.on('ipl:team_disconnected', ({ teamId }) => {
      toast.error(`${teamId} disconnected from auction`, { duration: 3000 });
    });

    // ── Auction events ───────────────────────────────────────────
    socket.on('ipl:auction_started', ({ message }) => {
      store.addAuctioneerMessage(message);
      toast('🏏 IPL Auction has begun!', {
        style: { background: '#0a1a2e', color: '#D1AB3E', border: '1px solid #D1AB3E' },
        duration: 4000,
      });
    });

    socket.on('ipl:player_revealed', ({ player, playerIdx, totalPlayers }) => {
      store.revealPlayer(player, playerIdx, totalPlayers);
      store.addAuctioneerMessage(`🎙️ Player ${playerIdx}/${totalPlayers}: ${player.name} — Base Price ₹${player.basePrice} Cr!`);
    });

    socket.on('ipl:bid_placed', (bid) => {
      store.updateBid(bid);
      store.addAuctioneerMessage(`🔥 ₹${bid.amount} Cr — ${bid.teamName}!`);
      SFX.play('bid');
    });

    socket.on('ipl:outbid', ({ byTeamName, newBid, player }) => {
      SFX.play('outbid');
      toast.error(`😤 Outbid! ${byTeamName} raised to ₹${newBid} Cr for ${player}`, {
        style: { background: '#1a0000', color: '#ff6b6b', border: '1px solid #c0392b' },
        duration: 3000,
      });
    });

    socket.on('ipl:timer_tick', ({ secondsLeft, currentBid, currentBidder }) => {
      store.updateTimer(secondsLeft);
      if (secondsLeft <= 10 && secondsLeft > 0) {
        SFX.play('tick');
      }
    });

    socket.on('ipl:hammer', (data) => {
      store.showHammerResult(data);
      SFX.play('gavel');
      if (data.type === 'sold') {
        const isWinner = data.teamId === store.myTeamId;
        if (isWinner) {
          setTimeout(() => SFX.play('win'), 600);
        }
        store.addAuctioneerMessage(`🔨 SOLD! ${data.player?.name} goes to ${data.teamName} for ₹${data.price} Cr!`);
        toast.success(`🔨 ${data.player?.name} SOLD to ${data.teamName} for ₹${data.price} Cr!`, {
          duration: 3500,
          style: { background: '#0a1a0a', color: '#5dca85', border: '1px solid #27ae60' },
        });
      } else {
        store.addAuctioneerMessage(`❌ ${data.player?.name} is UNSOLD. Moving on...`);
        toast(`❌ ${data.player?.name} is UNSOLD`, {
          style: { background: '#1a1a0a', color: '#aaa', border: '1px solid #555' },
        });
      }
      setTimeout(() => store.hideHammer(), 3000);
    });

    socket.on('ipl:team_passed', ({ teamId, teamName }) => {
      // show quick notification
    });

    socket.on('ipl:auctioneer', ({ message }) => {
      store.addAuctioneerMessage(message);
    });

    socket.on('ipl:auction_complete', (data) => {
      store.setResults(data.results);
    });

    // ── Errors ───────────────────────────────────────────────────
    socket.on('ipl:error', ({ message }) => {
      toast.error(message, {
        style: { background: '#1a0000', color: '#ff6b6b', border: '1px solid #c0392b' },
      });
    });

    socket.on('ipl:bid_rejected', ({ reason }) => {
      toast.error(reason, {
        style: { background: '#1a0000', color: '#ff6b6b', border: '1px solid #c0392b' },
      });
    });

    return () => {
      socket.off('ipl:room_created');
      socket.off('ipl:joined_room');
      socket.off('ipl:room_state');
      socket.off('ipl:team_joined');
      socket.off('ipl:team_disconnected');
      socket.off('ipl:auction_started');
      socket.off('ipl:player_revealed');
      socket.off('ipl:bid_placed');
      socket.off('ipl:outbid');
      socket.off('ipl:timer_tick');
      socket.off('ipl:hammer');
      socket.off('ipl:team_passed');
      socket.off('ipl:auctioneer');
      socket.off('ipl:auction_complete');
      socket.off('ipl:error');
      socket.off('ipl:bid_rejected');
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const createRoom = useCallback((teamId, username) => {
    emit('ipl:create_room', { teamId, username });
  }, [emit]);

  const joinRoom = useCallback((roomCode, teamId, username) => {
    emit('ipl:join_room', { roomCode, teamId, username });
  }, [emit]);

  const startAuction = useCallback((roomCode) => {
    emit('ipl:start_auction', { roomCode });
  }, [emit]);

  const placeBid = useCallback((roomCode, amount) => {
    emit('ipl:place_bid', { roomCode, amount });
  }, [emit]);

  const pass = useCallback((roomCode) => {
    emit('ipl:pass', { roomCode });
  }, [emit]);

  const getState = useCallback((roomCode) => {
    emit('ipl:get_state', { roomCode });
  }, [emit]);

  return { createRoom, joinRoom, startAuction, placeBid, pass, getState, emit };
}
