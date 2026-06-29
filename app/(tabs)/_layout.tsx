import React from 'react';
import { Text, ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme';

function TabIcon({ emoji, color }: { emoji: string; color: ColorValue }) {
  return <Text style={{ fontSize: 22, color }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.cardBackground,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: Colors.cardBackground,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '仪表盘',
          headerTitle: '大师决斗统计',
          tabBarLabel: '仪表盘',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="📊" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="decks"
        options={{
          title: '卡组',
          tabBarLabel: '卡组',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="🃏" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="duels"
        options={{
          title: '对局',
          tabBarLabel: '对局',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="⚔️" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
