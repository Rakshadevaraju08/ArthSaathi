import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store';
import { TransactionRow } from '../../components/ui/TransactionRow';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Card } from '../../components/ui/Card';
import { C, CHART_COLORS } from '../../constants/colors';
import { ALL_CATEGORIES } from '../../constants/categories';
import type { TxType } from '../../types';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');
type Tab  = 'All' | 'Income' | 'Expense';

// Simple donut using plain Views
function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <View>
      <View className="flex-row flex-wrap gap-2 mt-2 justify-center">
        {data.map((d, i) => (
          <View key={d.name} className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <Text className="text-[10px] text-slate-600">{d.name} {Math.round((d.value / total) * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ExpensesScreen() {
  const transactions     = useStore((s) => s.transactions);
  const addTransaction   = useStore((s) => s.addTransaction);
  const removeTransaction = useStore((s) => s.removeTransaction);
  const [tab,     setTab]     = useState<Tab>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'expense' as TxType, label: '', amount: '', category: 'Other' });

  const filtered = transactions.filter((t) =>
    tab === 'All' ? true : tab === 'Income' ? t.type === 'income' : t.type === 'expense'
  );

  const byCat = useMemo(() => {
    const m: Record<string, number> = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const submit = () => {
    const amt = parseFloat(form.amount);
    if (!amt || !form.label.trim()) { Alert.alert('Missing info', 'Fill in all fields'); return; }
    addTransaction({ type: form.type, amount: amt, label: form.label.trim(), category: form.category });
    setForm({ type: 'expense', label: '', amount: '', category: 'Other' });
    setShowAdd(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']} style={{ flex: 1, backgroundColor: '#f8fafc' }}>


      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3.5 bg-white border-b border-slate-100">
        <Text className="text-base font-bold text-slate-800">My Transactions</Text>
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          className="w-9 h-9 rounded-full bg-emerald-500 items-center justify-center"
          style={{ shadowColor: C.emerald500, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 4 }}
        >
          <Feather name="plus" size={18} color={C.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row gap-2 px-4 py-2.5 bg-white border-b border-slate-100">
        {(['All', 'Income', 'Expense'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full ${tab === t ? 'bg-emerald-500' : 'bg-white border border-slate-200'}`}
          >
            <Text className={`text-xs font-medium ${tab === t ? 'text-white' : 'text-slate-600'}`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Breakdown chart */}
        {byCat.length > 0 && (
          <View>
            <Card className="p-3 mb-4">
              <Text className="text-sm font-semibold text-slate-800 mb-1">Expense Breakdown</Text>
              <DonutChart data={byCat} />
            </Card>
          </View>
        )}

        {/* Transaction list */}
        <View className="gap-2">
          {filtered.length === 0 ? (
            <View className="items-center py-16">
              <Text className="text-5xl mb-3">📭</Text>
              <Text className="text-sm text-slate-500">No transactions yet</Text>
            </View>
          ) : (
            filtered.map((tx, i) => (
              <View key={tx.id}>
                <TransactionRow
                  tx={tx}
                  onPress={() =>
                    Alert.alert(tx.label, `${tx.category} · ${tx.date}\n${fmt(tx.amount)}`, [
                      { text: '🗑 Delete', style: 'destructive', onPress: () => removeTransaction(tx.id) },
                      { text: 'Cancel', style: 'cancel' },
                    ])
                  }
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add transaction sheet */}
      <BottomSheet visible={showAdd} onClose={() => setShowAdd(false)}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-slate-800">New Transaction</Text>
          <TouchableOpacity onPress={() => setShowAdd(false)}>
            <Feather name="x" size={18} color={C.slate400} />
          </TouchableOpacity>
        </View>

        {/* Type toggle */}
        <View className="flex-row gap-2 mb-3">
          {(['expense', 'income'] as TxType[]).map((tp) => (
            <TouchableOpacity
              key={tp}
              onPress={() => setForm({ ...form, type: tp })}
              className={`flex-1 py-2 rounded-xl items-center ${form.type === tp ? 'bg-emerald-500' : 'bg-slate-100'}`}
            >
              <Text className={`text-xs font-semibold capitalize ${form.type === tp ? 'text-white' : 'text-slate-600'}`}>{tp}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          value={form.label}
          onChangeText={(v) => setForm({ ...form, label: v })}
          placeholder="Description"
          placeholderTextColor={C.slate400}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 mb-2 bg-slate-50"
        />
        <TextInput
          value={form.amount}
          onChangeText={(v) => setForm({ ...form, amount: v })}
          placeholder="Amount (₹)"
          keyboardType="numeric"
          placeholderTextColor={C.slate400}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 mb-3 bg-slate-50"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2 px-0.5">
            {ALL_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setForm({ ...form, category: cat })}
                className={`px-3 py-1.5 rounded-full ${
                  form.category === cat
                    ? 'bg-emerald-50 border-[1.5px] border-emerald-400'
                    : 'bg-slate-100'
                }`}
              >
                <Text className={`text-xs font-medium ${form.category === cat ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity onPress={submit}>
          <LinearGradient
            colors={[C.emerald500, C.teal600]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text className="text-white font-bold text-base">Add Transaction</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BottomSheet>
    </SafeAreaView>
  );
}