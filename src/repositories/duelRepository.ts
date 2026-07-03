import { getDatabase } from '../database/client';
import { DuelRecord, CreateDuelInput, DashboardStats, MonthlyStats } from '../types';

interface DuelRow {
  id: number;
  deck_id: number;
  deck_name?: string;
  coin_result: string;
  turn: string;
  result: string;
  opponent_deck: string;
  notes: string;
  duel_date: string;
  disconnected: number;
}

function mapRowToDuel(row: DuelRow): DuelRecord {
  return {
    id: row.id,
    deck_id: row.deck_id,
    deck_name: row.deck_name,
    coin_result: row.coin_result as DuelRecord['coin_result'],
    turn: row.turn as DuelRecord['turn'],
    result: row.result as DuelRecord['result'],
    opponent_deck: row.opponent_deck ?? '',
    notes: row.notes ?? '',
    duel_date: row.duel_date,
    disconnected: row.disconnected,
  };
}

export async function getAllDuels(): Promise<DuelRecord[]> {
  const db = getDatabase();
  const rows = db.getAllSync<DuelRow>(
    `SELECT dr.*, d.name AS deck_name
     FROM duel_records dr
     LEFT JOIN decks d ON dr.deck_id = d.id
     ORDER BY dr.duel_date DESC`
  );
  return rows.map(mapRowToDuel);
}

export async function getDuelsByDeckId(deckId: number): Promise<DuelRecord[]> {
  const db = getDatabase();
  const rows = db.getAllSync<DuelRow>(
    `SELECT dr.*, d.name AS deck_name
     FROM duel_records dr
     LEFT JOIN decks d ON dr.deck_id = d.id
     WHERE dr.deck_id = ?
     ORDER BY dr.duel_date DESC`,
    deckId
  );
  return rows.map(mapRowToDuel);
}

export async function getDuelById(id: number): Promise<DuelRecord | null> {
  const db = getDatabase();
  const row = db.getFirstSync<DuelRow>(
    `SELECT dr.*, d.name AS deck_name
     FROM duel_records dr
     LEFT JOIN decks d ON dr.deck_id = d.id
     WHERE dr.id = ?`,
    id
  );
  return row ? mapRowToDuel(row) : null;
}

export async function createDuel(input: CreateDuelInput): Promise<DuelRecord> {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO duel_records (deck_id, coin_result, turn, result, opponent_deck, notes, disconnected, duel_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
    input.deck_id,
    input.coin_result,
    input.turn,
    input.result,
    input.opponent_deck,
    input.notes ?? '',
    input.disconnected ? 1 : 0
  );
  const row = db.getFirstSync<DuelRow>(
    'SELECT * FROM duel_records WHERE id = ?',
    result.lastInsertRowId
  );
  return mapRowToDuel(row!);
}

export async function deleteDuel(id: number): Promise<void> {
  const db = getDatabase();
  db.runSync('DELETE FROM duel_records WHERE id = ?', id);
}

