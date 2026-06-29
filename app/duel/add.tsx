import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../src/theme';
import { DuelForm } from '../../src/components/DuelForm';
import { useDeckStore } from '../../src/stores/deckStore';
import { useDuelStore } from '../../src/stores/duelStore';
import { CreateDuelInput } from '../../src/types';
import { loadLastDuel } from '../../src/hooks/useLastDuel';

export default function AddDuelScreen() {
  const { decks, loadDecks } = useDeckStore();
  const { addDuel } = useDuelStore();
  const [form, setForm] = useState<CreateDuelInput>({
    deck_id: 0,
    coin_result: 'win',
    turn: 'first',
    result: 'win',
    opponent_deck: undefined,
    notes: undefined,
  });
  const [hasRestored, setHasRestored] = useState(false);

  const [lastDeckId, setLastDeckId] = useState<number>(0);

  useEffect(() => {
    loadDecks();
  }, []);

  // 加载上次对局选择，自动恢复卡组和对手卡组
  useEffect(() => {
    if (decks.length > 0 && !hasRestored) {
      loadLastDuel().then((last) => {
        if (last) {
          setForm((prev) => ({
            ...prev,
            deck_id: last.deck_id,
            opponent_deck: last.opponent_deck,
          }));
          setLastDeckId(last.deck_id);
        }
        setHasRestored(true);
      });
    }
  }, [decks.length, hasRestored]);

  const handleChangeForm = (updates: Partial<CreateDuelInput>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  // 快捷：复制上一局（只改胜负为负）
  const handleCopyLast = useCallback(async () => {
    const last = await loadLastDuel();
    if (last) {
      setForm({
        ...last,
        result: 'lose', // 默认改为负，因为如果赢了可能直接再来一局
        notes: undefined,
      });
      Alert.alert('已复制上一局', '已恢复卡组、硬币、先后手等，请确认胜负后保存', [
        { text: '好的' },
      ]);
    } else {
      Alert.alert('提示', '暂无上一局记录');
    }
  }, []);

  const handleSubmit = async () => {
    if (!form.deck_id) {
      Alert.alert('提示', '请选择卡组');
      return;
    }
    await addDuel(form);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* 快捷操作栏 */}
      <View style={styles.quickBar}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={handleCopyLast}
          activeOpacity={0.7}
        >
          <Text style={styles.quickButtonText}>📋 复制上一局</Text>
        </TouchableOpacity>
      </View>

      <DuelForm
        decks={decks}
        form={form}
        onChangeForm={handleChangeForm}
        onSubmit={handleSubmit}
        submitLabel="保存对局"
        lastDeckId={lastDeckId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  quickBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
});
