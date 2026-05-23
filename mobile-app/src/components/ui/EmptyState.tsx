import React from 'react';
import { View, Text } from 'react-native';

type Props = { emoji: string; title: string; subtitle?: string };

export function EmptyState({ emoji, title, subtitle }: Props) {
  return (
    <View className="items-center py-16">
      <Text className="text-5xl mb-3">{emoji}</Text>
      <Text className="text-base font-semibold text-slate-700">{title}</Text>
      {subtitle && <Text className="text-sm text-slate-400 mt-1.5 text-center">{subtitle}</Text>}
    </View>
  );
}