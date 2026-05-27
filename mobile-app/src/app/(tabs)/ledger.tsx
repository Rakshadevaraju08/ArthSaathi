import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { BottomSheet } from '../../components/ui/BottomSheet';
import { TransactionRow } from '../../components/ui/TransactionRow';
import { C, CHART_COLORS } from '../../constants/colors';
import { useStore } from '../../store';
import type { TxType } from '../../types';

const fmt = (n: number) => 'Rs ' + n.toLocaleString('en-IN');
type LedgerTab = 'Expenses' | 'Lending' | 'Borrowing';
type TxTab = 'All' | 'Income' | 'Expense';

const ledgerConfig = {
  FARMER: {
    title: 'Farm Ledger',
    descriptionPlaceholder: 'Seeds, fertilizer, labour, crop sale...',
    categories: ['Seeds', 'Fertilizer', 'Labour', 'Crop Sale', 'Transport', 'Irrigation', 'Other'],
  },
  SHOP_OWNER: {
    title: 'Shop Ledger',
    descriptionPlaceholder: 'Stock purchase, udhar received, supplier payment...',
    categories: ['Stock Purchase', 'Udhar Received', 'Supplier Payment', 'Daily Sale', 'Rent', 'Transport', 'Other'],
  },
  TAILOR: {
    title: 'Tailor Ledger',
    descriptionPlaceholder: 'Cloth, thread, order advance, delivery payment...',
    categories: ['Cloth', 'Thread', 'Order Advance', 'Delivery Payment', 'Machine Repair', 'Helper Wage', 'Other'],
  },
  DAILY_WAGE: {
    title: 'Wage Ledger',
    descriptionPlaceholder: 'Shift income, travel, food, pending wage...',
    categories: ['Shift Income', 'Travel', 'Food', 'Tools', 'Pending Wage', 'Cash Received', 'Other'],
  },
};

function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
      {data.map((d, i) => (
        <View key={d.name} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 14, marginBottom: 8 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              marginRight: 6,
            }}
          />
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#334155' }}>
            {d.name}: {Math.round((d.value / total) * 100)}%
          </Text>
        </View>
      ))}
    </View>
  );
}

