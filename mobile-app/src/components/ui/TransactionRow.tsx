import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CATEGORY_EMOJI } from '../../constants/categories';
import type { Transaction } from '../../types';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

type Props = { tx: Transaction; onPress?: () => void };

export function TransactionRow({ tx, onPress }: Props) {
  const isInc  = tx.type === 'income';
  const emoji  = CATEGORY_EMOJI[tx.category as keyof typeof CATEGORY_EMOJI] ?? '💳';
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white rounded-2xl p-3 flex-row items-center gap-3 border border-slate-100"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
    >
      <View className={`w-10 h-10 rounded-xl items-center justify-center ${isInc ? 'bg-emerald-50' : 'bg-rose-50'}`}>
        <Text className="text-lg">{emoji}</Text>
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-medium text-slate-800" numberOfLines={1}>{tx.note}</Text>
        <Text className="text-[11px] text-slate-400 mt-0.5">{tx.category} · {tx.date}</Text>
      </View>
      <Text className={`text-sm font-bold ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isInc ? '+' : '-'}{fmt(tx.amount)}
      </Text>
    </TouchableOpacity>
  );
}