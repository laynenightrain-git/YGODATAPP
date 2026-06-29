import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/theme';
import { useDuelStore } from '../../src/stores/duelStore';
import { useDeckStore } from '../../src/stores/deckStore';

export default function DuelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const duelId = Number(id);
  const { currentDuel, loadDuel } = useDuelStore();
  const { decks, loadDecks } = useDeckStore();

  useEffect(() => {
    loadDuel(duelId);
    loadDecks();
  }, [duelId]);

  const getDeckName = (deckId: number): string => {
    const deck = decks.find((d) => d.id === deckId);
    return deck?.name ?? '未知卡组';
  };

  const getCoinLabel = (coin: string) => {
    return coin === 'win' ? '硬币胜' : '硬币负';
  };

  const getCoinColor = (coin: string) => {
    return coin === 'win' ? Colors.coinWin : Colors.coinLose;
  };

  const getTurnLabel = (turn: string) => {
    return turn === 'first' ? '先手' : '后手';
  };

  const getTurnColor = (turn: string) => {
    return turn === 'first' ? Colors.firstTurn : Colors.secondTurn;
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

  if (!currentDuel) {
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
        {/* 日期 */}
        <View style={styles.card}>
          <Text style={styles.label}>日期</Text>
          <Text style={styles.value}>{currentDuel.duel_date}</Text>
        </View>

        {/* 卡组 */}
        <View style={styles.card}>
          <Text style={styles.label}>使用卡组</Text>
          <Text style={styles.value}>
            {getDeckName(currentDuel.deck_id)}
          </Text>
        </View>

        {/* 硬币结果 */}
        <View style={styles.card}>
          <Text style={styles.label}>硬币结果</Text>
          <Text
            style={[
              styles.value,
              styles.highlightValue,
              { color: getCoinColor(currentDuel.coin_result) },
            ]}
          >
            {getCoinLabel(currentDuel.coin_result)}
          </Text>
        </View>

        {/* 先后手 */}
        <View style={styles.card}>
          <Text style={styles.label}>先后手</Text>
          <Text
            style={[
              styles.value,
              styles.highlightValue,
              { color: getTurnColor(currentDuel.turn) },
            ]}
          >
            {getTurnLabel(currentDuel.turn)}
          </Text>
        </View>

        {/* 胜负 */}
        <View style={styles.card}>
          <Text style={styles.label}>胜负结果</Text>
          <Text
            style={[
              styles.value,
              styles.highlightValue,
              { color: getResultColor(currentDuel.result) },
            ]}
          >
            {getResultLabel(currentDuel.result)}
          </Text>
        </View>

        {/* 对手卡组 */}
        <View style={styles.card}>
          <Text style={styles.label}>对手卡组</Text>
          <Text style={styles.value}>
            {currentDuel.opponent_deck || '未记录'}
          </Text>
        </View>

        {/* 备注 */}
        <View style={styles.card}>
          <Text style={styles.label}>备注</Text>
          <Text style={styles.value}>
            {currentDuel.notes || '无'}
          </Text>
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
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  highlightValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
