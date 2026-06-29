import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.cardBackground,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="deck/add"
          options={{
            title: '添加卡组',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="deck/[id]"
          options={{
            title: '卡组详情',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="deck/edit/[id]"
          options={{
            title: '编辑卡组',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="duel/add"
          options={{
            title: '添加对局',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="duel/[id]"
          options={{
            title: '对局详情',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="stats/index"
          options={{
            title: '详细统计',
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}
