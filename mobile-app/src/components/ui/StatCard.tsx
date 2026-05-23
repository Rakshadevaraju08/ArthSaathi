import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  label:    string;
  value:    string;
  gradient: readonly [string, string];
  icon:     React.ReactNode;
};

export function StatCard({ label, value, gradient, icon }: Props) {
  return (
    <View
      className="flex-1 bg-white rounded-2xl p-3 border border-slate-100"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-7 h-7 rounded-lg items-center justify-center mb-1"
      >
        {icon}
      </LinearGradient>
      <Text className="text-[10px] text-slate-500">{label}</Text>
      <Text className="text-sm font-bold text-slate-800">{value}</Text>
    </View>
  );
}