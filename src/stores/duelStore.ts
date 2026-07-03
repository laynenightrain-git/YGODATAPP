import { create } from 'zustand';
import { DuelRecord, CreateDuelInput, DashboardStats } from '../types';
import * as duelRepo from '../repositories/duelRepository';
import { afterDuelAdded } from '../services/winRateService';
import { saveLastDuel } from '../hooks/useLastDuel';
import * as opponentDeckRepo from '../repositories/opponentDeckRepository';

interface DuelState {
  duels: DuelRecord[];
  currentDuel: DuelRecord | null;
  stats: DashboardStats | null;
  loading: boolean;
  loadDuels: () => Promise<void>;
  loadDuel: (id: number) => Promise<void>;
  loadStats: () => Promise<void>;
  addDuel: (input: CreateDuelInput) => Promise<void>;
  updateDuel: (id: number, input: Partial<CreateDuelInput>) => Promise<void>;
  removeDuel: (id: number) => Promise<void>;
  getDuelsByDeckId: (deckId: number) => DuelRecord[];
}

export const useDuelStore = create<DuelState>((set, get) => ({
  duels: [],
  currentDuel: null,
  stats: null,
  loading: false,

  loadDuels: async () => {
    set({ loading: true });
    try {
      const duels = await duelRepo.getAllDuels();
      set({ duels, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadDuel: async (id: number) => {
    set({ loading: true });
    try {
      const duel = await duelRepo.getDuelById(id);
      set({ currentDuel: duel, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadStats: async () => {
    set({ loading: true });
    try {
      const stats = await duelRepo.getDashboardStats();
      set({ stats, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addDuel: async (input: CreateDuelInput) => {
    const duel = await duelRepo.createDuel(input);
    set((state) => ({ duels: [duel, ...state.duels] }));
    await afterDuelAdded(input.deck_id);
    // 保存上次对局选择，下次录入时自动恢复
    await saveLastDuel(input);
    // 更新对手卡组统计
    if (input.opponent_deck) {
      await opponentDeckRepo.upsertOpponentDeck(
        input.opponent_deck,
        input.result === 'win'
      );
    }
    const stats = await duelRepo.getDashboardStats();
    set({ stats });
  },

  removeDuel: async (id: number) => {
    await duelRepo.deleteDuel(id);
    set((state) => ({ duels: state.duels.filter((d) => d.id !== id) }));
    const stats = await duelRepo.getDashboardStats();
    set({ stats });
  },

  updateDuel: async (id: number, input: Partial<CreateDuelInput>) => {
    const updated = await duelRepo.updateDuel(id, input);
    if (updated) {
      set((state) => ({
        duels: state.duels.map((d) => (d.id === id ? updated : d)),
        currentDuel: updated,
      }));
    }
    const stats = await duelRepo.getDashboardStats();
    set({ stats });
  },

  getDuelsByDeckId: (deckId: number) => {
    return get().duels.filter((d) => d.deck_id === deckId);
  },
}));
