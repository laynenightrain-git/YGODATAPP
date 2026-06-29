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
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  coinStatsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  coinStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  coinWinLabel: {
    fontSize: 13,
    color: Colors.coinWin,
    marginBottom: 6,
  },
  coinLoseLabel: {
    fontSize: 13,
    color: Colors.coinLose,
    marginBottom: 6,
  },
  coinStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  coinDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  turnStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  turnStatItem: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  turnStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  turnStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rankingList: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  rankingInfo: {
    flex: 1,
    marginRight: 12,
  },
  rankingDeckName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  rankingWinRate: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
  },
  statsButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  statsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.background,
  },
});
