import { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { PaymentMeta, ShiftMeta, Transaction } from '../../types';

type ShiftRow = {
  id: string;
  name: string;
  days: string;
  pay: string;
  payRaw: number;
  daysRaw: number;
  status: string;
  progress: number;
};

type PaymentRow = {
  id: string;
  person: string;
  amount: string;
  due: string;
};

function txToShift(tx: Transaction): ShiftRow {
  const m = (tx.ledgerMeta ?? {}) as ShiftMeta;
  return {
    id:       tx.id,
    name:     m.siteName    ?? tx.note ?? 'Unknown',
    days:     m.daysWorked  ?? '',
    pay:      `Rs ${tx.amount.toLocaleString('en-IN')}`,
    payRaw:   tx.amount,
    daysRaw:  parseInt(m.daysWorked ?? '0', 10) || 0,
    status:   m.status      ?? 'Logged',
    progress: m.progress    ?? 0,
  };
}

function txToPayment(tx: Transaction): PaymentRow {
  const m = (tx.ledgerMeta ?? {}) as PaymentMeta;
  return {
    id:     tx.id,
    person: m.personName ?? tx.note ?? 'Unknown',
    amount: `Rs ${tx.amount.toLocaleString('en-IN')}`,
    due:    m.dueDate    ?? '',
  };
}

// Helper: get current month start/end in ISO
function thisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  return { start, end };
}

