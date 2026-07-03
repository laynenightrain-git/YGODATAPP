// ==================== 卡组相关类型 ====================

export interface Deck {
  id: number;
  name: string;
  total_games: number;
  is_modified: number; // 0 或 1，SQLite 存储
  created_at: string;
}

export interface DeckDetail extends Deck {
  win_rate_records: DeckWinRateRecord[];
}

export interface CreateDeckInput {
  name: string;
}

// ==================== 对手卡组类型 ====================

export interface OpponentDeck {
  id: number;
  name: string;
  total_games: number;
  wins: number;
  created_at: string;
}

export interface OpponentDeckSummary {
  opponentName: string;
  totalGames: number;
  wins: number;
  winRate: number;
}

// ==================== 胜率记录类型 ====================

export type RecordType = 'original' | 'modified';

export interface DeckWinRateRecord {
  id: number;
  deck_id: number;
  record_type: RecordType;
  games_at_record: number;
  wins: number;
  losses: number;
  deck_snapshot: string;
  created_at: string;
  win_rate: number;
}

export interface DeckWinRateSummary {
  deckId: number;
  deckName: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
}

// ==================== 对局相关枚举类型 ====================

export type CoinResult = 'win' | 'lose';
export type Turn = 'first' | 'second';
export type DuelResult = 'win' | 'lose' | 'draw';

// ==================== 对局记录类型 ====================

export interface DuelRecord {
  id: number;
  deck_id: number;
  deck_name?: string;
  coin_result: CoinResult;
  turn: Turn;
  result: DuelResult;
  opponent_deck: string;
  notes: string;
  duel_date: string;
  disconnected: number; // 0 或 1
}

export interface CreateDuelInput {
  deck_id: number;
  coin_result: CoinResult;
  turn: Turn;
  result: DuelResult;
  opponent_deck: string; // 必填
  notes?: string;
  disconnected?: boolean;
}

// ==================== 仪表盘统计类型 ====================

export interface DashboardStats {
  totalDuels: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winRate: number;
  coinWins: number;
  coinLosses: number;
  coinWinRate: number;
  firstTurnCount: number;
  secondTurnCount: number;
  firstTurnWinRate: number;
  secondTurnWinRate: number;
  goingFirstWins: number;
  goingSecondWins: number;
  // 新增：硬币胜负各自胜率
  coinWinDuelWinRate: number;
  coinLoseDuelWinRate: number;
  coinWinWins: number;
  coinLoseWins: number;
  // 新增：掉线统计
  disconnectCount: number;
}

// ==================== 按月统计 ====================

export interface MonthlyStats {
  year: number;
  month: number;
  totalDuels: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  coinWinRate: number;
  disconnectCount: number;
}
