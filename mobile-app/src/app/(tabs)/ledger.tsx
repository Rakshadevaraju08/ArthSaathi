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
type LedgerTab = 'Expenses' | 'Lending' | 'Borrowing';
type TxTab = 'All' | 'Income' | 'Expense';

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

// Loan/Borrow Card Component
function LoanCard({ 
  loan, 
  type, 
  onPress 
}: { 
  loan: any; 
  type: 'lent' | 'borrowed'; 
  onPress: () => void;
}) {
  const isOverdue = loan.dueDate && new Date(loan.dueDate) < new Date() && loan.status !== 'paid';
  const progress = ((loan.amount - loan.remainingAmount) / loan.amount) * 100;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="p-3 mb-2.5">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-sm font-bold text-slate-800">{loan.personName}</Text>
            <Text className="text-xs text-slate-500 mt-0.5">
              {type === 'lent' ? 'You lent' : 'You borrowed'} • {loan.date}
            </Text>
          </View>
          <View className={`px-2 py-1 rounded-full ${
            loan.status === 'paid' ? 'bg-green-100' : 
            isOverdue ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            <Text className={`text-[10px] font-semibold ${
              loan.status === 'paid' ? 'text-green-700' : 
              isOverdue ? 'text-red-700' : 'text-amber-700'
            }`}>
              {loan.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Active'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-end justify-between mb-2">
          <View>
            <Text className="text-xs text-slate-500">Total Amount</Text>
            <Text className="text-lg font-bold text-slate-800">{fmt(loan.amount)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-slate-500">Remaining</Text>
            <Text className={`text-base font-bold ${
              loan.remainingAmount === 0 ? 'text-green-600' : 
              type === 'lent' ? 'text-emerald-600' : 'text-orange-600'
            }`}>
              {fmt(loan.remainingAmount)}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        {loan.status !== 'paid' && (
          <View className="mt-1">
            <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <View 
                className={`h-full ${type === 'lent' ? 'bg-emerald-500' : 'bg-orange-500'}`}
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-[10px] text-slate-400 mt-1">
              {Math.round(progress)}% repaid
              {loan.interestRate > 0 && ` • ${loan.interestRate}% interest`}
            </Text>
          </View>
        )}
      </Card>
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

  const [ledgerTab, setLedgerTab] = useState<LedgerTab>('Expenses');
  const [txTab, setTxTab] = useState<TxTab>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanType, setLoanType] = useState<'lent' | 'borrowed'>('lent');

  // Transaction form
  const [form, setForm] = useState({ 
    type: 'expense' as TxType, 
    label: '', 
    amount: '', 
    category: 'Other' 
  });

  // Loan form
  const [loanForm, setLoanForm] = useState({
    personName: '',
    amount: '',
    interestRate: '',
    dueDate: '',
  });

  const filtered = transactions.filter((t) =>
    txTab === 'All' ? true : txTab === 'Income' ? t.type === 'income' : t.type === 'expense'
  );

  const lentLoans = useMemo(() => loans.filter((l) => l.type === 'lent'), [loans]);
  const borrowedLoans = useMemo(() => loans.filter((l) => l.type === 'borrowed'), [loans]);

  const totalLent = useMemo(() => 
    lentLoans.reduce((sum, l) => sum + l.remainingAmount, 0), [lentLoans]
  );
  const totalBorrowed = useMemo(() => 
    borrowedLoans.reduce((sum, l) => sum + l.remainingAmount, 0), [borrowedLoans]
  );

  const byCat = useMemo(() => {
    const m: Record<string, number> = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const submitTransaction = () => {
    const amt = parseFloat(form.amount);
    if (!amt || !form.label.trim()) {
      Alert.alert('Missing info', 'Fill in all fields');
      return;
    }
    addTransaction({ 
      type: form.type, 
      amount: amt, 
      label: form.label.trim(), 
      category: form.category 
    });
    setForm({ type: 'expense', label: '', amount: '', category: 'Other' });
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
    const actions: any[] = [];

    if (loan.status !== 'paid') {
      actions.push({
        text: '💰 Add Repayment',
        onPress: () => {
          Alert.prompt(
            'Add Repayment',
            `Remaining: ${fmt(loan.remainingAmount)}`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Add',
                onPress: (value) => {
                  const amt = parseFloat(value || '0');
                  if (amt > 0 && amt <= loan.remainingAmount) {
                    const newRemaining = loan.remainingAmount - amt;
                    updateLoan(loan.id, {
                      remainingAmount: newRemaining,
                      status: newRemaining === 0 ? 'paid' : 'active',
                    });
                  }
                },
              },
            ],
            'plain-text'
          );
        },
      });

      actions.push({
        text: '✅ Mark as Paid',
        onPress: () => {
          updateLoan(loan.id, { remainingAmount: 0, status: 'paid' });
        },
      });
    }

    actions.push({
      text: '🗑 Delete',
      style: 'destructive',
      onPress: () => {
        Alert.alert('Delete Loan', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => removeLoan(loan.id) },
        ]);
      },
    });

    actions.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      loan.personName,
      `${loan.type === 'lent' ? 'You lent' : 'You borrowed'}\n${fmt(loan.amount)} • Remaining: ${fmt(loan.remainingAmount)}`,
      actions
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']} style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3.5 bg-white border-b border-slate-100">
        <Text className="text-base font-bold text-slate-800">My Ledger</Text>
        <TouchableOpacity
          onPress={() => {
            if (ledgerTab === 'Expenses') setShowAdd(true);
            else {
              setLoanType(ledgerTab === 'Lending' ? 'lent' : 'borrowed');
              setShowLoanForm(true);
            }
          }}
          className="w-9 h-9 rounded-full bg-emerald-500 items-center justify-center"
          style={{ 
            shadowColor: C.emerald500, 
            shadowOffset: { width: 0, height: 3 }, 
            shadowOpacity: 0.35, 
            shadowRadius: 6, 
            elevation: 4 
          }}
        >
          <Feather name="plus" size={18} color={C.white} />
        </TouchableOpacity>
      </View>

      {/* Main Ledger Tabs */}
      <View className="flex-row gap-2 px-4 py-2.5 bg-white border-b border-slate-100">
        {(['Expenses', 'Lending', 'Borrowing'] as LedgerTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setLedgerTab(t)}
            className={`px-3.5 py-1.5 rounded-full ${
              ledgerTab === t ? 'bg-emerald-500' : 'bg-white border border-slate-200'
            }`}
          >
            <Text className={`text-xs font-semibold ${ledgerTab === t ? 'text-white' : 'text-slate-600'}`}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* EXPENSES TAB */}
      {ledgerTab === 'Expenses' && (
        <>
          {/* Sub-tabs for expenses */}
          <View className="flex-row gap-2 px-4 py-2 bg-slate-50">
            {(['All', 'Income', 'Expense'] as TxTab[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTxTab(t)}
                className={`px-3 py-1.5 rounded-full ${
                  txTab === t ? 'bg-emerald-500' : 'bg-white border border-slate-200'
                }`}
              >
                <Text className={`text-xs font-medium ${txTab === t ? 'text-white' : 'text-slate-600'}`}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }} 
            showsVerticalScrollIndicator={false}
          >
            {/* Breakdown chart */}
            {byCat.length > 0 && (
              <Card className="p-3 mb-4">
                <Text className="text-sm font-semibold text-slate-800 mb-1">Expense Breakdown</Text>
                <DonutChart data={byCat} />
              </Card>
            )}

            {/* Transaction list */}
            <View className="gap-2">
              {filtered.length === 0 ? (
                <View className="items-center py-16">
                  <Text className="text-5xl mb-3">📭</Text>
                  <Text className="text-sm text-slate-500">No transactions yet</Text>
                </View>
              ) : (
                filtered.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    onPress={() =>
                      Alert.alert(tx.label, `${tx.category} · ${tx.date}\n${fmt(tx.amount)}`, [
                        { 
                          text: '🗑 Delete', 
                          style: 'destructive', 
                          onPress: () => removeTransaction(tx.id) 
                        },
                        { text: 'Cancel', style: 'cancel' },
                      ])
                    }
                  />
                ))
              )}
            </View>
          </ScrollView>
        </>
      )}

      {/* LENDING TAB */}
      {ledgerTab === 'Lending' && (
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }} 
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card */}
          <Card className="p-4 mb-4">
            <LinearGradient
              colors={['#ecfdf5', '#d1fae5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 12, padding: 16 }}
            >
              <Text className="text-xs text-emerald-700 font-medium mb-1">Total Amount Lent</Text>
              <Text className="text-2xl font-bold text-emerald-800">{fmt(totalLent)}</Text>
              <Text className="text-xs text-emerald-600 mt-1">
                {lentLoans.filter(l => l.status === 'active').length} active loans
              </Text>
            </LinearGradient>
          </Card>

          {/* Loan list */}
          {lentLoans.length === 0 ? (
            <View className="items-center py-16">
              <Text className="text-5xl mb-3">🤝</Text>
              <Text className="text-sm text-slate-500">No lending records yet</Text>
              <Text className="text-xs text-slate-400 mt-1">Tap + to add a loan you gave</Text>
            </View>
          ) : (
            lentLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} type="lent" onPress={() => handleLoanPress(loan)} />
            ))
          )}
        </ScrollView>
      )}

      {/* BORROWING TAB */}
      {ledgerTab === 'Borrowing' && (
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }} 
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card */}
          <Card className="p-4 mb-4">
            <LinearGradient
              colors={['#fff7ed', '#fed7aa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 12, padding: 16 }}
            >
              <Text className="text-xs text-orange-700 font-medium mb-1">Total Amount Borrowed</Text>
              <Text className="text-2xl font-bold text-orange-800">{fmt(totalBorrowed)}</Text>
              <Text className="text-xs text-orange-600 mt-1">
                {borrowedLoans.filter(l => l.status === 'active').length} active debts
              </Text>
            </LinearGradient>
          </Card>

          {/* Loan list */}
          {borrowedLoans.length === 0 ? (
            <View className="items-center py-16">
              <Text className="text-5xl mb-3">💰</Text>
              <Text className="text-sm text-slate-500">No borrowing records yet</Text>
              <Text className="text-xs text-slate-400 mt-1">Tap + to add money you borrowed</Text>
            </View>
          ) : (
            borrowedLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} type="borrowed" onPress={() => handleLoanPress(loan)} />
            ))
          )}
        </ScrollView>
      )}

      {/* Add Transaction Sheet */}
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
              className={`flex-1 py-2 rounded-xl items-center ${
                form.type === tp ? 'bg-emerald-500' : 'bg-slate-100'
              }`}
            >
              <Text className={`text-xs font-semibold capitalize ${
                form.type === tp ? 'text-white' : 'text-slate-600'
              }`}>
                {tp}
              </Text>
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
                <Text className={`text-xs font-medium ${
                  form.category === cat ? 'text-emerald-700' : 'text-slate-600'
                }`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity onPress={submitTransaction}>
          <LinearGradient
            colors={[C.emerald500, C.teal600]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text className="text-white font-bold text-base">Add Transaction</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BottomSheet>

      {/* Add Loan Sheet */}
      <BottomSheet visible={showLoanForm} onClose={() => setShowLoanForm(false)}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-slate-800">
            {loanType === 'lent' ? 'Money I Gave' : 'Money I Took'}
          </Text>
          <TouchableOpacity onPress={() => setShowLoanForm(false)}>
            <Feather name="x" size={18} color={C.slate400} />
          </TouchableOpacity>
        </View>

        <TextInput
          value={loanForm.personName}
          onChangeText={(v) => setLoanForm({ ...loanForm, personName: v })}
          placeholder={loanType === 'lent' ? 'Person you lent to' : 'Person you borrowed from'}
          placeholderTextColor={C.slate400}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 mb-2 bg-slate-50"
        />
        <TextInput
          value={loanForm.amount}
          onChangeText={(v) => setLoanForm({ ...loanForm, amount: v })}
          placeholder="Amount (₹)"
          keyboardType="numeric"
          placeholderTextColor={C.slate400}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 mb-2 bg-slate-50"
        />
        <TextInput
          value={loanForm.interestRate}
          onChangeText={(v) => setLoanForm({ ...loanForm, interestRate: v })}
          placeholder="Interest Rate % (optional)"
          keyboardType="numeric"
          placeholderTextColor={C.slate400}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 mb-2 bg-slate-50"
        />
        <TextInput
          value={loanForm.dueDate}
          onChangeText={(v) => setLoanForm({ ...loanForm, dueDate: v })}
          placeholder="Due Date (YYYY-MM-DD, optional)"
          placeholderTextColor={C.slate400}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 mb-4 bg-slate-50"
        />

        <TouchableOpacity onPress={submitLoan}>
          <LinearGradient
            colors={[C.emerald500, C.teal600]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text className="text-white font-bold text-base">
              {loanType === 'lent' ? 'Add Lending' : 'Add Borrowing'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </BottomSheet>
    </SafeAreaView>
  );
}