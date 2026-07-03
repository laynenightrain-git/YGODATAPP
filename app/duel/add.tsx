import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet } from 'react-native';
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
    opponent_deck: '',
    notes: undefined,
    disconnected: false,
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
            opponent_deck: last.opponent_deck ?? '',
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

  const handleSubmit = async () => {
    if (!form.deck_id) {
      Alert.alert('提示', '请选择卡组');
      return;
    }
    if (!form.opponent_deck.trim()) {
      Alert.alert('提示', '请输入对手卡组');
      return;
    }
    await addDuel(form);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
});
