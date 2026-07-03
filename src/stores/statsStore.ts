import { create } from 'zustand';
import { DeckWinRateSummary, DashboardStats, MonthlyStats, OpponentDeckSummary } from '../types';
import * as deckRepo from '../repositories/deckRepository';
import * as duelRepo from '../repositories/duelRepository';
import * as opponentDeckRepo from '../repositories/opponentDeckRepository';

interface StatsState {
  stats: DashboardStats | null;
  deckSummaries: DeckWinRateSummary[];
  monthlyStats: MonthlyStats | null;
  availableMonths: { year: number; month: number }[];
  opponentDeckSummaries: OpponentDeckSummary[];
  loading: boolean;
  loadStats: () => Promise<void>;
  loadDeckSummaries: () => Promise<void>;
  loadMonthlyStats: (year: number, month: number) => Promise<void>;
  loadAvailableMonths: () => Promise<void>;
  loadOpponentDeckSummaries: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  deckSummaries: [],
  monthlyStats: null,
  availableMonths: [],
  opponentDeckSummaries: [],
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

  loadMonthlyStats: async (year: number, month: number) => {
    set({ loading: true });
    try {
      const monthlyStats = await duelRepo.getMonthlyStats(year, month);
      set({ monthlyStats, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadAvailableMonths: async () => {
    try {
      const availableMonths = await duelRepo.getAvailableMonths();
      set({ availableMonths });
    } catch {
      // 忽略错误
    }
  },

  loadOpponentDeckSummaries: async () => {
    try {
      const opponentDeckSummaries = await opponentDeckRepo.getOpponentDeckSummaries();
      set({ opponentDeckSummaries });
    } catch {
      // 忽略错误
    }
  },
}));
