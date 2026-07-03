import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../src/theme';
import { StatCard } from '../../src/components/StatCard';
import { useStatsStore } from '../../src/stores/statsStore';

export default function DashboardScreen() {
  const { stats, deckSummaries, loading, loadStats, loadDeckSummaries } =
    useStatsStore();

  useEffect(() => {
    loadStats();
    loadDeckSummaries();
  }, []);

  const sortedSummaries = [...deckSummaries]
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 统计卡片区 */}
        <Text style={styles.sectionTitle}>数据概览</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="总对局数"
            value={stats?.totalDuels ?? 0}
            color={Colors.primary}
          />
          <StatCard
            label="总胜率"
            value={stats ? `${stats.winRate}%` : '0%'}
            color={stats && stats.winRate >= 50 ? Colors.win : Colors.lose}
          />
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            label="硬币胜率"
            value={stats ? `${stats.coinWinRate}%` : '0%'}
            color={Colors.coinWin}
          />
          <StatCard
            label="先手胜率"
            value={stats ? `${stats.firstTurnWinRate}%` : '0%'}
            color={Colors.firstTurn}
          />
        </View>

        {/* 硬币胜负 → 对局胜率 */}
        <View style={styles.statsGrid}>
          <View style={styles.miniCard}>
            <Text style={styles.miniCardLabel}>硬币胜→对局胜率</Text>
            <Text style={[styles.miniCardValue, { color: Colors.coinWin }]}>
              {stats ? `${stats.coinWinDuelWinRate}%` : '0%'}
            </Text>
            <Text style={styles.miniCardSub}>
              胜场 {stats?.coinWinWins ?? 0}
            </Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniCardLabel}>硬币负→对局胜率</Text>
            <Text style={[styles.miniCardValue, { color: Colors.coinLose }]}>
              {stats ? `${stats.coinLoseDuelWinRate}%` : '0%'}
            </Text>
            <Text style={styles.miniCardSub}>
              胜场 {stats?.coinLoseWins ?? 0}
            </Text>
          </View>
        </View>

        {/* 掉线次数 */}
        <View style={styles.disconnectCard}>
          <Text style={styles.disconnectLabel}>掉线次数</Text>
          <Text style={[styles.disconnectValue, { color: Colors.lose }]}>
            {stats?.disconnectCount ?? 0}
          </Text>
        </View>

        {/* 投币统计 */}
        <Text style={styles.sectionTitle}>投币统计</Text>
        <View style={styles.coinStatsRow}>
          <View style={styles.coinStatItem}>
            <Text style={styles.coinWinLabel}>硬币胜</Text>
            <Text style={[styles.coinStatValue, { color: Colors.coinWin }]}>
              {stats?.coinWins ?? 0}
            </Text>
          </View>
          <View style={styles.coinDivider} />
          <View style={styles.coinStatItem}>
            <Text style={styles.coinLoseLabel}>硬币负</Text>
            <Text style={[styles.coinStatValue, { color: Colors.coinLose }]}>
              {stats?.coinLosses ?? 0}
            </Text>
          </View>
        </View>

        <View style={styles.turnStatsRow}>
          <View style={styles.turnStatItem}>
            <Text style={styles.turnStatLabel}>先手次数</Text>
            <Text style={[styles.turnStatValue, { color: Colors.firstTurn }]}>
              {stats?.firstTurnCount ?? 0}
            </Text>
          </View>
          <View style={styles.turnStatItem}>
            <Text style={styles.turnStatLabel}>后手次数</Text>
            <Text style={[styles.turnStatValue, { color: Colors.secondTurn }]}>
              {stats?.secondTurnCount ?? 0}
            </Text>
          </View>
        </View>

        {/* 卡组胜率排行 */}
        <Text style={styles.sectionTitle}>卡组胜率 TOP5</Text>
        {sortedSummaries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无数据，先去添加对局吧</Text>
          </View>
        ) : (
          <View style={styles.rankingList}>
            {sortedSummaries.map((summary, index) => (
              <View key={summary.deckId} style={styles.rankingItem}>
                <View style={styles.rankBadge}>
                  <Text
                    style={[
                      styles.rankNumber,
                      index < 3 && { color: Colors.accent },
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.rankingInfo}>
                  <Text style={styles.rankingDeckName}>{summary.deckName}</Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(summary.winRate, 100)}%`,
                          backgroundColor:
                            summary.winRate >= 60
                              ? Colors.win
                              : summary.winRate >= 40
                              ? Colors.draw
                              : Colors.lose,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text
                  style={[
                    styles.rankingWinRate,
                    {
                      color:
                        summary.winRate >= 60
                          ? Colors.win
                          : summary.winRate >= 40
                          ? Colors.draw
                          : Colors.lose,
                    },
                  ]}
                >
                  {summary.winRate}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 详细统计入口 */}
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => router.push('/stats/index')}
          activeOpacity={0.7}
        >
          <Text style={styles.statsButtonText}>查看详细统计</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  // 小卡片：硬币胜→对局胜率
  miniCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniCardLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  miniCardValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  miniCardSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // 掉线卡片
  disconnectCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  disconnectLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  disconnectValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  coinStatsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  coinStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  coinWinLabel: {
    fontSize: 12,
    color: Colors.coinWin,
    marginBottom: 4,
  },
  coinLoseLabel: {
    fontSize: 12,
    color: Colors.coinLose,
    marginBottom: 4,
  },
  coinStatValue: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  coinDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  turnStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  turnStatItem: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  turnStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  turnStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rankingList: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  rankingInfo: {
    flex: 1,
    marginRight: 10,
  },
  rankingDeckName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  rankingWinRate: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 45,
    textAlign: 'right',
  },
  statsButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  statsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.background,
  },
});
