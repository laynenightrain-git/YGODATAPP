import { create } from 'zustand';
import { Deck, DeckDetail } from '../types';
import * as deckRepo from '../repositories/deckRepository';

interface DeckState {
  decks: Deck[];
  currentDeck: DeckDetail | null;
  loading: boolean;
  loadDecks: () => Promise<void>;
  loadDeckDetail: (id: number) => Promise<void>;
  addDeck: (name: string) => Promise<Deck>;
  editDeck: (id: number, name: string) => Promise<void>;
  updateDeck: (id: number, name: string) => Promise<void>;
  markModified: (id: number) => Promise<void>;
  removeDeck: (id: number) => Promise<void>;
  deleteDeck: (id: number) => Promise<void>;
}

export const useDeckStore = create<DeckState>((set) => ({
  decks: [],
  currentDeck: null,
  loading: false,

  loadDecks: async () => {
    set({ loading: true });
    try {
      const decks = await deckRepo.getAllDecks();
      set({ decks, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadDeckDetail: async (id: number) => {
    set({ loading: true });
    try {
      const deck = await deckRepo.getDeckById(id);
      set({ currentDeck: deck, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addDeck: async (name: string) => {
    const newDeck = await deckRepo.createDeck({ name });
    set((state) => ({ decks: [newDeck, ...state.decks] }));
    return newDeck;
  },

  editDeck: async (id: number, name: string) => {
    await deckRepo.updateDeck(id, name);
    set((state) => ({
      decks: state.decks.map((d) => (d.id === id ? { ...d, name } : d)),
      currentDeck: state.currentDeck?.id === id
        ? { ...state.currentDeck, name }
        : state.currentDeck,
    }));
  },

  updateDeck: async (id: number, name: string) => {
    await deckRepo.updateDeck(id, name);
    set((state) => ({
      decks: state.decks.map((d) => (d.id === id ? { ...d, name } : d)),
      currentDeck: state.currentDeck?.id === id
        ? { ...state.currentDeck, name }
        : state.currentDeck,
    }));
  },

  markModified: async (id: number) => {
    await deckRepo.markDeckAsModified(id);
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === id ? { ...d, is_modified: 1, total_games: 0 } : d
      ),
      currentDeck:
        state.currentDeck?.id === id
          ? { ...state.currentDeck, is_modified: 1, total_games: 0 }
          : state.currentDeck,
    }));
  },

  removeDeck: async (id: number) => {
    await deckRepo.deleteDeck(id);
    set((state) => ({
      decks: state.decks.filter((d) => d.id !== id),
      currentDeck: state.currentDeck?.id === id ? null : state.currentDeck,
    }));
  },

  deleteDeck: async (id: number) => {
    await deckRepo.deleteDeck(id);
    set((state) => ({
      decks: state.decks.filter((d) => d.id !== id),
      currentDeck: state.currentDeck?.id === id ? null : state.currentDeck,
    }));
  },
}));