function LoanCard({ loan, type, onPress }: { loan: any; type: 'lent' | 'borrowed'; onPress: () => void }) {
  const isOverdue = loan.dueDate && new Date(loan.dueDate) < new Date() && loan.status !== 'paid';
  const progress = ((loan.amount - loan.remainingAmount) / loan.amount) * 100;
  const statusBg = loan.status === 'paid' ? '#dcfce7' : isOverdue ? '#fee2e2' : '#fef3c7';
  const statusText = loan.status === 'paid' ? '#15803d' : isOverdue ? '#b91c1c' : '#b45309';
  const statusLabel = loan.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Active';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b' }}>{loan.personName}</Text>
            <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {type === 'lent' ? 'You lent' : 'You borrowed'} - {loan.date}
            </Text>
          </View>
          <View style={{ backgroundColor: statusBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: statusText }}>{statusLabel}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <View>
            <Text style={{ fontSize: 11, color: '#64748b' }}>Total Amount</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>{fmt(loan.amount)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: '#64748b' }}>Remaining</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: loan.remainingAmount === 0 ? '#16a34a' : type === 'lent' ? C.emerald600 : '#ea580c' }}>
              {fmt(loan.remainingAmount)}
            </Text>
          </View>
        </View>

        {loan.status !== 'paid' && (
          <View>
            <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${progress}%`, backgroundColor: type === 'lent' ? C.emerald500 : '#f97316' }} />
            </View>
            <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
              {Math.round(progress)}% repaid
              {loan.interestRate > 0 ? ` - ${loan.interestRate}% interest` : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function LedgerScreen() {
  const transactions = useStore((s) => s.transactions);
  const loans = useStore((s) => s.loans || []);
  const addTransaction = useStore((s) => s.addTransaction);
  const removeTransaction = useStore((s) => s.removeTransaction);
  const addLoan = useStore((s) => s.addLoan);
  const updateLoan = useStore((s) => s.updateLoan);
  const removeLoan = useStore((s) => s.removeLoan);
  const occupation = useStore((s) => s.occupation);
  const config = ledgerConfig[occupation];

  const [ledgerTab, setLedgerTab] = useState<LedgerTab>('Expenses');
  const [txTab, setTxTab] = useState<TxTab>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanType, setLoanType] = useState<'lent' | 'borrowed'>('lent');
  const [form, setForm] = useState({ type: 'expense' as TxType, note: '', amount: '', category: 'Other' });
  const [loanForm, setLoanForm] = useState({ personName: '', amount: '', interestRate: '', dueDate: '' });

  const filtered = transactions.filter((t) =>
    txTab === 'All' ? true : txTab === 'Income' ? t.type === 'income' : t.type === 'expense'
  );
  const lentLoans = useMemo(() => loans.filter((l) => l.type === 'lent'), [loans]);
  const borrowedLoans = useMemo(() => loans.filter((l) => l.type === 'borrowed'), [loans]);
  const totalLent = useMemo(() => lentLoans.reduce((s, l) => s + l.remainingAmount, 0), [lentLoans]);
  const totalBorrowed = useMemo(() => borrowedLoans.reduce((s, l) => s + l.remainingAmount, 0), [borrowedLoans]);
  const byCat = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const submitTransaction = () => {
    const amt = parseFloat(form.amount);
    if (!amt || !form.note.trim()) {
      Alert.alert('Missing info', 'Fill in all fields');
      return;
    }
    addTransaction({ type: form.type, amount: amt, note: form.note.trim(), category: form.category });
    setForm({ type: 'expense', note: '', amount: '', category: 'Other' });
    setShowAdd(false);
  };

  const submitLoan = () => {
    const amt = parseFloat(loanForm.amount);
    const interest = parseFloat(loanForm.interestRate || '0');
    if (!amt || !loanForm.personName.trim()) {
      Alert.alert('Missing info', 'Enter person name and amount');
      return;
    }
    addLoan({
      type: loanType,
      personName: loanForm.personName.trim(),
      amount: amt,
      remainingAmount: amt,
      interestRate: interest,
      dueDate: loanForm.dueDate || null,
      status: 'active',
      date: new Date().toISOString().split('T')[0],
    });
    setLoanForm({ personName: '', amount: '', interestRate: '', dueDate: '' });
    setShowLoanForm(false);
  };

  const handleLoanPress = (loan: any) => {
    Alert.alert(loan.personName, `${fmt(loan.amount)} - remaining ${fmt(loan.remainingAmount)}`, [
      { text: 'Add Repayment', onPress: () => updateLoan(loan.id, { remainingAmount: Math.max(0, loan.remainingAmount - 500) }) },
      { text: 'Mark Paid', onPress: () => updateLoan(loan.id, { remainingAmount: 0, status: 'paid' }) },
      { text: 'Delete', style: 'destructive', onPress: () => removeLoan(loan.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a' }}>{config.title}</Text>
          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Inputs change by profession</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (ledgerTab === 'Expenses') setShowAdd(true);
            else {
              setLoanType(ledgerTab === 'Lending' ? 'lent' : 'borrowed');
              setShowLoanForm(true);
            }
          }}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.emerald500, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', margin: 16, marginBottom: 0, borderRadius: 12, padding: 4 }}>
        {(['Expenses', 'Lending', 'Borrowing'] as LedgerTab[]).map((t) => {
          const active = ledgerTab === t;
          return (
            <TouchableOpacity key={t} onPress={() => setLedgerTab(t)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: active ? C.emerald500 : 'transparent' }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: active ? '#fff' : '#334155' }}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {ledgerTab === 'Expenses' && (
        <>
          <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
            {(['All', 'Income', 'Expense'] as TxTab[]).map((t) => {
              const active = txTab === t;
              return (
                <TouchableOpacity key={t} onPress={() => setTxTab(t)} style={{ paddingHorizontal: 16, paddingVertical: 7, borderRadius: 99, backgroundColor: active ? C.emerald500 : '#fff', borderWidth: active ? 0 : 1, borderColor: '#e2e8f0', marginRight: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: active ? '#fff' : '#475569' }}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            {byCat.length > 0 && (
              <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-100">
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#1e293b', marginBottom: 4 }}>Distribution</Text>
                <DonutChart data={byCat} />
              </View>
            )}
            {filtered.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 64 }}>
                <Text style={{ fontSize: 14, color: '#64748b' }}>No transactions yet</Text>
              </View>
            ) : (
              filtered.map((tx) => (
                <View key={tx.id} style={{ marginBottom: 8 }}>
                  <TransactionRow
                    tx={tx}
                    onPress={() =>
                      Alert.alert(tx.note, `${tx.category} - ${tx.date}\n${fmt(tx.amount)}`, [
                        { text: 'Delete', style: 'destructive', onPress: () => removeTransaction(tx.id) },
                        { text: 'Cancel', style: 'cancel' },
                      ])
                    }
                  />
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}

      {ledgerTab === 'Lending' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <LinearGradient colors={['#ecfdf5', '#d1fae5']} style={{ borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: '#065f46', fontWeight: '600' }}>Total Amount Lent</Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#064e3b' }}>{fmt(totalLent)}</Text>
          </LinearGradient>
          {lentLoans.map((loan) => <LoanCard key={loan.id} loan={loan} type="lent" onPress={() => handleLoanPress(loan)} />)}
        </ScrollView>
      )}

      {ledgerTab === 'Borrowing' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <LinearGradient colors={['#fff7ed', '#fed7aa']} style={{ borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: '#7c2d12', fontWeight: '600' }}>Total Amount Borrowed</Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#7c2d12' }}>{fmt(totalBorrowed)}</Text>
          </LinearGradient>
          {borrowedLoans.map((loan) => <LoanCard key={loan.id} loan={loan} type="borrowed" onPress={() => handleLoanPress(loan)} />)}
        </ScrollView>
      )}

      <BottomSheet visible={showAdd} onClose={() => setShowAdd(false)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>Add Transaction</Text>
          <TouchableOpacity onPress={() => setShowAdd(false)}>
            <Feather name="x" size={20} color={C.slate400} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 14 }}>
          {(['expense', 'income'] as TxType[]).map((tp) => {
            const active = form.type === tp;
            return (
              <TouchableOpacity key={tp} onPress={() => setForm({ ...form, type: tp })} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: active ? (tp === 'income' ? C.emerald500 : C.rose500) : 'transparent' }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: active ? '#fff' : '#334155', textTransform: 'capitalize' }}>{tp}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TextInput value={form.note} onChangeText={(v) => setForm({ ...form, note: v })} placeholder={config.descriptionPlaceholder} placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3" />
        <TextInput value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} placeholder="Amount (Rs)" keyboardType="numeric" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row' }}>
            {config.categories.map((cat) => {
              const active = form.category === cat;
              return (
                <TouchableOpacity key={cat} onPress={() => setForm({ ...form, category: cat })} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: active ? C.emerald600 : '#cbd5e1', backgroundColor: active ? '#ecfdf5' : '#fff', marginRight: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: active ? C.emerald600 : '#334155' }}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        <TouchableOpacity onPress={submitTransaction}>
          <LinearGradient colors={[C.emerald500, C.teal600]} style={{ borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Save Record</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BottomSheet>

      <BottomSheet visible={showLoanForm} onClose={() => setShowLoanForm(false)}>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 16 }}>
          {loanType === 'lent' ? 'Money I Gave' : 'Money I Took'}
        </Text>
        {[
          { value: loanForm.personName, onChange: (v: string) => setLoanForm({ ...loanForm, personName: v }), placeholder: loanType === 'lent' ? 'Person you lent to' : 'Person you borrowed from', keyboardType: 'default' as const },
          { value: loanForm.amount, onChange: (v: string) => setLoanForm({ ...loanForm, amount: v }), placeholder: 'Amount (Rs)', keyboardType: 'numeric' as const },
          { value: loanForm.interestRate, onChange: (v: string) => setLoanForm({ ...loanForm, interestRate: v }), placeholder: 'Interest Rate % (optional)', keyboardType: 'numeric' as const },
          { value: loanForm.dueDate, onChange: (v: string) => setLoanForm({ ...loanForm, dueDate: v }), placeholder: 'Due Date (YYYY-MM-DD, optional)', keyboardType: 'default' as const },
        ].map((field) => (
          <TextInput key={field.placeholder} value={field.value} onChangeText={field.onChange} placeholder={field.placeholder} keyboardType={field.keyboardType} placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3" />
        ))}
        <TouchableOpacity onPress={submitLoan}>
          <LinearGradient colors={[C.emerald500, C.teal600]} style={{ borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
              {loanType === 'lent' ? 'Add Lending' : 'Add Borrowing'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </BottomSheet>
    </SafeAreaView>
  );
}
