import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/theme';
import { useDeckStore } from '../../src/stores/deckStore';
import { useDuelStore } from '../../src/stores/duelStore';
import { DuelRecord } from '../../src/types';

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deckId = Number(id);
  const { currentDeck, loading, loadDeckDetail, markModified, deleteDeck } =
    useDeckStore();
  const { getDuelsByDeckId } = useDuelStore();
  const [recentDuels, setRecentDuels] = useState<DuelRecord[]>([]);

  useEffect(() => {
    loadDeckDetail(deckId);
  }, [deckId]);

  useEffect(() => {
    if (currentDeck) {
      const duels = getDuelsByDeckId(deckId)
        .sort(
          (a, b) =>
            new Date(b.duel_date).getTime() - new Date(a.duel_date).getTime()
        )
        .slice(0, 10);
      setRecentDuels(duels);
    }
  }, [currentDeck, deckId]);

  const handleMarkModified = async () => {
    await markModified(deckId);
    await loadDeckDetail(deckId);
  };

  const handleDelete = () => {
    Alert.alert('确认删除', `确定要删除卡组「${currentDeck?.name}」吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteDeck(deckId);
          router.back();
        },
      },
    ]);
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win':
        return Colors.win;
      case 'lose':
        return Colors.lose;
      case 'draw':
        return Colors.draw;
      default:
        return Colors.text;
    }
  };

  const getResultLabel = (result: string) => {
    switch (result) {
      case 'win':
        return '胜利';
      case 'lose':
        return '失败';
      case 'draw':
        return '平局';
      default:
        return result;
    }
  };

  if (!currentDeck) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 卡组信息 */}
        <View style={styles.headerCard}>
          <Text style={styles.deckName}>{currentDeck.name}</Text>
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>
                {currentDeck.total_games}
              </Text>
              <Text style={styles.headerStatLabel}>总对局</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>
                {currentDeck.is_modified === 1 ? '是' : '否'}
              </Text>
              <Text style={styles.headerStatLabel}>已修改</Text>
            </View>
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionButtons}>
          {currentDeck.is_modified === 0 && (
            <TouchableOpacity
              style={styles.modifyButton}
              onPress={handleMarkModified}
              activeOpacity={0.7}
            >
              <Text style={styles.modifyButtonText}>标记为已修改</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/deck/edit/${deckId}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>编辑名称</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonText}>删除卡组</Text>
          </TouchableOpacity>
        </View>

        {/* 胜率记录 */}
        {currentDeck.win_rate_records.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>胜率记录</Text>
            <View style={styles.recordsCard}>
              {currentDeck.win_rate_records.map((record) => (
                <View key={record.id} style={styles.recordItem}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordType}>
                      {record.record_type === 'original' ? '原始' : '修改后'}
                    </Text>
                    <Text style={styles.recordGames}>
                      {record.games_at_record} 场
                    </Text>
                  </View>
                  <View style={styles.recordStats}>
                    <Text style={styles.recordWinRate}>
                      胜率: {record.win_rate}%
                    </Text>
                    <Text style={styles.recordDetail}>
                      {record.wins}胜 {record.losses}负
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 最近对局 */}
        <Text style={styles.sectionTitle}>最近对局</Text>
        {recentDuels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无对局记录</Text>
          </View>
        ) : (
          <View style={styles.duelList}>
            {recentDuels.map((duel) => (
              <TouchableOpacity
                key={duel.id}
                style={styles.duelItem}
                onPress={() => router.push(`/duel/${duel.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.duelInfo}>
                  <Text style={styles.duelDate}>{duel.duel_date}</Text>
                  <Text style={styles.duelDetail}>
                    {duel.turn === 'first' ? '先手' : '后手'} |{' '}
                    {duel.coin_result === 'win' ? '硬币胜' : '硬币负'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.duelResult,
                    { color: getResultColor(duel.result) },
                  ]}
                >
                  {getResultLabel(duel.result)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deckName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  headerStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  actionButtons: {
    marginTop: 16,
    gap: 8,
  },
  modifyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modifyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.background,
  },
  editButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lose,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.lose,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  recordsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  recordItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recordType: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },
  recordGames: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  recordStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordWinRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  recordDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
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
  duelList: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  duelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  duelInfo: {
    flex: 1,
  },
  duelDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  duelDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  duelResult: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
