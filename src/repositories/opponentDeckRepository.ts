import { getDatabase } from '../database/client';
import { OpponentDeck, OpponentDeckSummary } from '../types';

export async function upsertOpponentDeck(name: string, won: boolean): Promise<void> {
  const db = getDatabase();
  const existing = db.getFirstSync<{ id: number; total_games: number; wins: number }>(
    'SELECT id, total_games, wins FROM opponent_decks WHERE name = ?',
    name
  );

  if (existing) {
    db.runSync(
      `UPDATE opponent_decks
       SET total_games = total_games + 1,
           wins = wins + ?
       WHERE id = ?`,
      won ? 1 : 0,
      existing.id
    );
  } else {
    db.runSync(
      `INSERT INTO opponent_decks (name, total_games, wins)
       VALUES (?, 1, ?)`,
      name,
      won ? 1 : 0
    );
  }
}

export async function getAllOpponentDecks(): Promise<OpponentDeck[]> {
  const db = getDatabase();
  return db.getAllSync<OpponentDeck>(
    'SELECT * FROM opponent_decks ORDER BY total_games DESC'
  );
}

export async function getOpponentDeckSummaries(): Promise<OpponentDeckSummary[]> {
  const db = getDatabase();
  const rows = db.getAllSync<{
    name: string;
    total_games: number;
    wins: number;
  }>(
    `SELECT name, total_games, wins
     FROM opponent_decks
     ORDER BY (CAST(wins AS REAL) / total_games) DESC`
  );

  return rows.map((row) => ({
    opponentName: row.name,
    totalGames: row.total_games,
    wins: row.wins,
    winRate:
      row.total_games > 0
        ? Math.round((row.wins / row.total_games) * 10000) / 100
        : 0,
  }));
}
