import { getDatabase } from '../database/client';
import { Deck, DeckDetail, DeckWinRateRecord, CreateDeckInput, DeckWinRateSummary } from '../types';

export async function getAllDecks(): Promise<Deck[]> {
  const db = getDatabase();
  return db.getAllSync<Deck>('SELECT * FROM decks ORDER BY created_at DESC');
}

export async function getDeckById(id: number): Promise<DeckDetail | null> {
  const db = getDatabase();
  const deck = db.getFirstSync<Deck>('SELECT * FROM decks WHERE id = ?', id);
  if (!deck) return null;

  const records = db.getAllSync<{
    id: number;
    deck_id: number;
    record_type: string;
    games_at_record: number;
    wins: number;
    losses: number;
    deck_snapshot: string;
    created_at: string;
  }>(
    'SELECT * FROM deck_win_rate_records WHERE deck_id = ? ORDER BY created_at DESC',
    id
  );

  const winRateRecords: DeckWinRateRecord[] = records.map((r) => ({
    ...r,
    record_type: r.record_type as 'original' | 'modified',
    win_rate:
      r.wins + r.losses > 0
        ? Math.round((r.wins / (r.wins + r.losses)) * 10000) / 100
        : 0,
  }));

  return {
    ...deck,
    win_rate_records: winRateRecords,
  };
}

export async function createDeck(input: CreateDeckInput): Promise<Deck> {
  const db = getDatabase();
  const result = db.runSync('INSERT INTO decks (name) VALUES (?)', input.name);
  const deck = db.getFirstSync<Deck>('SELECT * FROM decks WHERE id = ?', result.lastInsertRowId);
  return deck!;
}

export async function updateDeck(id: number, name: string): Promise<void> {
  const db = getDatabase();
  db.runSync('UPDATE decks SET name = ? WHERE id = ?', name, id);
}

export async function markDeckAsModified(id: number): Promise<void> {
  const db = getDatabase();
  db.runSync('UPDATE decks SET is_modified = 1, total_games = 0 WHERE id = ?', id);
}

export async function deleteDeck(id: number): Promise<void> {
  const db = getDatabase();
  // 级联删除对局记录和胜率记录
  db.runSync('DELETE FROM duel_records WHERE deck_id = ?', id);
  db.runSync('DELETE FROM deck_win_rate_records WHERE deck_id = ?', id);
  db.runSync('DELETE FROM decks WHERE id = ?', id);
}

export async function incrementDeckGames(id: number): Promise<void> {
  const db = getDatabase();
  db.runSync('UPDATE decks SET total_games = total_games + 1 WHERE id = ?', id);
}

export async function getDeckWinRateSummaries(): Promise<DeckWinRateSummary[]> {
  const db = getDatabase();
  const rows = db.getAllSync<{
    deck_id: number;
    deck_name: string;
    total_games: number;
    wins: number;
    losses: number;
    win_rate: number;
  }>(`
    SELECT
      d.id AS deck_id,
      d.name AS deck_name,
      d.total_games,
      COALESCE(SUM(CASE WHEN dr.result = 'win' THEN 1 ELSE 0 END), 0) AS wins,
      COALESCE(SUM(CASE WHEN dr.result = 'lose' THEN 1 ELSE 0 END), 0) AS losses,
      CASE
        WHEN COUNT(dr.id) > 0 THEN
          CAST(SUM(CASE WHEN dr.result = 'win' THEN 1 ELSE 0 END) AS REAL) / COUNT(dr.id)
        ELSE 0
      END AS win_rate
    FROM decks d
    LEFT JOIN duel_records dr ON d.id = dr.deck_id
    GROUP BY d.id
    ORDER BY win_rate DESC
  `);

  return rows.map((row) => ({
    deckId: row.deck_id,
    deckName: row.deck_name,
    totalGames: row.total_games,
    wins: row.wins,
    losses: row.losses,
    winRate: Math.round(row.win_rate * 10000) / 100,
  }));
}