export function WageTracker() {
  const t = useTranslations();
  const [shifts, setShifts]         = useState<ShiftRow[]>([]);
  const [payments, setPayments]     = useState<PaymentRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [activeForm, setActiveForm] = useState<'shift' | 'payment'>('shift');
  const [shiftForm, setShiftForm]   = useState({ site: '', days: '', pay: '' });
  const [paymentForm, setPaymentForm] = useState({ person: '', amount: '', due: '' });

  const fetchEntries = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await endpoints.getLedgerEntries('DAILY_WAGE');
      const grouped = res.data?.data?.grouped ?? {};
      setShifts((grouped['Shift']        ?? []).map(txToShift));
      setPayments((grouped['Payment Due'] ?? []).map(txToPayment));
    } catch {
      Alert.alert('Error', t.couldNotLoadData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Compute this-month totals from shift data
  const { monthDays, monthPay } = useMemo(() => {
    const { start, end } = thisMonthRange();
    const monthShifts = shifts; // already sorted desc from API; all shifts belong to user
    const days = monthShifts.reduce((a, s) => a + s.daysRaw, 0);
    const pay  = monthShifts.reduce((a, s) => a + s.payRaw,  0);
    return { monthDays: days, monthPay: pay };
  }, [shifts]);

  const saveShift = async () => {
    if (!shiftForm.site.trim() || !shiftForm.days.trim() || !shiftForm.pay.trim()) return;
    setSaving(true);
    try {
      const daysNum = parseInt(shiftForm.days, 10) || 0;
      await endpoints.addLedgerEntry({
        amount:     parseFloat(shiftForm.pay) || 0,
        type:       'income',
        category:   'Shift',
        note:       shiftForm.site.trim(),
        ledgerMeta: {
          siteName:   shiftForm.site.trim(),
          daysWorked: `${daysNum} days`,
          status:     'Logged',
          progress:   Math.min(100, daysNum * 4),
        },
      });
      setShiftForm({ site: '', days: '', pay: '' });
      fetchEntries();
    } catch {
      Alert.alert('Error', 'Could not save shift entry.');
    } finally {
      setSaving(false);
    }
  };

  const savePayment = async () => {
    if (!paymentForm.person.trim() || !paymentForm.amount.trim()) return;
    setSaving(true);
    try {
      await endpoints.addLedgerEntry({
        amount:     parseFloat(paymentForm.amount) || 0,
        type:       'income',
        category:   'Payment Due',
        note:       paymentForm.person.trim(),
        ledgerMeta: {
          personName: paymentForm.person.trim(),
          dueDate:    paymentForm.due.trim() || 'Today',
        },
      });
      setPaymentForm({ person: '', amount: '', due: '' });
      fetchEntries();
    } catch {
      Alert.alert('Error', 'Could not save payment due.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, type: 'Shift' | 'Payment Due') => {
    Alert.alert(`Delete ${type}?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await endpoints.deleteLedgerEntry(id);
            if (type === 'Shift') setShifts((p) => p.filter((r) => r.id !== id));
            else setPayments((p) => p.filter((r) => r.id !== id));
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
          <Text className="text-slate-900 text-2xl font-black">Wage Tracker</Text>
          <Text className="text-slate-500 text-sm mt-1">Shift tracker and payment due</Text>
        </View>
        <View className="w-11 h-11 rounded-full bg-emerald-600 items-center justify-center">
          <Feather name="briefcase" size={20} color="#fff" />
        </View>
      </View>

      {/* Tab switcher */}
      <View className="flex-row bg-white border border-slate-100 rounded-2xl p-1 mb-4">
        {(['shift', 'payment'] as const).map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setActiveForm(item)}
            className={`flex-1 py-3 rounded-xl items-center ${activeForm === item ? 'bg-emerald-600' : ''}`}
          >
            <Text className={`font-black ${activeForm === item ? 'text-white' : 'text-slate-600'}`}>
              {item === 'shift' ? 'Add Shift' : 'Add Payment Due'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Form */}
      <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        {activeForm === 'shift' ? (
          <>
            <Text className="text-slate-900 font-black mb-3">New Shift Entry</Text>
            <TextInput
              value={shiftForm.site}
              onChangeText={(site) => setShiftForm({ ...shiftForm, site })}
              placeholder="Work site or employer"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={shiftForm.days}
              onChangeText={(days) => setShiftForm({ ...shiftForm, days })}
              placeholder="Days worked"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={shiftForm.pay}
              onChangeText={(pay) => setShiftForm({ ...shiftForm, pay })}
              placeholder="Expected pay (Rs)"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3"
            />
            <TouchableOpacity onPress={saveShift} disabled={saving} className="bg-emerald-600 rounded-xl py-3 items-center">
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-black">Save Shift</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-slate-900 font-black mb-3">New Payment Due</Text>
            <TextInput
              value={paymentForm.person}
              onChangeText={(person) => setPaymentForm({ ...paymentForm, person })}
              placeholder="Person or employer"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={paymentForm.amount}
              onChangeText={(amount) => setPaymentForm({ ...paymentForm, amount })}
              placeholder="Amount due (Rs)"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={paymentForm.due}
              onChangeText={(due) => setPaymentForm({ ...paymentForm, due })}
              placeholder="Due date (e.g. Friday)"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3"
            />
            <TouchableOpacity onPress={savePayment} disabled={saving} className="bg-emerald-600 rounded-xl py-3 items-center">
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-black">Save Payment Due</Text>
              }
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Loading */}
      {loading ? (
        <View className="items-center py-10">
          <ActivityIndicator color={C.emerald600} size="large" />
          <Text className="text-slate-400 mt-3 text-sm">Loading wages…</Text>
        </View>
      ) : (
        <>
          {/* Monthly summary banner — computed from live shift data */}
          <View className="bg-emerald-600 rounded-2xl p-5 mb-4">
            <Text className="text-emerald-50 text-xs font-bold">This month (all shifts)</Text>
            <View className="flex-row items-end justify-between mt-1">
              <View>
                <Text className="text-white text-3xl font-black">{monthDays} days</Text>
                <Text className="text-emerald-50 text-xs mt-1">Total days logged</Text>
              </View>
              <View className="items-end">
                <Text className="text-white text-xl font-black">
                  Rs {monthPay.toLocaleString('en-IN')}
                </Text>
                <Text className="text-emerald-50 text-xs mt-1">Expected pay</Text>
              </View>
            </View>
          </View>

          {/* Shift Tracker */}
          <Text className="text-slate-900 text-base font-black mb-3">Shift Tracker</Text>
          {shifts.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-100 p-6 items-center mb-3">
              <Text className="text-slate-400 text-sm">No shifts logged yet.</Text>
            </View>
          ) : shifts.map((shift) => (
            <TouchableOpacity
              key={shift.id}
              onLongPress={() => handleDelete(shift.id, 'Shift')}
              activeOpacity={0.8}
              className="bg-white rounded-2xl border border-slate-100 p-4 mb-3"
            >
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-slate-900 font-black text-base">{shift.name}</Text>
                  <Text className="text-slate-500 text-xs mt-1">{shift.days}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-emerald-700 font-black">{shift.pay}</Text>
                  <Text className="text-slate-500 text-xs mt-1">{shift.status}</Text>
                </View>
              </View>
              <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <View className="h-2 bg-emerald-500 rounded-full" style={{ width: `${shift.progress}%` }} />
              </View>
              <Text className="text-slate-300 text-[10px] mt-2">Long press to delete</Text>
            </TouchableOpacity>
          ))}

          {/* Payment Due */}
          <Text className="text-slate-900 text-base font-black mt-2 mb-3">Payment Due</Text>
          {payments.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-100 p-6 items-center mb-3">
              <Text className="text-slate-400 text-sm">No pending payments.</Text>
            </View>
          ) : payments.map((payment) => (
            <TouchableOpacity
              key={payment.id}
              onLongPress={() => handleDelete(payment.id, 'Payment Due')}
              activeOpacity={0.8}
              className="bg-white rounded-2xl border border-slate-100 p-4 mb-3 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center mr-3">
                <Feather name="clock" size={18} color={C.amber600} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-black">{payment.person}</Text>
                <Text className="text-slate-500 text-xs mt-1">Expected in {payment.due}</Text>
                <Text className="text-slate-300 text-[10px] mt-1">Long press to delete</Text>
              </View>
              <Text className="text-amber-700 font-black">{payment.amount}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}
