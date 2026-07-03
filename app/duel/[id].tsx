import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/theme';
import { useDuelStore } from '../../src/stores/duelStore';
import { useDeckStore } from '../../src/stores/deckStore';
import { CoinResult, Turn, DuelResult } from '../../src/types';

export default function DuelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const duelId = Number(id);
  const { currentDuel, loadDuel, removeDuel, updateDuel } = useDuelStore();
  const { decks, loadDecks } = useDeckStore();
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    coin_result: '' as CoinResult,
    turn: '' as Turn,
    result: '' as DuelResult,
    opponent_deck: '',
    notes: '',
  });

  useEffect(() => {
    loadDuel(duelId);
    loadDecks();
  }, [duelId]);

  useEffect(() => {
    if (currentDuel) {
      setEditForm({
        coin_result: currentDuel.coin_result,
        turn: currentDuel.turn,
        result: currentDuel.result,
        opponent_deck: currentDuel.opponent_deck || '',
        notes: currentDuel.notes || '',
      });
    }
  }, [currentDuel]);

  const getDeckName = (deckId: number): string => {
    const deck = decks.find((d) => d.id === deckId);
    return deck?.name ?? '未知卡组';
  };

  const getCoinLabel = (coin: string) =>
    coin === 'win' ? '硬币胜' : '硬币负';
  const getCoinColor = (coin: string) =>
    coin === 'win' ? Colors.coinWin : Colors.coinLose;
  const getTurnLabel = (turn: string) =>
    turn === 'first' ? '先手' : '后手';
  const getTurnColor = (turn: string) =>
    turn === 'first' ? Colors.firstTurn : Colors.secondTurn;
  const getResultLabel = (result: string) => {
    switch (result) {
      case 'win': return '胜利';
      case 'lose': return '失败';
      case 'draw': return '平局';
      default: return result;
    }
  };
  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return Colors.win;
      case 'lose': return Colors.lose;
      case 'draw': return Colors.draw;
      default: return Colors.text;
    }
  };

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这条对局记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await removeDuel(duelId);
          router.back();
        },
      },
    ]);
  };

  const handleSaveEdit = async () => {
    await updateDuel(duelId, {
      coin_result: editForm.coin_result,
      turn: editForm.turn,
      result: editForm.result,
      opponent_deck: editForm.opponent_deck || undefined,
      notes: editForm.notes || undefined,
    });
    setEditMode(false);
    Alert.alert('提示', '修改已保存');
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

  // ============ 编辑模式 ============
  if (editMode) {
    const coinOptions: { label: string; value: CoinResult; color: string }[] = [
      { label: '硬币胜', value: 'win', color: Colors.coinWin },
      { label: '硬币负', value: 'lose', color: Colors.coinLose },
    ];
    const turnOptions: { label: string; value: Turn; color: string }[] = [
      { label: '先手', value: 'first', color: Colors.firstTurn },
      { label: '后手', value: 'second', color: Colors.secondTurn },
    ];
    const resultOptions: { label: string; value: DuelResult; color: string }[] = [
      { label: '胜利', value: 'win', color: Colors.win },
      { label: '失败', value: 'lose', color: Colors.lose },
      { label: '平局', value: 'draw', color: Colors.draw },
    ];

    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.editTitle}>编辑对局</Text>

          {/* 硬币结果 */}
          <Text style={styles.label}>硬币结果</Text>
          <View style={styles.optionRow}>
            {coinOptions.map((opt) => {
              const isSelected = editForm.coin_result === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionButton, isSelected && { backgroundColor: opt.color, borderColor: opt.color }]}
                  onPress={() => setEditForm((p) => ({ ...p, coin_result: opt.value }))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 先后手 */}
          <Text style={styles.label}>先后手</Text>
          <View style={styles.optionRow}>
            {turnOptions.map((opt) => {
              const isSelected = editForm.turn === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionButton, isSelected && { backgroundColor: opt.color, borderColor: opt.color }]}
                  onPress={() => setEditForm((p) => ({ ...p, turn: opt.value }))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 胜负 */}
          <Text style={styles.label}>胜负结果</Text>
          <View style={styles.optionRow}>
            {resultOptions.map((opt) => {
              const isSelected = editForm.result === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionButton, isSelected && { backgroundColor: opt.color, borderColor: opt.color }]}
                  onPress={() => setEditForm((p) => ({ ...p, result: opt.value }))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 对手卡组 */}
          <Text style={styles.label}>对手卡组</Text>
          <TextInput
            style={styles.textInput}
            value={editForm.opponent_deck}
            onChangeText={(text) => setEditForm((p) => ({ ...p, opponent_deck: text }))}
            placeholder="输入对手卡组"
            placeholderTextColor={Colors.textSecondary}
          />

          {/* 备注 */}
          <Text style={styles.label}>备注</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={editForm.notes}
            onChangeText={(text) => setEditForm((p) => ({ ...p, notes: text }))}
            placeholder="输入备注"
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* 操作按钮 */}
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditMode(false)} activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit} activeOpacity={0.7}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============ 查看模式 ============
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 日期 */}
        <View style={styles.card}>
          <Text style={styles.label}>日期</Text>
          <Text style={styles.value}>{currentDuel.duel_date}</Text>
        </View>

        {/* 卡组 */}
        <View style={styles.card}>
          <Text style={styles.label}>使用卡组</Text>
          <Text style={styles.value}>{getDeckName(currentDuel.deck_id)}</Text>
        </View>

        {/* 硬币结果 */}
        <View style={styles.card}>
          <Text style={styles.label}>硬币结果</Text>
          <Text style={[styles.value, styles.highlightValue, { color: getCoinColor(currentDuel.coin_result) }]}>
            {getCoinLabel(currentDuel.coin_result)}
          </Text>
        </View>

        {/* 先后手 */}
        <View style={styles.card}>
          <Text style={styles.label}>先后手</Text>
          <Text style={[styles.value, styles.highlightValue, { color: getTurnColor(currentDuel.turn) }]}>
            {getTurnLabel(currentDuel.turn)}
          </Text>
        </View>

        {/* 胜负 */}
        <View style={styles.card}>
          <Text style={styles.label}>胜负结果</Text>
          <Text style={[styles.value, styles.highlightValue, { color: getResultColor(currentDuel.result) }]}>
            {getResultLabel(currentDuel.result)}
          </Text>
        </View>

        {/* 对手卡组 */}
        <View style={styles.card}>
          <Text style={styles.label}>对手卡组</Text>
          <Text style={styles.value}>{currentDuel.opponent_deck || '未记录'}</Text>
        </View>

        {/* 备注 */}
        <View style={styles.card}>
          <Text style={styles.label}>备注</Text>
          <Text style={styles.value}>{currentDuel.notes || '无'}</Text>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditMode(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>✏️ 修改对局</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonText}>🗑️ 删除对局</Text>
          </TouchableOpacity>
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
    fontWeight: '600',
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
  // 编辑模式
  editTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.accent,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.background,
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.background,
  },
  // 查看模式操作按钮
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  editButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
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
    borderRadius: 12,
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
});
