// Socket.IO connection hook
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuctionStore } from '../store/auctionStore';
import { useUserStore } from '../store/userStore';
import { SFX } from '../utils/sounds';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socketInstance = null;

export function useSocket() {
  const socketRef = useRef(null);
  const { userId, token } = useUserStore();
  const {
    addBid, addMessage, addReaction, setAuctionState,
    setOutbidAlert, setExtensionBanner, setAuctioneerMessage, setStatus,
  } = useAuctionStore();

  const getSocket = useCallback(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket'],
      });
    }
    return socketInstance;
  }, [token]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    // ── Auction state sync ──────────────────────────────
    socket.on('auction_state', (state) => {
      setAuctionState({
        ...state,
        bids: state.bids || [],
        messages: state.messages || [],
        players: state.players || [],
      });
    });

    // ── Bid placed ──────────────────────────────────────
    socket.on('bid_placed', (data) => {
      addBid(data.bid);
      SFX.play('bid');
      // Flash price update signal via store
      setAuctionState({ priceUpdatedAt: Date.now() });
    });

    // ── Outbid ──────────────────────────────────────────
    socket.on('outbid', (data) => {
      addBid(data.bid);
      setAuctionState({
        currentPrice: data.newPrice,
        leadingBidderName: data.newBidder,
        isLeading: false,
      });
      setOutbidAlert(true);
      SFX.play('outbid');
      toast.error(`Outbid by ${data.newBidder}! New price: $${data.newPrice}`, {
        icon: '😤',
        duration: 3000,
        style: { background: '#1a0000', color: '#ff6b6b', border: '1px solid #c0392b' },
      });
      setTimeout(() => setOutbidAlert(false), 600);
    });

    // ── Price update ────────────────────────────────────
    socket.on('price_update', (data) => {
      setAuctionState({
        currentPrice: data.currentPrice,
        totalBids: data.bidsCount,
      });
    });

    // ── Timer update ────────────────────────────────────
    socket.on('timer_update', (data) => {
      const seconds = data.secondsLeft;
      setAuctionState({ secondsLeft: seconds, endsAt: data.endsAt });

      if (seconds <= 10 && seconds > 0) {
        setStatus('final');
        SFX.play('tick');
      } else if (seconds <= 60 && seconds > 10) {
        setStatus('frenzy');
      }
    });

    // ── Extension ───────────────────────────────────────
    socket.on('auction_extended', (data) => {
      setExtensionBanner(true, `+${data.addedSeconds || 30}s Added!`);
      toast('⏱️ Auction extended!', {
        style: { background: '#1a1400', color: '#d4a843', border: '1px solid #d4a843' },
      });
      setTimeout(() => setExtensionBanner(false), 3500);
    });

    // ── Reserve met ─────────────────────────────────────
    socket.on('reserve_met', () => {
      setAuctionState({ reserveMet: true });
      toast.success('Reserve price met!', {
        icon: '✅',
        style: { background: '#0a1a0a', color: '#5dca85', border: '1px solid #27ae60' },
      });
    });

    // ── Auction sold ────────────────────────────────────
    socket.on('auction_sold', (data) => {
      const isWinner = data.winnerId === userId;
      setAuctionState({
        result: data,
        status: isWinner ? 'sold' : 'passed',
        currentVideo: isWinner ? 'sold-winner' : 'loser',
      });
      if (isWinner) {
        SFX.play('gavel');
        setTimeout(() => SFX.play('win'), 600);
      } else {
        SFX.play('gavel');
      }
    });

    // ── Players ─────────────────────────────────────────
    socket.on('player_joined', ({ userId: uid, username, count }) => {
      setAuctionState({ playerCount: count });
      addMessage({ type: 'system', message: `${username} joined the room`, userId: uid, timestamp: new Date() });
    });

    socket.on('player_left', ({ userId: uid, username, count }) => {
      setAuctionState({ playerCount: count });
      addMessage({ type: 'system', message: `${username} left`, userId: uid, timestamp: new Date() });
    });

    socket.on('player_list', (players) => {
      setAuctionState({ players });
    });

    // ── Chat ────────────────────────────────────────────
    socket.on('new_message', (msg) => {
      addMessage(msg);
    });

    socket.on('new_reaction', (reaction) => {
      addReaction(reaction);
    });

    // ── Auctioneer bot ──────────────────────────────────
    socket.on('auctioneer_says', ({ message }) => {
      setAuctioneerMessage(message);
      addMessage({ type: 'auctioneer', message, userId: 'auctioneer', timestamp: new Date() });
    });

    // ── Bid rejected ────────────────────────────────────
    socket.on('bid_rejected', ({ reason }) => {
      toast.error(reason || 'Bid rejected', {
        style: { background: '#1a0000', color: '#ff6b6b', border: '1px solid #c0392b' },
      });
    });

    // ── Error ───────────────────────────────────────────
    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
    });

    return () => {
      socket.off('auction_state');
      socket.off('bid_placed');
      socket.off('outbid');
      socket.off('price_update');
      socket.off('timer_update');
      socket.off('auction_extended');
      socket.off('reserve_met');
      socket.off('auction_sold');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('player_list');
      socket.off('new_message');
      socket.off('new_reaction');
      socket.off('auctioneer_says');
      socket.off('bid_rejected');
      socket.off('connect_error');
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const joinRoom = useCallback((auctionId) => {
    emit('join_room', { auctionId, userId, token });
  }, [userId, token, emit]);

  const leaveRoom = useCallback((auctionId) => {
    emit('leave_room', { auctionId });
  }, [emit]);

  const placeBid = useCallback((auctionId, amount) => {
    emit('place_bid', { auctionId, amount, userId });
  }, [userId, emit]);

  const sendMessage = useCallback((auctionId, message) => {
    emit('send_message', { auctionId, message, userId });
  }, [userId, emit]);

  const sendReaction = useCallback((auctionId, emoji) => {
    emit('send_reaction', { auctionId, emoji });
  }, [emit]);

  return { joinRoom, leaveRoom, placeBid, sendMessage, sendReaction, emit };
}
