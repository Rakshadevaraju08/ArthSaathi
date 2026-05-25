import React, { useMemo, useState, useEffect } from 'react';
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
import { endpoints } from '../../services/api';
import type { TxType } from '../../types';

const fmt = (n: number) => 'Rs ' + n.toLocaleString('en-IN');
type LedgerTab = 'Expenses' | 'Lending' | 'Borrowing';
type TxTab = 'All' | 'Income' | 'Expense';

// ── Donut chart — Kotlin FlowRow category legend style ────────
function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 8 }}>
      {data.map((d, i) => (
        <View key={d.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 10, height: 10, borderRadius: 5,
              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
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

// ── Loan card — matching Kotlin progress bar style ────────────
function LoanCard({
  loan, type, onPress,
}: {
  loan: any; type: 'lent' | 'borrowed'; onPress: () => void;
}) {
  const isOverdue = loan.dueDate && new Date(loan.dueDate) < new Date() && loan.status !== 'paid';
  const progress  = ((loan.amount - loan.remainingAmount) / loan.amount) * 100;

  const statusBg    = loan.status === 'paid' ? '#dcfce7' : isOverdue ? '#fee2e2' : '#fef3c7';
  const statusText  = loan.status === 'paid' ? '#15803d' : isOverdue ? '#b91c1c' : '#b45309';
  const statusLabel = loan.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Active';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        {/* Top row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b' }}>
              {loan.personName}
            </Text>
            <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {type === 'lent' ? 'You lent' : 'You borrowed'} • {loan.date}
            </Text>
          </View>
          <View style={{ backgroundColor: statusBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: statusText }}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Amount row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
          <View>
            <Text style={{ fontSize: 11, color: '#64748b' }}>Total Amount</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>
              {fmt(loan.amount)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: '#64748b' }}>Remaining</Text>
            <Text style={{
              fontSize: 16, fontWeight: 'bold',
              color: loan.remainingAmount === 0 ? '#16a34a' : type === 'lent' ? C.emerald600 : '#ea580c',
            }}>
              {fmt(loan.remainingAmount)}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        {loan.status !== 'paid' && (
          <View>
            <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: type === 'lent' ? C.emerald500 : '#f97316',
                  borderRadius: 3,
                }}
              />
            </View>
            <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
              {Math.round(progress)}% repaid
              {loan.interestRate > 0 && ` • ${loan.interestRate}% interest`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function LedgerScreen() {
  const transactions    = useStore((s) => s.transactions);
  const loans           = useStore((s) => s.loans || []);
  const addTransaction  = useStore((s) => s.addTransaction);
  const removeTransaction = useStore((s) => s.removeTransaction);
  const addLoan         = useStore((s) => s.addLoan);
  const updateLoan      = useStore((s) => s.updateLoan);
  const removeLoan      = useStore((s) => s.removeLoan);

  const [ledgerTab,    setLedgerTab]    = useState<LedgerTab>('Expenses');
  const [txTab,        setTxTab]        = useState<TxTab>('All');
  const [showAdd,      setShowAdd]      = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanType,     setLoanType]     = useState<'lent' | 'borrowed'>('lent');

  const [form, setForm] = useState({
    type: 'expense' as TxType, note: '', amount: '', category: 'Other',
  });
  const [loanForm, setLoanForm] = useState({
    personName: '', amount: '', interestRate: '', dueDate: '',
  });

  const filtered = transactions.filter((t) =>
    txTab === 'All' ? true : txTab === 'Income' ? t.type === 'income' : t.type === 'expense'
  );

  const lentLoans     = useMemo(() => loans.filter((l) => l.type === 'lent'),     [loans]);
  const borrowedLoans = useMemo(() => loans.filter((l) => l.type === 'borrowed'), [loans]);
  const totalLent     = useMemo(() => lentLoans.reduce((s, l)     => s + l.remainingAmount, 0), [lentLoans]);
  const totalBorrowed = useMemo(() => borrowedLoans.reduce((s, l) => s + l.remainingAmount, 0), [borrowedLoans]);

  const byCat = useMemo(() => {
    const m: Record<string, number> = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const submitTransaction = async () => {
    const amt = parseFloat(form.amount);
    if (!amt || !form.note.trim()) { Alert.alert('Missing info', 'Fill in all fields'); return; }
    try {
      await endpoints.addTransaction({
        amount: amt,
        type: form.type,
        category: form.category,
        note: form.note.trim(),
      });
    } catch { /* offline fallback — still add locally */ }
    addTransaction({ type: form.type, amount: amt, note: form.note.trim(), category: form.category });
    setForm({ type: 'expense', note: '', amount: '', category: 'Other' });
    setShowAdd(false);
  };

  const submitLoan = () => {
    const amt      = parseFloat(loanForm.amount);
    const interest = parseFloat(loanForm.interestRate || '0');
    if (!amt || !loanForm.personName.trim()) {
      Alert.alert('Missing info', 'Enter person name and amount'); return;
    }
    addLoan({
      type: loanType, personName: loanForm.personName.trim(),
      amount: amt, remainingAmount: amt, interestRate: interest,
      dueDate: loanForm.dueDate || null, status: 'active',
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
          Alert.prompt('Add Repayment', `Remaining: ${fmt(loan.remainingAmount)}`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add',
              onPress: (value) => {
                const amt = parseFloat(value || '0');
                if (amt > 0 && amt <= loan.remainingAmount) {
                  const newRemaining = loan.remainingAmount - amt;
                  updateLoan(loan.id, { remainingAmount: newRemaining, status: newRemaining === 0 ? 'paid' : 'active' });
                }
              },
            },
          ], 'plain-text');
        },
      });
      actions.push({ text: '✅ Mark as Paid', onPress: () => updateLoan(loan.id, { remainingAmount: 0, status: 'paid' }) });
    }
    actions.push({
      text: '🗑 Delete', style: 'destructive',
      onPress: () => Alert.alert('Delete Loan', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeLoan(loan.id) },
      ]),
    });
    actions.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(
      loan.personName,
      `${loan.type === 'lent' ? 'You lent' : 'You borrowed'}\n${fmt(loan.amount)} • Remaining: ${fmt(loan.remainingAmount)}`,
      actions
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>

      {/* ── Header — Kotlin style ── */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
      }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a' }}>
          Smart Ledger
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (ledgerTab === 'Expenses') setShowAdd(true);
            else { setLoanType(ledgerTab === 'Lending' ? 'lent' : 'borrowed'); setShowLoanForm(true); }
          }}
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: C.emerald500,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: C.emerald500, shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.35, shadowRadius: 6, elevation: 4,
          }}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Main ledger tabs — Kotlin segmented control style ── */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 20, paddingVertical: 10,
        backgroundColor: '#f1f5f9',
        margin: 16, marginBottom: 0,
        borderRadius: 12,
        gap: 4,
      }}>
        {(['Expenses', 'Lending', 'Borrowing'] as LedgerTab[]).map((t) => {
          const active = ledgerTab === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setLedgerTab(t)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor: active ? C.emerald500 : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: 'bold',
                color: active ? '#fff' : '#334155',
              }}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ══════════════════════════════════════
          EXPENSES TAB
      ══════════════════════════════════════ */}
      {ledgerTab === 'Expenses' && (
        <>
          {/* Sub-tabs — Kotlin filter row */}
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4,
            gap: 8,
          }}>
            {(['All', 'Income', 'Expense'] as TxTab[]).map((t) => {
              const active = txTab === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTxTab(t)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 7,
                    borderRadius: 99,
                    backgroundColor: active ? C.emerald500 : '#fff',
                    borderWidth: active ? 0 : 1,
                    borderColor: '#e2e8f0',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: active ? '#fff' : '#475569' }}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Distribution card — Kotlin style */}
            {byCat.length > 0 && (
              <View
                style={{
                  backgroundColor: '#fff', borderRadius: 16, padding: 16,
                  marginBottom: 16,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#1e293b', marginBottom: 4 }}>
                  Distribution / प्रतिशत विश्लेषण
                </Text>
                <DonutChart data={byCat} />
              </View>
            )}

            {/* Transaction list */}
            <View style={{ gap: 8 }}>
              {filtered.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 64 }}>
                  <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
                  <Text style={{ fontSize: 14, color: '#64748b' }}>No transactions yet</Text>
                </View>
              ) : (
                filtered.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    onPress={() =>
                      Alert.alert(tx.note, `${tx.category} · ${tx.date}\n${fmt(tx.amount)}`, [
                        { text: '🗑 Delete', style: 'destructive', onPress: async () => {
                          try { await endpoints.deleteTransaction(tx.id); } catch { /* offline fallback */ }
                          removeTransaction(tx.id);
                        }},
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

      {/* ══════════════════════════════════════
          LENDING TAB
      ══════════════════════════════════════ */}
      {ledgerTab === 'Lending' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary card */}
          <LinearGradient
            colors={['#ecfdf5', '#d1fae5']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ borderRadius: 16, padding: 18, marginBottom: 16 }}
          >
            <Text style={{ fontSize: 12, color: '#065f46', fontWeight: '600', marginBottom: 4 }}>
              Total Amount Lent
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#064e3b' }}>
              {fmt(totalLent)}
            </Text>
            <Text style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
              {lentLoans.filter((l) => l.status === 'active').length} active loans
            </Text>
          </LinearGradient>

          {lentLoans.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🤝</Text>
              <Text style={{ fontSize: 14, color: '#64748b' }}>No lending records yet</Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Tap + to add a loan you gave</Text>
            </View>
          ) : (
            lentLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} type="lent" onPress={() => handleLoanPress(loan)} />
            ))
          )}
        </ScrollView>
      )}

      {/* ══════════════════════════════════════
          BORROWING TAB
      ══════════════════════════════════════ */}
      {ledgerTab === 'Borrowing' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary card */}
          <LinearGradient
            colors={['#fff7ed', '#fed7aa']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ borderRadius: 16, padding: 18, marginBottom: 16 }}
          >
            <Text style={{ fontSize: 12, color: '#7c2d12', fontWeight: '600', marginBottom: 4 }}>
              Total Amount Borrowed
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#7c2d12' }}>
              {fmt(totalBorrowed)}
            </Text>
            <Text style={{ fontSize: 12, color: '#ea580c', marginTop: 4 }}>
              {borrowedLoans.filter((l) => l.status === 'active').length} active debts
            </Text>
          </LinearGradient>

          {borrowedLoans.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>💰</Text>
              <Text style={{ fontSize: 14, color: '#64748b' }}>No borrowing records yet</Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Tap + to add money you borrowed</Text>
            </View>
          ) : (
            borrowedLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} type="borrowed" onPress={() => handleLoanPress(loan)} />
            ))
          )}
        </ScrollView>
      )}

      {/* ══════════════════════════════════════
          ADD TRANSACTION SHEET
      ══════════════════════════════════════ */}
      <BottomSheet visible={showAdd} onClose={() => setShowAdd(false)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>
            Add Transaction
          </Text>
          <TouchableOpacity onPress={() => setShowAdd(false)}>
            <Feather name="x" size={20} color={C.slate400} />
          </TouchableOpacity>
        </View>

        {/* Income / Expense toggle — Kotlin pill style */}
        <View style={{
          flexDirection: 'row', gap: 0,
          backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 14,
        }}>
          {(['expense', 'income'] as TxType[]).map((tp) => {
            const active = form.type === tp;
            return (
              <TouchableOpacity
                key={tp}
                onPress={() => setForm({ ...form, type: tp })}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                  backgroundColor: active
                    ? (tp === 'income' ? C.emerald500 : C.rose500)
                    : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: 'bold',
                  color: active ? '#fff' : '#334155',
                  textTransform: 'capitalize',
                }}>
                  {tp}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description input */}
        <TextInput
          value={form.note}
          onChangeText={(v) => setForm({ ...form, note: v })}
          placeholder="Description / विवरण"
          placeholderTextColor="#94a3b8"
          style={{
            borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 12,
            fontSize: 14, color: '#1e293b',
            backgroundColor: '#f8fafc', marginBottom: 12,
          }}
        />

        {/* Amount input */}
        <TextInput
          value={form.amount}
          onChangeText={(v) => setForm({ ...form, amount: v })}
          placeholder="Amount / राशि (Rs)"
          keyboardType="numeric"
          placeholderTextColor="#94a3b8"
          style={{
            borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 12,
            fontSize: 14, color: '#1e293b',
            backgroundColor: '#f8fafc', marginBottom: 14,
          }}
        />

        {/* Category chips */}
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 8 }}>
          Category / प्रकार
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
            {ALL_CATEGORIES.map((cat) => {
              const active = form.category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setForm({ ...form, category: cat })}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8,
                    borderRadius: 20, borderWidth: 1,
                    borderColor: active ? C.emerald600 : '#cbd5e1',
                    backgroundColor: active ? '#ecfdf5' : '#fff',
                  }}
                >
                  <Text style={{
                    fontSize: 12, fontWeight: 'bold',
                    color: active ? C.emerald600 : '#334155',
                  }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Submit */}
        <TouchableOpacity onPress={submitTransaction}>
          <LinearGradient
            colors={[C.emerald500, C.teal600]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
              Save Record / सुरक्षित करें
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </BottomSheet>

      {/* ══════════════════════════════════════
          ADD LOAN SHEET
      ══════════════════════════════════════ */}
      <BottomSheet visible={showLoanForm} onClose={() => setShowLoanForm(false)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>
            {loanType === 'lent' ? 'Money I Gave' : 'Money I Took'}
          </Text>
          <TouchableOpacity onPress={() => setShowLoanForm(false)}>
            <Feather name="x" size={20} color={C.slate400} />
          </TouchableOpacity>
        </View>

        {[
          {
            value: loanForm.personName,
            onChange: (v: string) => setLoanForm({ ...loanForm, personName: v }),
            placeholder: loanType === 'lent' ? 'Person you lent to' : 'Person you borrowed from',
            keyboardType: 'default' as const,
          },
          {
            value: loanForm.amount,
            onChange: (v: string) => setLoanForm({ ...loanForm, amount: v }),
            placeholder: 'Amount (Rs)',
            keyboardType: 'numeric' as const,
          },
          {
            value: loanForm.interestRate,
            onChange: (v: string) => setLoanForm({ ...loanForm, interestRate: v }),
            placeholder: 'Interest Rate % (optional)',
            keyboardType: 'numeric' as const,
          },
          {
            value: loanForm.dueDate,
            onChange: (v: string) => setLoanForm({ ...loanForm, dueDate: v }),
            placeholder: 'Due Date (YYYY-MM-DD, optional)',
            keyboardType: 'default' as const,
          },
        ].map((field, i) => (
          <TextInput
            key={i}
            value={field.value}
            onChangeText={field.onChange}
            placeholder={field.placeholder}
            keyboardType={field.keyboardType}
            placeholderTextColor="#94a3b8"
            style={{
              borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
              paddingHorizontal: 14, paddingVertical: 12,
              fontSize: 14, color: '#1e293b',
              backgroundColor: '#f8fafc', marginBottom: 12,
            }}
          />
        ))}

        <TouchableOpacity onPress={submitLoan} style={{ marginTop: 4 }}>
          <LinearGradient
            colors={[C.emerald500, C.teal600]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
              {loanType === 'lent' ? 'Add Lending' : 'Add Borrowing'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </BottomSheet>

    </SafeAreaView>
  );
}