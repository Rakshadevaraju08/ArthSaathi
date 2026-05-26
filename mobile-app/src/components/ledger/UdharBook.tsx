import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { C } from '../../constants/colors';

type Account = { name: string; amount: string; note: string; status: string; color: string };
type Stock = { item: string; days: string; turn: string; level: number };

const initialAccounts: Account[] = [
  { name: 'Ramesh Patil', amount: 'Rs 1,240', note: 'Due Friday', status: 'Follow up', color: C.amber600 },
  { name: 'Lakshmi Stores', amount: 'Rs 860', note: 'Paid partly', status: 'Partial', color: C.blue500 },
  { name: 'Tea stall', amount: 'Rs 2,100', note: 'Supplier credit', status: 'Supplier', color: C.emerald600 },
];

const initialStock: Stock[] = [
  { item: 'Rice bags', days: '9 days stock', turn: 'Monthly', level: 68 },
  { item: 'Oil packets', days: '4 days stock', turn: 'Weekly', level: 34 },
  { item: 'Tea powder', days: '12 days stock', turn: 'Monthly', level: 82 },
];

export function UdharBook() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [stockCycle, setStockCycle] = useState(initialStock);
  const [activeForm, setActiveForm] = useState<'udhar' | 'stock'>('udhar');
  const [udharForm, setUdharForm] = useState({ name: '', amount: '', note: '' });
  const [stockForm, setStockForm] = useState({ item: '', days: '', turn: 'Weekly' });

  const addUdhar = () => {
    if (!udharForm.name.trim() || !udharForm.amount.trim()) return;
    setAccounts((current) => [
      {
        name: udharForm.name.trim(),
        amount: `Rs ${Number(udharForm.amount || 0).toLocaleString('en-IN')}`,
        note: udharForm.note.trim() || 'New udhar entry',
        status: 'New',
        color: C.emerald600,
      },
      ...current,
    ]);
    setUdharForm({ name: '', amount: '', note: '' });
  };

  const addStock = () => {
    if (!stockForm.item.trim() || !stockForm.days.trim()) return;
    setStockCycle((current) => [
      {
        item: stockForm.item.trim(),
        days: `${stockForm.days.trim()} days stock`,
        turn: stockForm.turn,
        level: Math.min(92, Math.max(18, Number(stockForm.days || 1) * 8)),
      },
      ...current,
    ]);
    setStockForm({ item: '', days: '', turn: 'Weekly' });
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-slate-900 text-2xl font-black">Shop Ledger</Text>
          <Text className="text-slate-500 text-sm mt-1">Udhar book and stock cycle</Text>
        </View>
        <View className="w-11 h-11 rounded-full bg-emerald-600 items-center justify-center">
          <Feather name="shopping-bag" size={20} color="#fff" />
        </View>
      </View>

      <View className="flex-row bg-white border border-slate-100 rounded-2xl p-1 mb-4">
        {(['udhar', 'stock'] as const).map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setActiveForm(item)}
            className={`flex-1 py-3 rounded-xl items-center ${activeForm === item ? 'bg-emerald-600' : ''}`}
          >
            <Text className={`font-black ${activeForm === item ? 'text-white' : 'text-slate-600'}`}>
              {item === 'udhar' ? 'Add Udhar' : 'Add Stock'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        {activeForm === 'udhar' ? (
          <>
            <Text className="text-slate-900 font-black mb-3">New Udhar Entry</Text>
            <TextInput value={udharForm.name} onChangeText={(name) => setUdharForm({ ...udharForm, name })} placeholder="Customer or supplier name" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <TextInput value={udharForm.amount} onChangeText={(amount) => setUdharForm({ ...udharForm, amount })} placeholder="Amount" keyboardType="numeric" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <TextInput value={udharForm.note} onChangeText={(note) => setUdharForm({ ...udharForm, note })} placeholder="Due date or note" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3" />
            <TouchableOpacity onPress={addUdhar} className="bg-emerald-600 rounded-xl py-3 items-center">
              <Text className="text-white font-black">Save Udhar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-slate-900 font-black mb-3">New Stock Cycle Item</Text>
            <TextInput value={stockForm.item} onChangeText={(item) => setStockForm({ ...stockForm, item })} placeholder="Item name" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <TextInput value={stockForm.days} onChangeText={(days) => setStockForm({ ...stockForm, days })} placeholder="Days of stock left" keyboardType="numeric" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <View className="flex-row mb-3">
              {['Weekly', 'Monthly'].map((turn) => (
                <TouchableOpacity key={turn} onPress={() => setStockForm({ ...stockForm, turn })} className={`flex-1 py-3 rounded-xl items-center mr-2 ${stockForm.turn === turn ? 'bg-emerald-600' : 'bg-slate-100'}`}>
                  <Text className={`font-black ${stockForm.turn === turn ? 'text-white' : 'text-slate-600'}`}>{turn}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={addStock} className="bg-emerald-600 rounded-xl py-3 items-center">
              <Text className="text-white font-black">Save Stock Item</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text className="text-slate-900 text-base font-black mb-3">Udhar Book</Text>
      {accounts.map((account) => (
        <View key={`${account.name}-${account.amount}`} className="bg-white rounded-2xl border border-slate-100 p-4 mb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-row flex-1 items-center">
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
        </View>
      ))}

      <Text className="text-slate-900 text-base font-black mt-2 mb-3">Stock Cycle</Text>
      {stockCycle.map((row) => (
        <View key={`${row.item}-${row.days}`} className="bg-white rounded-2xl border border-slate-100 p-4 mb-3">
          <View className="flex-row justify-between mb-2">
            <View>
              <Text className="text-slate-900 font-black">{row.item}</Text>
              <Text className="text-slate-500 text-xs mt-1">{row.days}</Text>
            </View>
            <Text className="text-slate-700 font-bold">{row.turn}</Text>
          </View>
          <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <View className="h-2 bg-emerald-500 rounded-full" style={{ width: `${row.level}%` }} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
