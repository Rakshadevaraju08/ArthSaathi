import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { C } from '../../constants/colors';

type Props = { amount: number };

export function LoanEligibilityCard({ amount }: Props) {
  const router = useRouter();
  const fmt    = (n: number) => '₹' + n.toLocaleString('en-IN');
  return (
    <View className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 flex-row items-center gap-3">
      <View className="w-9 h-9 rounded-xl bg-emerald-500 items-center justify-center">
        <ShieldCheck size={18} color={C.white} />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] text-slate-500">Loan Eligibility</Text>
        <Text className="text-sm font-bold text-slate-800">Up to {fmt(Math.max(10000, amount))}</Text>
      </View>
      <TouchableOpacity onPress={() => router.push('/screens/loan')}>
        <Text className="text-xs font-semibold text-emerald-700">Check →</Text>
      </TouchableOpacity>
    </View>
  );
}