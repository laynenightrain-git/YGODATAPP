import * as deckRepo from '../repositories/deckRepository';
import * as winRateRepo from '../repositories/winRateRepository';

/**
 * 对局添加后触发胜率计算
 *
 * 逻辑：
 * 1. 增加卡组对局计数
 * 2. 检查 total_games % 15 == 0（每15场生成一次记录）
 * 3. 计算最近 15 场胜率
 * 4. 根据 is_modified 决定 record_type：
 *    - false → 生成/更新 original 记录
 *    - true  → 生成 modified 记录（最多保留2条）
 */
export async function afterDuelAdded(deckId: number): Promise<void> {
  // 1. 增加对局计数
  await deckRepo.incrementDeckGames(deckId);

  // 2. 获取卡组信息
  const deck = await deckRepo.getDeckById(deckId);
  if (!deck) return;

  // 3. 检查是否是 15 的倍数
  if (deck.total_games % 15 !== 0) return;

  // 4. 计算最近 15 场胜率
  const recentResults = await winRateRepo.getRecentDuelResults(deckId, 15);
  let wins = 0;
  let losses = 0;
  for (const r of recentResults) {
    if (r.result === 'win') {
      wins++;
    } else if (r.result === 'lose') {
      losses++;
    }
  }

  const gamesAtRecord = deck.total_games;
  const deckSnapshot = JSON.stringify({ name: deck.name, total_games: gamesAtRecord });

  // 5. 根据 is_modified 决定 record_type
  const isModified = deck.is_modified === 1;

  if (!isModified) {
    // 非修改卡组：生成/更新 original 记录
    await winRateRepo.updateOriginalRecord(deckId, wins, losses, gamesAtRecord);
  } else {
    // 修改卡组：生成 modified 记录
    const modifiedCount = await winRateRepo.getModifiedRecordCount(deckId);

    if (modifiedCount < 2) {
      // 直接创建
      await winRateRepo.createWinRateRecord(
        deckId,
        'modified',
        gamesAtRecord,
        wins,
        losses,
        deckSnapshot
      );
    } else {
      // 已满 2 条，先删除最早的再创建
      await winRateRepo.deleteOldestModifiedRecord(deckId);
      await winRateRepo.createWinRateRecord(
        deckId,
        'modified',
        gamesAtRecord,
        wins,
        losses,
        deckSnapshot
      );
    }
  }
}
