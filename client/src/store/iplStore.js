// IPL Zustand Store — All real-time auction state
import { create } from 'zustand';

export const useIPLStore = create((set, get) => ({
  // Room
  roomCode: null,
  roomStatus: 'idle', // idle | lobby | auction | complete
  isHost: false,
  myTeamId: null,
  myUserId: null,

  // All teams in room: { [teamId]: { teamId, username, purse, squad, isHost } }
  teams: {},

  // Current auction state
  currentPlayer: null,    // IPL player object
  playerIdx: 0,
  totalPlayers: 80,
  currentBid: 0,
  currentBidder: null,    // teamId
  currentBidderName: null,
  bidCount: 0,
  timerSeconds: 30,

  // Recent sold log
  soldLog: [],

  // Notifications/announcements
  auctioneerMessage: '🎙️ Welcome to the IPL Mega Auction!',
  lastHammer: null,       // { type: 'sold'|'unsold', player, teamId, price }
  showHammer: false,

  // Final results
  results: null,

  // Actions
  setRoomCode: (code) => set({ roomCode: code }),
  setMyTeam: (teamId) => set({ myTeamId: teamId }),
  setMyUserId: (id) => set({ myUserId: id }),
  setIsHost: (v) => set({ isHost: v }),

  setRoomState: (state) => set({
    roomCode: state.roomCode,
    roomStatus: state.status,
    teams: state.teams || {},
    currentPlayer: state.currentPlayer,
    playerIdx: state.playerIdx || 0,
    totalPlayers: state.totalPlayers || 80,
    currentBid: state.currentBid || 0,
    currentBidder: state.currentBidder,
    currentBidderName: state.currentBidderName,
    bidCount: state.bidCount || 0,
    timerSeconds: state.timerSeconds || 30,
    soldLog: state.soldLog || [],
    isHost: state.hostUserId === get().myUserId,
  }),

  updateTimer: (seconds) => set({ timerSeconds: seconds }),

  updateBid: (bid) => set({
    currentBid: bid.amount,
    currentBidder: bid.teamId,
    currentBidderName: bid.teamName,
    bidCount: bid.bidCount,
    // Update team purse optimistically
    teams: (() => {
      const teams = { ...get().teams };
      // We'll get exact purse from server on hammer
      return teams;
    })(),
  }),

  revealPlayer: (player, idx, total) => set({
    currentPlayer: player,
    playerIdx: idx,
    totalPlayers: total,
    currentBid: player.basePrice,
    currentBidder: null,
    currentBidderName: null,
    bidCount: 0,
    timerSeconds: 30,
    showHammer: false,
    lastHammer: null,
  }),

  showHammerResult: (data) => set({
    showHammer: true,
    lastHammer: data,
    // Update teams on SOLD
    teams: (() => {
      const teams = { ...get().teams };
      if (data.type === 'sold' && teams[data.teamId]) {
        teams[data.teamId] = {
          ...teams[data.teamId],
          purse: data.purseRemaining,
          squad: [...(teams[data.teamId].squad || []), get().currentPlayer],
        };
      }
      return teams;
    })(),
  }),

  hideHammer: () => set({ showHammer: false }),

  teamJoined: (teamId, username) => set((state) => ({
    teams: {
      ...state.teams,
      [teamId]: { teamId, username, purse: 100, squad: [], isHost: false },
    },
  })),

  setResults: (results) => set({ results, roomStatus: 'complete' }),

  addAuctioneerMessage: (msg) => set({ auctioneerMessage: msg }),

  reset: () => set({
    roomCode: null, roomStatus: 'idle', isHost: false, myTeamId: null,
    teams: {}, currentPlayer: null, playerIdx: 0, totalPlayers: 80,
    currentBid: 0, currentBidder: null, currentBidderName: null,
    bidCount: 0, timerSeconds: 30, soldLog: [], auctioneerMessage: '🎙️ Welcome!',
    lastHammer: null, showHammer: false, results: null,
  }),
}));
