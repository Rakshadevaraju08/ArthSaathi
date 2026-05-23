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

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

// Simple bar chart using plain Views — no external chart lib needed for this screen
function MiniBarChart({ data }: { data: { m: string; v: number }[] }) {
  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <View className="flex-row items-end gap-1" style={{ height: 80 }}>
      {data.map((d) => (
        <View key={d.m} className="flex-1 items-center gap-1">
          <View
            className="w-full rounded-t-md"
            style={{
              height:          Math.max(8, (d.v / max) * 64),
              backgroundColor: C.emerald500,
              borderRadius:    4,
            }}
          />
          <Text className="text-[9px] text-slate-400">{d.m}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router      = useRouter();
  const { income, expense, savings, score } = useTotals();
  const transactions = useStore((s) => s.transactions);
  const [refreshing, setRefreshing] = React.useState(false);

  const incomeAnim  = income;
  const expenseAnim = expense;
  const savingsAnim = savings;
  const scoreAnim   = score;

  const monthly = useMemo(() => [
    { m: 'Apr', v: 8200  },
    { m: 'May', v: 11400 },
    { m: 'Jun', v: 9100  },
    { m: 'Jul', v: 12800 },
    { m: 'Aug', v: 10200 },
    { m: 'Sep', v: expense > 0 ? expense : 9800 },
  ], [expense]);

  const recentTx = transactions.slice(0, 3);
  const eligible  = Math.max(10000, Math.round((savings * 6) / 1000) * 1000);

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
        {/* ── Header gradient ── */}
        <LinearGradient
          colors={[C.emerald600, C.teal600]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          className="px-4 pt-4 pb-7 rounded-b-3xl"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-xs text-white/80">Namaste 👋</Text>
              <Text className="text-lg font-bold text-white">Ramesh Patil</Text>
              <Text className="text-xs text-white/80">Sindagi, Karnataka</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/alerts')}
              className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            >
              <Text className="text-lg">🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Score ring card */}
          <View className="bg-white/15 rounded-2xl p-4 flex-row items-center gap-3 border border-white/20">
            <HealthScoreRing score={scoreAnim} />
            <View className="flex-1">
              <Text className="text-xs text-white/80">Financial Health</Text>
              <Text className="text-[11px] text-white/90 mt-0.5">
                {score > 70 ? '✅ Excellent' : score > 40 ? '⚠️ Good' : '🔴 Needs attention'}
              </Text>
              <Text className="text-[10px] text-white/60 mt-0.5">Based on last 30 days</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Stat cards ── */}
        <View className="flex-row gap-2 px-4 mt-4">
          <StatCard label="Income"  value={fmt(incomeAnim)}  gradient={[C.emerald500, C.emerald600]} icon={<Feather name="trending-up"  size={14} color={C.white} />} />
          <StatCard label="Expense" value={fmt(expenseAnim)} gradient={[C.rose500,    C.rose600]}    icon={<Feather name="trending-down" size={14} color={C.white} />} />
          <StatCard label="Savings" value={fmt(savingsAnim)} gradient={[C.blue500,    C.blue600]}    icon={<Ionicons name="wallet-outline" size={14} color={C.white} />} />
        </View>

        {/* ── Loan eligibility ── */}
        <View className="px-4 mt-3">
          <LoanEligibilityCard amount={eligible} />
        </View>

        {/* ── Quick actions ── */}
        <View className="px-4 mt-3">
          <QuickActions />
        </View>

        {/* ── Monthly spending chart ── */}
        <View className="px-4 mt-4">
          <Card className="p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-semibold text-slate-800">Monthly Spending</Text>
              <Text className="text-[10px] text-slate-400">Last 6 months</Text>
            </View>
            <MiniBarChart data={monthly} />
          </Card>
        </View>

        {/* ── Recent transactions ── */}
        <View className="px-4 mt-4">
          <View className="flex-row justify-between items-center mb-2.5">
            <Text className="text-sm font-bold text-slate-800">Recent</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/expenses')}>
              <Text className="text-xs font-semibold text-emerald-600">See all →</Text>
            </TouchableOpacity>
          </View>
          <View className="gap-2">
            {recentTx.map((tx) => {
              const isInc = tx.type === 'income';
              return (
                <View key={tx.id} className="bg-white rounded-2xl p-3 flex-row items-center gap-3 border border-slate-100"
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
                  <View className={`w-10 h-10 rounded-xl items-center justify-center ${isInc ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    <Text className="text-lg">{isInc ? '📈' : '💸'}</Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-medium text-slate-800" numberOfLines={1}>{tx.label}</Text>
                    <Text className="text-[11px] text-slate-400 mt-0.5">{tx.category} · {tx.date}</Text>
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