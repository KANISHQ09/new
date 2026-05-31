// Zustand store for auction state
import { create } from 'zustand';

export const useAuctionStore = create((set, get) => ({
  // Room
  roomId: null,
  roomCode: null,
  players: [],
  
  // Auction meta
  auctionId: null,
  status: 'idle', // idle | waiting | reveal | bidding | frenzy | final | sold | passed
  item: null,
  auctioneerName: 'Charles Wellington III',
  
  // Pricing
  currentPrice: 0,
  startingPrice: 0,
  reservePrice: null,
  reserveMet: false,
  bidIncrement: 10,
  buyItNowPrice: null,
  
  // Timer
  secondsLeft: 0,
  endsAt: null,
  extended: false,
  
  // Bids
  bids: [],
  leadingBidder: null,
  leadingBidderName: null,
  totalBids: 0,
  
  // Current user bid state
  myCurrentBid: null,
  isLeading: false,
  wasOutbid: false,
  outbidBy: null,
  
  // Chat
  messages: [],
  reactions: [],
  
  // Auctioneer
  auctioneerMessage: 'Welcome, distinguished bidders!',
  
  // Video
  currentVideo: 'lobby',
  
  // UI
  showOutbidAlert: false,
  showExtensionBanner: false,
  extensionMessage: '',
  
  // Result
  result: null, // { winnerId, winnerName, finalPrice }
  
  // Actions
  setAuctionState: (state) => set(state),
  
  addBid: (bid) => set((state) => ({
    bids: [bid, ...state.bids].slice(0, 100),
    currentPrice: bid.amount,
    leadingBidder: bid.userId,
    leadingBidderName: bid.username,
    totalBids: state.totalBids + 1,
    wasOutbid: state.myCurrentBid && bid.userId !== state.myCurrentBid?.userId,
    outbidBy: bid.userId !== state.myCurrentBid?.userId ? bid.username : state.outbidBy,
  })),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, msg].slice(-200),
  })),

  addReaction: (reaction) => set((state) => ({
    reactions: [...state.reactions, { ...reaction, id: Date.now() }].slice(-20),
  })),

  setOutbidAlert: (show) => set({ showOutbidAlert: show }),
  
  setExtensionBanner: (show, message = '') => set({
    showExtensionBanner: show,
    extensionMessage: message,
    extended: show,
  }),

  setVideo: (video) => set({ currentVideo: video }),
  
  setAuctioneerMessage: (msg) => set({ auctioneerMessage: msg }),
  
  setStatus: (status) => {
    const videoMap = {
      waiting: 'waiting',
      reveal: 'reveal',
      bidding: 'bidding-calm',
      frenzy: 'bidding-frenzy',
      final: 'final-countdown',
      sold: 'sold-winner',
      passed: 'loser',
    };
    set({ status, currentVideo: videoMap[status] || 'lobby' });
  },

  reset: () => set({
    roomId: null, roomCode: null, players: [],
    auctionId: null, status: 'idle', item: null,
    currentPrice: 0, startingPrice: 0, reservePrice: null,
    reserveMet: false, bidIncrement: 10, buyItNowPrice: null,
    secondsLeft: 0, endsAt: null, extended: false,
    bids: [], leadingBidder: null, leadingBidderName: null, totalBids: 0,
    myCurrentBid: null, isLeading: false, wasOutbid: false, outbidBy: null,
    messages: [], reactions: [], auctioneerMessage: 'Welcome!',
    currentVideo: 'lobby', showOutbidAlert: false, showExtensionBanner: false,
    result: null,
  }),
}));
