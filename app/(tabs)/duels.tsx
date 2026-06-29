import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../src/theme';
import { useDuelStore } from '../../src/stores/duelStore';
import { useDeckStore } from '../../src/stores/deckStore';
import { DuelRecord } from '../../src/types';

export default function DuelsScreen() {
  const { duels, loading, loadDuels } = useDuelStore();
  const { decks, loadDecks } = useDeckStore();

  useEffect(() => {
    loadDuels();
    loadDecks();
  }, []);

  const getDeckName = (deckId: number): string => {
    const deck = decks.find((d) => d.id === deckId);
    return deck?.name ?? '未知卡组';
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
        return '胜';
      case 'lose':
        return '负';
      case 'draw':
        return '平';
      default:
        return result;
    }
  };

  const getTurnLabel = (turn: string) => {
    return turn === 'first' ? '先手' : '后手';
  };

  const renderItem = ({ item }: { item: DuelRecord }) => (
    <TouchableOpacity
      style={styles.duelCard}
      onPress={() => router.push(`/duel/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.duelHeader}>
        <Text style={styles.duelDate}>{item.duel_date}</Text>
        <View
          style={[
            styles.resultBadge,
            { backgroundColor: getResultColor(item.result) },
          ]}
        >
          <Text style={styles.resultBadgeText}>
            {getResultLabel(item.result)}
          </Text>
        </View>
      </View>
      <View style={styles.duelBody}>
        <View style={styles.duelInfoRow}>
          <Text style={styles.duelLabel}>卡组</Text>
          <Text style={styles.duelValue}>{getDeckName(item.deck_id)}</Text>
        </View>
        <View style={styles.duelInfoRow}>
          <Text style={styles.duelLabel}>先后手</Text>
          <Text
            style={[
              styles.duelValue,
              {
                color:
                  item.turn === 'first' ? Colors.firstTurn : Colors.secondTurn,
              },
            ]}
          >
            {getTurnLabel(item.turn)}
          </Text>
        </View>
        {item.opponent_deck && (
          <View style={styles.duelInfoRow}>
            <Text style={styles.duelLabel}>对手</Text>
            <Text style={styles.duelValue} numberOfLines={1}>
              {item.opponent_deck}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⚔️</Text>
      <Text style={styles.emptyText}>还没有对局记录</Text>
      <Text style={styles.emptySubText}>点击右上角开始记录</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={duels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          duels.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={renderEmpty}
        refreshing={loading}
        onRefresh={() => {
          loadDuels();
          loadDecks();
        }}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/duel/add')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingVertical: 12,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  duelCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  duelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 8,
  },
  duelDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  resultBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  duelBody: {
    padding: 14,
    paddingTop: 6,
  },
  duelInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  duelLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    width: 50,
  },
  duelValue: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: Colors.background,
    fontWeight: '300',
  },
});
