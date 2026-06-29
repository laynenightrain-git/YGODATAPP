import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme';
import { StatCard } from '../../src/components/StatCard';
import { useStatsStore } from '../../src/stores/statsStore';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const { stats, deckSummaries, loadStats, loadDeckSummaries } =
    useStatsStore();

  useEffect(() => {
    loadStats();
    loadDeckSummaries();
  }, []);

  const sortedSummaries = [...deckSummaries].sort(
    (a, b) => b.winRate - a.winRate
  );

  const maxWinRate = Math.max(...sortedSummaries.map((s) => s.winRate), 1);

  // 模拟饼图数据
  const firstTurnPct = stats
    ? Math.round(
        (stats.firstTurnCount /
          (stats.firstTurnCount + stats.secondTurnCount || 1)) *
          100
      )
    : 0;
  const secondTurnPct = 100 - firstTurnPct;

  // 近期趋势模拟数据
  const trendData = stats
    ? [
        { label: '先手胜率', value: stats.firstTurnWinRate, color: Colors.firstTurn },
        { label: '后手胜率', value: stats.secondTurnWinRate, color: Colors.secondTurn },
        { label: '总胜率', value: stats.winRate, color: Colors.accent },
      ]
    : [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 总览统计 */}
        <Text style={styles.sectionTitle}>总览统计</Text>
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
        <View style={styles.statsGrid}>
          <StatCard
            label="后手胜率"
            value={stats ? `${stats.secondTurnWinRate}%` : '0%'}
            color={Colors.secondTurn}
          />
          <StatCard
            label="总胜场"
            value={stats?.totalWins ?? 0}
            color={Colors.win}
          />
        </View>

        {/* 先后手比例 */}
        <Text style={styles.sectionTitle}>先后手比例</Text>
        <View style={styles.chartCard}>
          <View style={styles.pieChartContainer}>
            {/* 简化的环形图模拟 */}
            <View style={styles.pieRing}>
              <View
                style={[
                  styles.pieHalf,
                  styles.pieFirstHalf,
                  { width: `${firstTurnPct}%` },
                ]}
              >
                <View
                  style={[
                    styles.pieSegment,
                    {
                      backgroundColor: Colors.firstTurn,
                      width: '100%',
                      borderTopLeftRadius: 8,
                      borderBottomLeftRadius: 8,
                    },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.pieHalf,
                  { width: `${secondTurnPct}%` },
                ]}
              >
                <View
                  style={[
                    styles.pieSegment,
                    {
                      backgroundColor: Colors.secondTurn,
                      width: '100%',
                      borderTopRightRadius: 8,
                      borderBottomRightRadius: 8,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.pieCenter}>
              <Text style={styles.pieCenterValue}>{stats?.totalDuels ?? 0}</Text>
              <Text style={styles.pieCenterLabel}>总对局</Text>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: Colors.firstTurn }]}
              />
              <Text style={styles.legendLabel}>先手</Text>
              <Text style={styles.legendValue}>
                {stats?.firstTurnCount ?? 0} ({firstTurnPct}%)
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: Colors.secondTurn },
                ]}
              />
              <Text style={styles.legendLabel}>后手</Text>
              <Text style={styles.legendValue}>
                {stats?.secondTurnCount ?? 0} ({secondTurnPct}%)
              </Text>
            </View>
          </View>
        </View>

        {/* 卡组胜率对比 */}
        <Text style={styles.sectionTitle}>卡组胜率对比</Text>
        {sortedSummaries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无卡组数据</Text>
          </View>
        ) : (
          <View style={styles.chartCard}>
            {sortedSummaries.map((summary) => {
              const barWidth =
                maxWinRate > 0
                  ? Math.max((summary.winRate / maxWinRate) * 100, 4)
                  : 0;
              return (
                <View key={summary.deckId} style={styles.barItem}>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {summary.deckName}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${barWidth}%`,
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
                  <Text
                    style={[
                      styles.barValue,
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
              );
            })}
          </View>
        )}

        {/* 胜率趋势 */}
        <Text style={styles.sectionTitle}>胜率概览</Text>
        <View style={styles.chartCard}>
          {trendData.map((item) => (
            <View key={item.label} style={styles.trendItem}>
              <View style={styles.trendLabelRow}>
                <View
                  style={[styles.trendDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.trendLabel}>{item.label}</Text>
              </View>
              <View style={styles.trendBarTrack}>
                <View
                  style={[
                    styles.trendBarFill,
                    {
                      width: `${Math.min(item.value, 100)}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.trendValue, { color: item.color }]}>
                {item.value}%
              </Text>
            </View>
          ))}
        </View>
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
  chartCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  // 饼图模拟
  pieChartContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pieRing: {
    flexDirection: 'row',
    height: 16,
    width: '80%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  pieHalf: {
    overflow: 'hidden',
  },
  pieFirstHalf: {},
  pieSegment: {
    height: '100%',
  },
  pieCenter: {
    alignItems: 'center',
    marginTop: 12,
  },
  pieCenterValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  pieCenterLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  // 柱状图
  barItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: {
    width: 80,
    fontSize: 12,
    color: Colors.text,
    marginRight: 8,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  barValue: {
    width: 45,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    marginLeft: 8,
  },
  // 趋势
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  trendLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    gap: 6,
  },
  trendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trendLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  trendBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trendBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  trendValue: {
    width: 45,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    marginLeft: 8,
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
});
