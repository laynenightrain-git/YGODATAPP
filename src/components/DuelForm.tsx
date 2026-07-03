import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors } from '../theme';
import { CoinResult, Turn, DuelResult, CreateDuelInput, Deck } from '../types';

interface DuelFormProps {
  decks: Deck[];
  form: CreateDuelInput;
  onChangeForm: (updates: Partial<CreateDuelInput>) => void;
  onSubmit: () => void;
  submitLabel?: string;
  lastDeckId?: number;
}

export function DuelForm({
  decks,
  form,
  onChangeForm,
  onSubmit,
  submitLabel = '保存',
  lastDeckId,
}: DuelFormProps) {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 卡组选择 */}
      <Text style={styles.label}>选择卡组{lastDeckId ? '（已记忆上次）' : ''}</Text>
      <View style={styles.deckSelector}>
        {decks.map((deck) => {
          const isSelected = form.deck_id === deck.id;
          const isLastUsed = lastDeckId === deck.id;
          return (
            <TouchableOpacity
              key={deck.id}
              style={[
                styles.deckOption,
                isSelected && styles.deckOptionSelected,
                isLastUsed && !isSelected && styles.deckOptionLastUsed,
              ]}
              onPress={() => onChangeForm({ deck_id: deck.id })}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.deckOptionText,
                  isSelected && styles.deckOptionTextSelected,
                ]}
              >
                {deck.name}{isLastUsed && !isSelected ? ' · 上次' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 硬币结果 */}
      <Text style={styles.label}>硬币结果</Text>
      <View style={styles.optionRow}>
        {coinOptions.map((opt) => {
          const isSelected = form.coin_result === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionButton,
                isSelected && { backgroundColor: opt.color, borderColor: opt.color },
              ]}
              onPress={() => onChangeForm({ coin_result: opt.value })}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 先后手 */}
      <Text style={styles.label}>先后手</Text>
      <View style={styles.optionRow}>
        {turnOptions.map((opt) => {
          const isSelected = form.turn === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionButton,
                isSelected && { backgroundColor: opt.color, borderColor: opt.color },
              ]}
              onPress={() => onChangeForm({ turn: opt.value })}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 胜负结果 */}
      <Text style={styles.label}>胜负结果</Text>
      <View style={styles.optionRow}>
        {resultOptions.map((opt) => {
          const isSelected = form.result === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionButton,
                isSelected && { backgroundColor: opt.color, borderColor: opt.color },
              ]}
              onPress={() => onChangeForm({ result: opt.value })}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 对手卡组 */}
      <Text style={styles.label}>对手卡组（必填）</Text>
      <TextInput
        style={[
          styles.textInput,
          !form.opponent_deck.trim() && styles.textInputError,
        ]}
        value={form.opponent_deck}
        onChangeText={(text) => onChangeForm({ opponent_deck: text })}
        placeholder="请输入对手使用的卡组"
        placeholderTextColor={Colors.textSecondary}
      />
      {!form.opponent_deck.trim() && (
        <Text style={styles.errorHint}>请输入对手卡组</Text>
      )}

      {/* 掉线开关 */}
      <View style={styles.disconnectRow}>
        <TouchableOpacity
          style={[
            styles.disconnectCheckbox,
            form.disconnected && styles.disconnectCheckboxActive,
          ]}
          onPress={() => onChangeForm({ disconnected: !form.disconnected })}
          activeOpacity={0.7}
        >
          {form.disconnected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <Text
          style={[
            styles.disconnectLabel,
            form.disconnected && styles.disconnectLabelActive,
          ]}
          onPress={() => onChangeForm({ disconnected: !form.disconnected })}
        >
          掉线
        </Text>
      </View>

      {/* 备注 */}
      <Text style={styles.label}>备注（可选）</Text>
      <TextInput
        style={[styles.textInput, styles.textArea]}
        value={form.notes || ''}
        onChangeText={(text) => onChangeForm({ notes: text || undefined })}
        placeholder="输入备注信息"
        placeholderTextColor={Colors.textSecondary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* 保存按钮 */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          !form.deck_id && styles.submitButtonDisabled,
        ]}
        onPress={onSubmit}
        activeOpacity={0.7}
        disabled={!form.deck_id}
      >
        <Text style={styles.submitButtonText}>{submitLabel}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 16,
  },
  deckSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deckOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deckOptionSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  deckOptionLastUsed: {
    borderColor: Colors.accent,
    borderWidth: 1,
  },
  deckOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  deckOptionTextSelected: {
    color: Colors.background,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
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
  },
  textInputError: {
    borderColor: Colors.lose,
  },
  errorHint: {
    fontSize: 12,
    color: Colors.lose,
    marginTop: 4,
  },
  disconnectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  disconnectCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
  },
  disconnectCheckboxActive: {
    borderColor: Colors.lose,
    backgroundColor: Colors.lose,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disconnectLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  disconnectLabelActive: {
    color: Colors.lose,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.background,
  },
});
