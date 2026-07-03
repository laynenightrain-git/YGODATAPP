import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme';
import { StatCard } from '../../src/components/StatCard';
import { useStatsStore } from '../../src/stores/statsStore';
import { MonthlyStats } from '../../src/types';

export default function StatsScreen() {
  const {
    stats,
    deckSummaries,
    monthlyStats,
    availableMonths,
    opponentDeckSummaries,
    loadStats,
    loadDeckSummaries,
    loadMonthlyStats,
    loadAvailableMonths,
    loadOpponentDeckSummaries,
  } = useStatsStore();

  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useEffect(() => {
    loadStats();
    loadDeckSummaries();
    loadAvailableMonths();
    loadOpponentDeckSummaries();
  }, []);

  // 默认选中最新月份
  useEffect(() => {
    if (availableMonths.length > 0 && selectedYear === 0) {
      const latest = availableMonths[0];
      setSelectedYear(latest.year);
      setSelectedMonth(latest.month);
    }
  }, [availableMonths]);

  // 选中月份后加载数据
  useEffect(() => {
    if (selectedYear > 0 && selectedMonth > 0) {
      loadMonthlyStats(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth]);

  const years = [...new Set(availableMonths.map((m) => m.year))].sort(
    (a, b) => b - a
  );
  const monthsForYear = availableMonths
    .filter((m) => m.year === selectedYear)
    .sort((a, b) => b.month - a.month);

  const getMonthLabel = (m: number) => `${m}月`;

  const sortedSummaries = [...deckSummaries].sort(
    (a, b) => b.winRate - a.winRate
  );
  const maxWinRate = Math.max(...sortedSummaries.map((s) => s.winRate), 1);

  const sortedOpponentSummaries = [...opponentDeckSummaries].sort(
    (a, b) => b.totalGames - a.totalGames
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 年月选择器 */}
        <View style={styles.datePickerRow}>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowYearPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.pickerButtonText}>
              {selectedYear || '选择年'} ▼
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowMonthPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.pickerButtonText}>
              {selectedMonth ? getMonthLabel(selectedMonth) : '选择月'} ▼
            </Text>
          </TouchableOpacity>
        </View>

        {/* 月度统计 */}
        {monthlyStats && (
          <View>
            <Text style={styles.sectionTitle}>
              {selectedYear}年{selectedMonth}月统计
            </Text>
            <View style={styles.statsGrid}>
              <StatCard
                label="总对局"
                value={monthlyStats.totalDuels}
                color={Colors.primary}
              />
              <StatCard
                label="胜率"
                value={`${monthlyStats.winRate}%`}
                color={
                  monthlyStats.winRate >= 50 ? Colors.win : Colors.lose
                }
              />
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                label="硬币胜率"
                value={`${monthlyStats.coinWinRate}%`}
                color={Colors.coinWin}
              />
              <StatCard
                label="掉线次数"
                value={monthlyStats.disconnectCount}
                color={Colors.lose}
              />
            </View>
            <View style={styles.monthlyDetailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>胜</Text>
                <Text style={[styles.detailValue, { color: Colors.win }]}>
                  {monthlyStats.wins}
                </Text>
                <Text style={styles.detailLabel}>负</Text>
                <Text style={[styles.detailValue, { color: Colors.lose }]}>
                  {monthlyStats.losses}
                </Text>
                <Text style={styles.detailLabel}>平</Text>
                <Text style={[styles.detailValue, { color: Colors.draw }]}>
                  {monthlyStats.draws}
                </Text>
              </View>
            </View>
          </View>
        )}

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

        {/* 对手卡组统计 */}
        <Text style={styles.sectionTitle}>对手卡组统计</Text>
        {sortedOpponentSummaries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无对手卡组数据</Text>
          </View>
        ) : (
          <View style={styles.chartCard}>
            {sortedOpponentSummaries.map((item) => (
              <View key={item.opponentName} style={styles.barItem}>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {item.opponentName}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(item.winRate, 100)}%`,
                        backgroundColor:
                          item.winRate >= 60
                            ? Colors.win
                            : item.winRate >= 40
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
                        item.winRate >= 60
                          ? Colors.win
                          : item.winRate >= 40
                          ? Colors.draw
                          : Colors.lose,
                    },
                  ]}
                >
                  {item.winRate}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 年份选择 Modal */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择年份</Text>
            <FlatList
              data={years}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item === selectedYear && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setSelectedYear(item);
                    // 切换到该年可用的第一个月份
                    const firstMonth = availableMonths.find(
                      (m) => m.year === item
                    );
                    if (firstMonth) {
                      setSelectedMonth(firstMonth.month);
                    }
                    setShowYearPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === selectedYear && styles.modalItemTextActive,
                    ]}
                  >
                    {item}年
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 月份选择 Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择月份</Text>
            <FlatList
              data={monthsForYear}
              keyExtractor={(item) => `${item.year}-${item.month}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.month === selectedMonth && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setSelectedMonth(item.month);
                    setShowMonthPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item.month === selectedMonth && styles.modalItemTextActive,
                    ]}
                  >
                    {item.month}月
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  // 年月选择器
  datePickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  // 月度详情
  monthlyDetailCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  barItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  barLabel: {
    width: 70,
    fontSize: 11,
    color: Colors.text,
    marginRight: 8,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 4,
  },
  barValue: {
    width: 40,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    marginLeft: 8,
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    width: '70%',
    maxHeight: '60%',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemActive: {
    backgroundColor: Colors.accent,
  },
  modalItemText: {
    fontSize: 15,
    color: Colors.text,
    textAlign: 'center',
  },
  modalItemTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
});
