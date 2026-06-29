import { getDatabase } from '../database/client';
import { DeckWinRateRecord, RecordType } from '../types';

export async function getRecordsByDeckId(
  deckId: number,
  recordType?: RecordType
): Promise<DeckWinRateRecord[]> {
  const db = getDatabase();
  if (recordType) {
    return db.getAllSync<DeckWinRateRecord>(
      'SELECT * FROM deck_win_rate_records WHERE deck_id = ? AND record_type = ? ORDER BY created_at DESC',
      deckId,
      recordType
    );
  }
  return db.getAllSync<DeckWinRateRecord>(
    'SELECT * FROM deck_win_rate_records WHERE deck_id = ? ORDER BY created_at DESC',
    deckId
  );
}

export async function getModifiedRecordCount(deckId: number): Promise<number> {
  const db = getDatabase();
  const row = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM deck_win_rate_records WHERE deck_id = ? AND record_type = 'modified'",
    deckId
  );
  return row?.count ?? 0;
}

export async function createWinRateRecord(
  deckId: number,
  recordType: RecordType,
  gamesAtRecord: number,
  wins: number,
  losses: number,
  deckSnapshot: string
): Promise<DeckWinRateRecord> {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO deck_win_rate_records (deck_id, record_type, games_at_record, wins, losses, deck_snapshot)
     VALUES (?, ?, ?, ?, ?, ?)`,
    deckId,
    recordType,
    gamesAtRecord,
    wins,
    losses,
    deckSnapshot
  );
  const record = db.getFirstSync<DeckWinRateRecord>(
    'SELECT * FROM deck_win_rate_records WHERE id = ?',
    result.lastInsertRowId
  );
  return record!;
}

export async function updateOriginalRecord(
  deckId: number,
  wins: number,
  losses: number,
  gamesAtRecord: number
): Promise<void> {
  const db = getDatabase();
  db.runSync(
    `UPDATE deck_win_rate_records
     SET wins = ?, losses = ?, games_at_record = ?, created_at = datetime('now', 'localtime')
     WHERE deck_id = ? AND record_type = 'original'`,
    wins,
    losses,
    gamesAtRecord,
    deckId
  );
}

export async function deleteOldestModifiedRecord(deckId: number): Promise<void> {
  const db = getDatabase();
  const record = db.getFirstSync<DeckWinRateRecord>(
    "SELECT id FROM deck_win_rate_records WHERE deck_id = ? AND record_type = 'modified' ORDER BY created_at ASC LIMIT 1",
    deckId
  );
  if (record) {
    db.runSync('DELETE FROM deck_win_rate_records WHERE id = ?', record.id);
  }
}

export async function getRecentDuelResults(
  deckId: number,
  limit: number
): Promise<{ result: string }[]> {
  const db = getDatabase();
  return db.getAllSync<{ result: string }>(
    'SELECT result FROM duel_records WHERE deck_id = ? ORDER BY created_at DESC LIMIT ?',
    deckId,
    limit
  );
}
