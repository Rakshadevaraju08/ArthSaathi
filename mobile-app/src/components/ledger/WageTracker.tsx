import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { C } from '../../constants/colors';

type Shift = { name: string; days: string; pay: string; status: string; progress: number };
type Payment = { person: string; amount: string; due: string };

const initialShifts: Shift[] = [
  { name: 'Construction site', days: '8 days', pay: 'Rs 4,800', status: 'Paid', progress: 100 },
  { name: 'Farm loading work', days: '6 days', pay: 'Rs 3,000', status: 'Pending', progress: 55 },
  { name: 'Market unloading', days: '5 days', pay: 'Rs 1,750', status: 'Cash due', progress: 40 },
];

const initialPayments: Payment[] = [
  { person: 'Site supervisor', amount: 'Rs 1,800', due: 'Today' },
  { person: 'Farm contractor', amount: 'Rs 1,200', due: '2 days' },
  { person: 'Market yard', amount: 'Rs 750', due: 'Friday' },
];

export function WageTracker() {
  const [shifts, setShifts] = useState(initialShifts);
  const [payments, setPayments] = useState(initialPayments);
  const [activeForm, setActiveForm] = useState<'shift' | 'payment'>('shift');
  const [shiftForm, setShiftForm] = useState({ site: '', days: '', pay: '' });
  const [paymentForm, setPaymentForm] = useState({ person: '', amount: '', due: '' });

  const addShift = () => {
    if (!shiftForm.site.trim() || !shiftForm.days.trim() || !shiftForm.pay.trim()) return;
    setShifts((current) => [
      {
        name: shiftForm.site.trim(),
        days: `${shiftForm.days.trim()} days`,
        pay: `Rs ${Number(shiftForm.pay || 0).toLocaleString('en-IN')}`,
        status: 'Logged',
        progress: Math.min(100, Number(shiftForm.days || 1) * 4),
      },
      ...current,
    ]);
    setShiftForm({ site: '', days: '', pay: '' });
  };

  const addPayment = () => {
    if (!paymentForm.person.trim() || !paymentForm.amount.trim()) return;
    setPayments((current) => [
      {
        person: paymentForm.person.trim(),
        amount: `Rs ${Number(paymentForm.amount || 0).toLocaleString('en-IN')}`,
        due: paymentForm.due.trim() || 'Today',
      },
      ...current,
    ]);
    setPaymentForm({ person: '', amount: '', due: '' });
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-slate-900 text-2xl font-black">Wage Tracker</Text>
          <Text className="text-slate-500 text-sm mt-1">Shift tracker and payment due</Text>
        </View>
        <View className="w-11 h-11 rounded-full bg-emerald-600 items-center justify-center">
          <Feather name="briefcase" size={20} color="#fff" />
        </View>
      </View>

      <View className="flex-row bg-white border border-slate-100 rounded-2xl p-1 mb-4">
        {(['shift', 'payment'] as const).map((item) => (
          <TouchableOpacity key={item} onPress={() => setActiveForm(item)} className={`flex-1 py-3 rounded-xl items-center ${activeForm === item ? 'bg-emerald-600' : ''}`}>
            <Text className={`font-black ${activeForm === item ? 'text-white' : 'text-slate-600'}`}>
              {item === 'shift' ? 'Add Shift' : 'Add Payment Due'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        {activeForm === 'shift' ? (
          <>
            <Text className="text-slate-900 font-black mb-3">New Shift Entry</Text>
            <TextInput value={shiftForm.site} onChangeText={(site) => setShiftForm({ ...shiftForm, site })} placeholder="Work site or employer" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <TextInput value={shiftForm.days} onChangeText={(days) => setShiftForm({ ...shiftForm, days })} placeholder="Days worked" keyboardType="numeric" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <TextInput value={shiftForm.pay} onChangeText={(pay) => setShiftForm({ ...shiftForm, pay })} placeholder="Expected pay" keyboardType="numeric" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3" />
            <TouchableOpacity onPress={addShift} className="bg-emerald-600 rounded-xl py-3 items-center">
              <Text className="text-white font-black">Save Shift</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-slate-900 font-black mb-3">New Payment Due</Text>
            <TextInput value={paymentForm.person} onChangeText={(person) => setPaymentForm({ ...paymentForm, person })} placeholder="Person or employer" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <TextInput value={paymentForm.amount} onChangeText={(amount) => setPaymentForm({ ...paymentForm, amount })} placeholder="Amount due" keyboardType="numeric" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <TextInput value={paymentForm.due} onChangeText={(due) => setPaymentForm({ ...paymentForm, due })} placeholder="Due date" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3" />
            <TouchableOpacity onPress={addPayment} className="bg-emerald-600 rounded-xl py-3 items-center">
              <Text className="text-white font-black">Save Payment Due</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View className="bg-emerald-600 rounded-2xl p-5 mb-4">
        <Text className="text-emerald-50 text-xs font-bold">This month</Text>
        <View className="flex-row items-end justify-between mt-1">
          <View>
            <Text className="text-white text-3xl font-black">19 days</Text>
            <Text className="text-emerald-50 text-xs mt-1">Target 24 shift days</Text>
          </View>
          <View className="items-end">
            <Text className="text-white text-xl font-black">Rs 9,550</Text>
            <Text className="text-emerald-50 text-xs mt-1">Expected pay</Text>
          </View>
        </View>
      </View>

      <Text className="text-slate-900 text-base font-black mb-3">Shift Tracker</Text>
      {shifts.map((shift) => (
        <View key={`${shift.name}-${shift.pay}`} className="bg-white rounded-2xl border border-slate-100 p-4 mb-3">
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
        </View>
      ))}

      <Text className="text-slate-900 text-base font-black mt-2 mb-3">Payment Due</Text>
      {payments.map((payment) => (
        <View key={`${payment.person}-${payment.amount}`} className="bg-white rounded-2xl border border-slate-100 p-4 mb-3 flex-row items-center">
          <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center mr-3">
            <Feather name="clock" size={18} color={C.amber600} />
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 font-black">{payment.person}</Text>
            <Text className="text-slate-500 text-xs mt-1">Expected in {payment.due}</Text>
          </View>
          <Text className="text-amber-700 font-black">{payment.amount}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