export async function updateDuel(
  id: number,
  input: Partial<CreateDuelInput>
): Promise<DuelRecord | null> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (input.deck_id !== undefined) {
    fields.push('deck_id = ?');
    values.push(input.deck_id);
  }
  if (input.coin_result !== undefined) {
    fields.push('coin_result = ?');
    values.push(input.coin_result);
  }
  if (input.turn !== undefined) {
    fields.push('turn = ?');
    values.push(input.turn);
  }
  if (input.result !== undefined) {
    fields.push('result = ?');
    values.push(input.result);
  }
  if (input.opponent_deck !== undefined) {
    fields.push('opponent_deck = ?');
    values.push(input.opponent_deck);
  }
  if (input.notes !== undefined) {
    fields.push('notes = ?');
    values.push(input.notes);
  }
  if (input.disconnected !== undefined) {
    fields.push('disconnected = ?');
    values.push(input.disconnected ? 1 : 0);
  }

  if (fields.length === 0) return getDuelById(id);

  values.push(id);
  db.runSync(`UPDATE duel_records SET ${fields.join(', ')} WHERE id = ?`, ...values);

  const row = db.getFirstSync<DuelRow>(
    `SELECT dr.*, d.name AS deck_name
     FROM duel_records dr
     LEFT JOIN decks d ON dr.deck_id = d.id
     WHERE dr.id = ?`,
    id
  );
  return row ? mapRowToDuel(row) : null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getDatabase();
  const row = db.getFirstSync<{
    total_duels: number;
    total_wins: number;
    total_losses: number;
    total_draws: number;
    coin_wins: number;
    coin_losses: number;
    first_count: number;
    second_count: number;
    first_wins: number;
    second_wins: number;
    coin_win_duel_wins: number;
    coin_lose_duel_wins: number;
    disconnect_count: number;
  }>(`
    SELECT
      COUNT(*) AS total_duels,
      COALESCE(SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END), 0) AS total_wins,
      COALESCE(SUM(CASE WHEN result = 'lose' THEN 1 ELSE 0 END), 0) AS total_losses,
      COALESCE(SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END), 0) AS total_draws,
      COALESCE(SUM(CASE WHEN coin_result = 'win' THEN 1 ELSE 0 END), 0) AS coin_wins,
      COALESCE(SUM(CASE WHEN coin_result = 'lose' THEN 1 ELSE 0 END), 0) AS coin_losses,
      COALESCE(SUM(CASE WHEN turn = 'first' THEN 1 ELSE 0 END), 0) AS first_count,
      COALESCE(SUM(CASE WHEN turn = 'second' THEN 1 ELSE 0 END), 0) AS second_count,
      COALESCE(SUM(CASE WHEN turn = 'first' AND result = 'win' THEN 1 ELSE 0 END), 0) AS first_wins,
      COALESCE(SUM(CASE WHEN turn = 'second' AND result = 'win' THEN 1 ELSE 0 END), 0) AS second_wins,
      COALESCE(SUM(CASE WHEN coin_result = 'win' AND result = 'win' THEN 1 ELSE 0 END), 0) AS coin_win_duel_wins,
      COALESCE(SUM(CASE WHEN coin_result = 'lose' AND result = 'win' THEN 1 ELSE 0 END), 0) AS coin_lose_duel_wins,
      COALESCE(SUM(disconnected), 0) AS disconnect_count
    FROM duel_records
  `);

  if (!row) {
    return {
      totalDuels: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      winRate: 0,
      coinWins: 0,
      coinLosses: 0,
      coinWinRate: 0,
      firstTurnCount: 0,
      secondTurnCount: 0,
      firstTurnWinRate: 0,
      secondTurnWinRate: 0,
      goingFirstWins: 0,
      goingSecondWins: 0,
      coinWinDuelWinRate: 0,
      coinLoseDuelWinRate: 0,
      coinWinWins: 0,
      coinLoseWins: 0,
      disconnectCount: 0,
    };
  }

  const totalDuels = row.total_duels;
  const totalWins = row.total_wins;
  const coinWins = row.coin_wins;
  const coinLosses = row.coin_losses;

  const winRate = totalDuels > 0 ? Math.round((totalWins / totalDuels) * 10000) / 100 : 0;
  const coinWinRate = coinWins + coinLosses > 0
    ? Math.round((coinWins / (coinWins + coinLosses)) * 10000) / 100
    : 0;
  const firstTurnWinRate = row.first_count > 0
    ? Math.round((row.first_wins / row.first_count) * 10000) / 100
    : 0;
  const secondTurnWinRate = row.second_count > 0
    ? Math.round((row.second_wins / row.second_count) * 10000) / 100
    : 0;
  const coinWinDuelWinRate = coinWins > 0
    ? Math.round((row.coin_win_duel_wins / coinWins) * 10000) / 100
    : 0;
  const coinLoseDuelWinRate = coinLosses > 0
    ? Math.round((row.coin_lose_duel_wins / coinLosses) * 10000) / 100
    : 0;

  return {
    totalDuels,
    totalWins,
    totalLosses: row.total_losses,
    totalDraws: row.total_draws,
    winRate,
    coinWins,
    coinLosses,
    coinWinRate,
    firstTurnCount: row.first_count,
    secondTurnCount: row.second_count,
    firstTurnWinRate,
    secondTurnWinRate,
    goingFirstWins: row.first_wins,
    goingSecondWins: row.second_wins,
    coinWinDuelWinRate,
    coinLoseDuelWinRate,
    coinWinWins: row.coin_win_duel_wins,
    coinLoseWins: row.coin_lose_duel_wins,
    disconnectCount: row.disconnect_count,
  };
}

export async function getMonthlyStats(year: number, month: number): Promise<MonthlyStats> {
  const db = getDatabase();
  const row = db.getFirstSync<{
    total_duels: number;
    wins: number;
    losses: number;
    draws: number;
    coin_wins: number;
    coin_losses: number;
    disconnect_count: number;
  }>(`
    SELECT
      COUNT(*) AS total_duels,
      COALESCE(SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END), 0) AS wins,
      COALESCE(SUM(CASE WHEN result = 'lose' THEN 1 ELSE 0 END), 0) AS losses,
      COALESCE(SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END), 0) AS draws,
      COALESCE(SUM(CASE WHEN coin_result = 'win' THEN 1 ELSE 0 END), 0) AS coin_wins,
      COALESCE(SUM(CASE WHEN coin_result = 'lose' THEN 1 ELSE 0 END), 0) AS coin_losses,
      COALESCE(SUM(disconnected), 0) AS disconnect_count
    FROM duel_records
    WHERE strftime('%Y', duel_date) = ?
      AND strftime('%m', duel_date) = ?
  `, String(year), String(month).padStart(2, '0'));

  if (!row || row.total_duels === 0) {
    return {
      year,
      month,
      totalDuels: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      coinWinRate: 0,
      disconnectCount: 0,
    };
  }

  const totalDuels = row.total_duels;
  const coinTotal = row.coin_wins + row.coin_losses;

  return {
    year,
    month,
    totalDuels,
    wins: row.wins,
    losses: row.losses,
    draws: row.draws,
    winRate: totalDuels > 0 ? Math.round((row.wins / totalDuels) * 10000) / 100 : 0,
    coinWinRate: coinTotal > 0 ? Math.round((row.coin_wins / coinTotal) * 10000) / 100 : 0,
    disconnectCount: row.disconnect_count,
  };
}

export async function getAvailableMonths(): Promise<{ year: number; month: number }[]> {
  const db = getDatabase();
  const rows = db.getAllSync<{ year: number; month: number }>(`
    SELECT DISTINCT
      CAST(strftime('%Y', duel_date) AS INTEGER) AS year,
      CAST(strftime('%m', duel_date) AS INTEGER) AS month
    FROM duel_records
    WHERE duel_date IS NOT NULL
    ORDER BY year DESC, month DESC
  `);
  return rows;
}
