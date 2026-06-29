import { create } from 'zustand';
import { DeckWinRateSummary, DashboardStats } from '../types';
import * as deckRepo from '../repositories/deckRepository';
import * as duelRepo from '../repositories/duelRepository';

interface StatsState {
  stats: DashboardStats | null;
  deckSummaries: DeckWinRateSummary[];
  loading: boolean;
  loadStats: () => Promise<void>;
  loadDeckSummaries: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  deckSummaries: [],
  loading: false,

  loadStats: async () => {
    set({ loading: true });
    try {
      const stats = await duelRepo.getDashboardStats();
      set({ stats, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadDeckSummaries: async () => {
    set({ loading: true });
    try {
      const deckSummaries = await deckRepo.getDeckWinRateSummaries();
      set({ deckSummaries, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
