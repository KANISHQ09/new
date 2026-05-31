// Zustand store for user state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      userId: null,
      username: null,
      email: null,
      avatarUrl: null,
      balance: 5000,
      totalWins: 0,
      totalSpent: 0,
      reputationScore: 100,
      token: null,
      isLoggedIn: false,
      watchlist: [],

      setUser: (user) => set({ ...user, isLoggedIn: true }),
      
      updateBalance: (newBalance) => set({ balance: newBalance }),
      
      deductBalance: (amount) => set((state) => ({
        balance: state.balance - amount,
      })),
      
      addWin: (amount) => set((state) => ({
        totalWins: state.totalWins + 1,
        totalSpent: state.totalSpent + amount,
      })),
      
      addToWatchlist: (auctionId) => set((state) => ({
        watchlist: state.watchlist.includes(auctionId)
          ? state.watchlist
          : [...state.watchlist, auctionId],
      })),
      
      removeFromWatchlist: (auctionId) => set((state) => ({
        watchlist: state.watchlist.filter((id) => id !== auctionId),
      })),
      
      logout: () => set({
        userId: null, username: null, email: null, avatarUrl: null,
        balance: 5000, totalWins: 0, totalSpent: 0, reputationScore: 100,
        token: null, isLoggedIn: false, watchlist: [],
      }),
    }),
    { name: 'auction-user' }
  )
);
