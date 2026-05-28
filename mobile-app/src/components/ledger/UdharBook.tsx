import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { C } from '../../constants/colors';
import { endpoints } from '../../services/api';
import { useTranslations } from '../../hooks/useTranslations';
import type { StockMeta, Transaction, UdharMeta } from '../../types';

type UdharRow = {
  id: string;
  name: string;
  amount: string;
  note: string;
  status: string;
  color: string;
};

type StockRow = {
  id: string;
  item: string;
  days: string;
  turn: string;
  level: number;
  amount: number;
};

const STATUS_COLOR: Record<string, string> = {
  'Follow up': C.amber600,
  'Partial':   C.blue500,
  'Supplier':  C.emerald600,
  'New':       C.emerald600,
  'Paid':      C.emerald600,
};

function txToUdhar(tx: Transaction): UdharRow {
  const m = (tx.ledgerMeta ?? {}) as UdharMeta;
  const status = m.status ?? 'New';
  return {
    id:     tx.id,
    name:   m.personName ?? tx.note ?? 'Unknown',
    amount: `Rs ${tx.amount.toLocaleString('en-IN')}`,
    note:   tx.note ?? '',
    status,
    color:  STATUS_COLOR[status] ?? C.emerald600,
  };
}

function txToStock(tx: Transaction): StockRow {
  const m = (tx.ledgerMeta ?? {}) as StockMeta;
  return {
    id:   tx.id,
    item: m.itemName  ?? tx.note ?? 'Unknown',
    days: m.daysStock ?? '',
    turn: m.turnCycle ?? 'Weekly',
    level: m.level    ?? 0,
    amount: tx.amount,
  };
}

