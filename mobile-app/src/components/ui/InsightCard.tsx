import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  emoji: string;
  title: string;
  desc:  string;
};

export function InsightCard({ emoji, title, desc }: Props) {
  return (
    <View
      className="bg-white rounded-2xl p-3 flex-row items-start gap-3 border border-slate-100"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
    >
      <LinearGradient
        colors={['#d1fae5', '#ccfbf1']}
        className="w-10 h-10 rounded-xl items-center justify-center flex-shrink-0"
      >
        <Text className="text-lg">{emoji}</Text>
      </LinearGradient>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-slate-800">{title}</Text>
        <Text className="text-xs text-slate-500 mt-0.5 leading-[17px]">{desc}</Text>
      </View>
    </View>
  );
}