import React, { useMemo } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useStore, useTotals } from '../../store';
import { HealthScoreRing } from '../../components/home/HealthScoreRing';
import { QuickActions } from '../../components/home/QuickActions';
import { LoanEligibilityCard } from '../../components/home/LoanEligibilityCard';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { C } from '../../constants/colors';

const fmt = (n: number) => 'Rs ' + n.toLocaleString('en-IN');

function MiniBarChart({ data }: { data: { m: string; v: number }[] }) {
  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <View className="flex-row items-end gap-1" style={{ height: 80 }}>
      {data.map((d) => (
        <View key={d.m} className="flex-1 items-center gap-1">
          <View
            className="w-full rounded-t-md"
            style={{
              height: Math.max(8, (d.v / max) * 64),
              backgroundColor: C.emerald500,
              borderRadius: 4,
            }}
          />
          <Text className="text-[9px] text-slate-400">{d.m}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { income, expense, savings, score } = useTotals();
  const transactions = useStore((s) => s.transactions);
  const [refreshing, setRefreshing] = React.useState(false);

  const monthly = useMemo(() => [
    { m: 'Apr', v: 8200 },
    { m: 'May', v: 11400 },
    { m: 'Jun', v: 9100 },
    { m: 'Jul', v: 12800 },
    { m: 'Aug', v: 10200 },
    { m: 'Sep', v: expense > 0 ? expense : 9800 },
  ], [expense]);

  const recentTx = transactions.slice(0, 3);
  const eligible = Math.max(10000, Math.round((savings * 6) / 1000) * 1000);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']} style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.emerald500} />}
      >
        <LinearGradient
          colors={[C.emerald600, C.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-5 pt-5 pb-7 rounded-b-3xl"
        >
          <View className="mb-4 items-start">
            <Text className="text-[11px] text-white/80 tracking-wide">Namaste</Text>
            <Text className="text-[22px] leading-7 font-bold text-white mt-0.5">Ramesh Patil</Text>
            <Text className="text-xs text-white/80 mt-0.5">Sindagi, Karnataka</Text>
          </View>

          <View className="bg-white/15 rounded-2xl p-4 flex-row items-center gap-4 border border-white/20">
            <HealthScoreRing score={score} />
            <View className="flex-1 justify-center">
              <Text className="text-sm font-semibold text-white">Financial Health Score</Text>
              <Text className="text-[11px] text-white/90 mt-1">
                {score > 70 ? 'Excellent' : score > 40 ? 'Good' : 'Needs attention'}
              </Text>
              <Text className="text-[10px] text-white/65 mt-1">Based on last 30 days</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="flex-row gap-2 px-4 mt-4">
          <StatCard label="Income" value={fmt(income)} gradient={[C.emerald100, C.emerald300]} icon={<Feather name="trending-up" size={14} color={C.emerald600} />} />
          <StatCard label="Expense" value={fmt(expense)} gradient={[C.rose100, C.rose200]} icon={<Feather name="trending-down" size={14} color={C.rose600} />} />
          <StatCard label="Savings" value={fmt(savings)} gradient={['#dbeafe', '#93c5fd']} icon={<Ionicons name="wallet-outline" size={14} color={C.blue600} />} />
        </View>

        <View className="px-4 mt-3">
          <LoanEligibilityCard amount={eligible} />
        </View>

        <View className="px-4 mt-3">
          <QuickActions />
        </View>

        <View className="px-4 mt-4">
          <Card className="p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-semibold text-slate-800">Monthly Spending</Text>
              <Text className="text-[10px] text-slate-400">Last 6 months</Text>
            </View>
            <MiniBarChart data={monthly} />
          </Card>
        </View>

        <View className="px-4 mt-4">
          <View className="flex-row justify-between items-center mb-2.5">
            <Text className="text-sm font-bold text-slate-800">Recent</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/expenses')}>
              <Text className="text-xs font-semibold text-emerald-600">See all -</Text>
            </TouchableOpacity>
          </View>
          <View className="gap-2">
            {recentTx.map((tx) => {
              const isInc = tx.type === 'income';
              return (
                <View
                  key={tx.id}
                  className="bg-white rounded-2xl p-3 flex-row items-center gap-3 border border-slate-100"
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
                >
                  <View className={`w-10 h-10 rounded-xl items-center justify-center ${isInc ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    <Text className="text-lg">{isInc ? '+' : '-'}</Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-medium text-slate-800" numberOfLines={1}>{tx.label}</Text>
                    <Text className="text-[11px] text-slate-400 mt-0.5">{tx.category} | {tx.date}</Text>
                  </View>
                  <Text className={`text-sm font-bold ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isInc ? '+' : '-'}{fmt(tx.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