export function UdharBook() {
  const t = useTranslations();
  const [accounts, setAccounts]   = useState<UdharRow[]>([]);
  const [stockCycle, setStockCycle] = useState<StockRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [activeForm, setActiveForm] = useState<'udhar' | 'stock'>('udhar');
  const [udharForm, setUdharForm] = useState({ name: '', amount: '', note: '' });
  const [stockForm, setStockForm] = useState({ item: '', days: '', turn: 'Weekly', cost: '' });

  const fetchEntries = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await endpoints.getLedgerEntries('SHOP_OWNER');
      const grouped = res.data?.data?.grouped ?? {};
      setAccounts((grouped['Udhar']  ?? []).map(txToUdhar));
      setStockCycle((grouped['Stock'] ?? []).map(txToStock));
    } catch {
      Alert.alert('Error', t.couldNotLoadData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const saveUdhar = async () => {
    if (!udharForm.name.trim() || !udharForm.amount.trim()) return;
    setSaving(true);
    try {
      await endpoints.addLedgerEntry({
        amount:     parseFloat(udharForm.amount) || 0,
        type:       'expense',
        category:   'Udhar',
        note:       udharForm.note.trim() || `Udhar — ${udharForm.name.trim()}`,
        ledgerMeta: {
          personName: udharForm.name.trim(),
          status:     'New',
        },
      });
      setUdharForm({ name: '', amount: '', note: '' });
      fetchEntries();
    } catch {
      Alert.alert('Error', 'Could not save udhar entry.');
    } finally {
      setSaving(false);
    }
  };

  const saveStock = async () => {
    if (!stockForm.item.trim() || !stockForm.days.trim()) return;
    setSaving(true);
    try {
      const level = Math.min(92, Math.max(18, Number(stockForm.days || 1) * 8));
      await endpoints.addLedgerEntry({
        amount:     parseFloat(stockForm.cost) || 0,
        type:       'expense',
        category:   'Stock',
        note:       stockForm.item.trim(),
        ledgerMeta: {
          itemName:  stockForm.item.trim(),
          daysStock: `${stockForm.days.trim()} days stock`,
          turnCycle: stockForm.turn,
          level,
        },
      });
      setStockForm({ item: '', days: '', turn: 'Weekly', cost: '' });
      fetchEntries();
    } catch {
      Alert.alert('Error', 'Could not save stock item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, type: 'Udhar' | 'Stock') => {
    Alert.alert(`Delete ${type} entry?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await endpoints.deleteLedgerEntry(id);
            if (type === 'Udhar') setAccounts((p) => p.filter((r) => r.id !== id));
            else setStockCycle((p) => p.filter((r) => r.id !== id));
          } catch {
            Alert.alert('Error', 'Could not delete entry.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchEntries(true)} />}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-slate-900 text-2xl font-black">Shop Ledger</Text>
          <Text className="text-slate-500 text-sm mt-1">Udhar book and stock cycle</Text>
        </View>
        <View className="w-11 h-11 rounded-full bg-emerald-600 items-center justify-center">
          <Feather name="shopping-bag" size={20} color="#fff" />
        </View>
      </View>

      {/* Tab switcher */}
      <View className="flex-row bg-white border border-slate-100 rounded-2xl p-1 mb-4">
        {(['udhar', 'stock'] as const).map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setActiveForm(item)}
            className={`flex-1 py-3 rounded-xl items-center ${activeForm === item ? 'bg-emerald-600' : ''}`}
          >
            <Text className={`font-black ${activeForm === item ? 'text-white' : 'text-slate-600'}`}>
              {item === 'udhar' ? 'Add Udhar' : 'Add Stock Item'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Form */}
      <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        {activeForm === 'udhar' ? (
          <>
            <Text className="text-slate-900 font-black mb-3">New Udhar Account</Text>
            <TextInput
              value={udharForm.name}
              onChangeText={(name) => setUdharForm({ ...udharForm, name })}
              placeholder="Customer / Supplier Name"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={udharForm.amount}
              onChangeText={(amount) => setUdharForm({ ...udharForm, amount })}
              placeholder="Balance Amount (Rs)"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={udharForm.note}
              onChangeText={(note) => setUdharForm({ ...udharForm, note })}
              placeholder="Due date or note"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3"
            />
            <TouchableOpacity onPress={saveUdhar} disabled={saving} className="bg-emerald-600 rounded-xl py-3 items-center">
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-black">Save Udhar</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-slate-900 font-black mb-3">New Stock Cycle Item</Text>
            <TextInput
              value={stockForm.item}
              onChangeText={(item) => setStockForm({ ...stockForm, item })}
              placeholder="Item name"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={stockForm.days}
              onChangeText={(days) => setStockForm({ ...stockForm, days })}
              placeholder="Days of stock left"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={stockForm.cost}
              onChangeText={(cost) => setStockForm({ ...stockForm, cost })}
              placeholder="Purchase cost (Rs)"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3"
            />
            <View className="flex-row mb-3">
              {['Weekly', 'Monthly'].map((turn) => (
                <TouchableOpacity
                  key={turn}
                  onPress={() => setStockForm({ ...stockForm, turn })}
                  className={`flex-1 py-3 rounded-xl items-center mr-2 ${stockForm.turn === turn ? 'bg-emerald-600' : 'bg-slate-100'}`}
                >
                  <Text className={`font-black ${stockForm.turn === turn ? 'text-white' : 'text-slate-600'}`}>{turn}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={saveStock} disabled={saving} className="bg-emerald-600 rounded-xl py-3 items-center">
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-black">Save Stock Item</Text>
              }
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Loading */}
      {loading ? (
        <View className="items-center py-10">
          <ActivityIndicator color={C.emerald600} size="large" />
          <Text className="text-slate-400 mt-3 text-sm">Loading accounts…</Text>
        </View>
      ) : (
        <>
          {/* Udhar List */}
          <Text className="text-slate-900 text-base font-black mb-3">Udhar Accounts</Text>
          {accounts.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-100 p-6 items-center mb-3">
              <Text className="text-slate-400 text-sm">No udhar logs yet.</Text>
            </View>
          ) : accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              onLongPress={() => handleDelete(account.id, 'Udhar')}
              activeOpacity={0.8}
              className="bg-white rounded-2xl border border-slate-100 p-4 mb-3"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <View className="w-11 h-11 rounded-xl bg-emerald-50 items-center justify-center mr-3">
                    <Feather name="user" size={19} color={C.emerald600} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 font-black text-base" numberOfLines={1}>{account.name}</Text>
                    <Text className="text-slate-500 text-xs mt-1">{account.note}</Text>
                  </View>
                </View>
                <View className="items-end ml-3">
                  <Text className="text-slate-900 font-black">{account.amount}</Text>
                  <View style={{ backgroundColor: `${account.color}1A` }} className="rounded-full px-2 py-1 mt-2">
                    <Text style={{ color: account.color }} className="text-[10px] font-black">{account.status}</Text>
                  </View>
                </View>
              </View>
              <Text className="text-slate-300 text-[10px] mt-2">Long press to delete</Text>
            </TouchableOpacity>
          ))}

          {/* Stock Cycle */}
          <Text className="text-slate-900 text-base font-black mt-2 mb-3">Stock Cycle</Text>
          {stockCycle.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-100 p-6 items-center mb-3">
              <Text className="text-slate-400 text-sm">No stock items yet.</Text>
            </View>
          ) : stockCycle.map((row) => (
            <TouchableOpacity
              key={row.id}
              onLongPress={() => handleDelete(row.id, 'Stock')}
              activeOpacity={0.8}
              className="bg-white rounded-2xl border border-slate-100 p-4 mb-3"
            >
              <View className="flex-row justify-between mb-2">
                <View>
                  <Text className="text-slate-900 font-black text-base">{row.item}</Text>
                  <Text className="text-slate-500 text-xs mt-1">{row.days}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-rose-600 font-black">Rs {row.amount.toLocaleString('en-IN')}</Text>
                  <Text className="text-slate-500 text-xs mt-1">{row.turn}</Text>
                </View>
              </View>
              <View className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                <View className="h-2 bg-emerald-500 rounded-full" style={{ width: `${row.level}%` }} />
              </View>
              <Text className="text-slate-300 text-[10px] mt-2">Long press to delete</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}
