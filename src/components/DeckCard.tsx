import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme';
import { Deck } from '../types';

interface DeckCardProps {
  deck: Deck;
  onPress: () => void;
}

export function DeckCard({ deck, onPress }: DeckCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.deckName}>{deck.name}</Text>
          <Text style={styles.gameCount}>{deck.total_games} 场对局</Text>
        </View>
        <View style={styles.rightSection}>
          {deck.is_modified === 1 && (
            <View style={styles.modifiedBadge}>
              <Text style={styles.modifiedText}>已修改</Text>
            </View>
          )}
          <Text style={styles.arrow}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leftSection: {
    flex: 1,
  },
  deckName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  gameCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modifiedBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modifiedText: {
    fontSize: 11,
    color: Colors.background,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});
