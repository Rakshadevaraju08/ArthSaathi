import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { C } from '../../constants/colors';
import { useStore } from '../../store';
import { useTranslations } from '../../hooks/useTranslations';

type FlowStep = 'summary' | 'gateway' | 'processing' | 'success' | 'analysis' | 'insights';

type PaymentMethod = {
  id: string;
  label: string;
  note: string;
  icon: keyof typeof Feather.glyphMap;
};

const paymentMethods: PaymentMethod[] = [
  { id: 'upi', label: 'UPI', note: 'GPay, PhonePe or BHIM', icon: 'smartphone' },
  { id: 'bank', label: 'Bank Transfer', note: 'NEFT / IMPS / RTGS', icon: 'credit-card' },
  { id: 'wallet', label: 'Wallet', note: 'Mock wallet rails', icon: 'aperture' },
  { id: 'card', label: 'Debit Card', note: 'Saved card on file', icon: 'shield' },
];

const fmt = (n: number) => 'Rs ' + n.toLocaleString('en-IN');

function formatDate(dateValue: string | null) {
  if (!dateValue) return 'No due date';
  return new Date(dateValue).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function calcDueAmount(remaining: number) {
  return Math.min(remaining, Math.max(2500, Math.round((remaining * 0.35) / 100) * 100));
}

export default function BorrowResultScreen() {
  const router = useRouter();
  const t = useTranslations();
  const params = useLocalSearchParams<{ loanId?: string }>();
  const loans = useStore((state) => state.loans);
  const recordLoanRepayment = useStore((state) => state.recordLoanRepayment);

  const loan = loans.find((item) => item.id === params.loanId) ?? loans[0];
  const [step, setStep] = useState<FlowStep>('summary');
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [paymentAmount] = useState(() => calcDueAmount(loan?.remainingAmount ?? 0));
  const [transactionId] = useState(() => `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const appliedRef = useRef(false);

  useEffect(() => {
    appliedRef.current = false;
  }, [loan?.id]);

  useEffect(() => {
    if (step !== 'processing' || !loan || appliedRef.current) return;
    const timer = setTimeout(() => {
      appliedRef.current = true;
      recordLoanRepayment(loan.id, paymentAmount, selectedMethod.label);
      setStep('success');
    }, 1800);
    return () => clearTimeout(timer);
  }, [step, loan, paymentAmount, recordLoanRepayment, selectedMethod.label]);

  useEffect(() => {
    if (step !== 'analysis') return;
    const timer = setTimeout(() => setStep('insights'), 2200);
    return () => clearTimeout(timer);
  }, [step]);

  if (!loan) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-slate-900 text-lg font-black">No borrowings found</Text>
        <Text className="text-slate-500 text-sm mt-2 text-center">Add a mock borrowing in the store to begin the payment flow.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-5 bg-emerald-600 px-5 py-3 rounded-2xl">
          <Text className="text-white font-black">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const paymentProgress = Math.max(0, Math.min(100, Math.round(((loan.amount - loan.remainingAmount) / loan.amount) * 100)));
  const remainingAfterPayment = Math.max(0, loan.remainingAmount - paymentAmount);
  const completed = loan.status === 'paid' || remainingAfterPayment === 0;
  const steps: FlowStep[] = ['summary', 'gateway', 'processing', 'success', 'analysis', 'insights'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[C.emerald600, C.teal600]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-white/15 items-center justify-center">
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-black mt-4">{t.paymentFlow}</Text>
          <Text className="text-emerald-50 text-sm mt-2 leading-5">{t.paymentRecordedLocally}</Text>
          <View className="flex-row mt-4">
            {steps.map((item, index) => (
              <View key={item} className="flex-1 items-center">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: index <= currentStepIndex ? '#fff' : 'rgba(255,255,255,0.35)' }} />
              </View>
            ))}
          </View>
        </LinearGradient>

        <View className="px-5 mt-5">
          {step === 'summary' && (
            <SectionCard title={t.paymentInitiation}>
              <KeyValue label={t.borrower} value={loan.personName} />
              <KeyValue label={t.amountDueNow} value={fmt(paymentAmount)} />
              <KeyValue label={t.originalBorrowed} value={fmt(loan.amount)} />
              <KeyValue label={t.remainingBalance} value={fmt(loan.remainingAmount)} />
              <KeyValue label={t.dueDate} value={formatDate(loan.dueDate)} />
              <View className="mt-4 bg-emerald-50 rounded-2xl p-4">
                <Text className="text-emerald-900 font-black">{t.repaymentProgress}</Text>
                <View className="h-2 bg-emerald-100 rounded-full overflow-hidden mt-3">
                  <View className="h-2 bg-emerald-500 rounded-full" style={{ width: `${Math.max(paymentProgress, 8)}%` }} />
                </View>
                <Text className="text-emerald-700 text-xs mt-2 font-semibold">{paymentProgress}% of this borrowing has already been repaid.</Text>
              </View>
              <TouchableOpacity onPress={() => setStep('gateway')} className="bg-emerald-600 rounded-2xl py-4 items-center mt-4">
                <Text className="text-white font-black">{t.proceedToPayment}</Text>
              </TouchableOpacity>
            </SectionCard>
          )}

          {step === 'gateway' && (
            <SectionCard title={t.selectPaymentMethod}>
              <Text className="text-slate-500 text-sm mb-4">{t.amountPayable}</Text>
              <View className="gap-3">
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setSelectedMethod(method)}
                    className={`rounded-2xl border p-4 flex-row items-center justify-between ${selectedMethod.id === method.id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                  >
                    <View className="flex-row items-center flex-1 pr-3">
                      <View className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${selectedMethod.id === method.id ? 'bg-emerald-600' : 'bg-slate-100'}`}>
                        <Feather name={method.icon} size={18} color={selectedMethod.id === method.id ? '#fff' : C.slate500} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-900 font-black">{method.label}</Text>
                        <Text className="text-slate-500 text-xs mt-1">{method.note}</Text>
                      </View>
                    </View>
                    {selectedMethod.id === method.id ? <Feather name="check-circle" size={18} color={C.emerald600} /> : null}
                  </TouchableOpacity>
                ))}
              </View>
              <View className="bg-slate-50 rounded-2xl p-4 mt-4">
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">{t.amountPayable}</Text>
                <Text className="text-slate-900 text-2xl font-black mt-1">{fmt(paymentAmount)}</Text>
                <Text className="text-slate-500 text-xs mt-2">This mock payment will reduce the remaining balance on the selected borrowing.</Text>
              </View>
              <TouchableOpacity onPress={() => setStep('processing')} className="bg-emerald-600 rounded-2xl py-4 items-center mt-4">
                <Text className="text-white font-black">{t.payNow}</Text>
              </TouchableOpacity>
            </SectionCard>
          )}

          {step === 'processing' && (
            <SectionCard title={t.processingPayment}>
              <View className="items-center py-6">
                <View className="w-36 h-36 rounded-full border-8 border-emerald-100 items-center justify-center">
                  <View className="w-24 h-24 rounded-full bg-emerald-50 items-center justify-center">
                    <Feather name="shield" size={32} color={C.emerald600} />
                  </View>
                </View>
                <Text className="text-slate-900 text-xl font-black mt-5 text-center">{t.verifyingRepayment}</Text>
                <Text className="text-slate-500 text-sm mt-2 text-center">Please do not close the app or press back.</Text>
                <ActivityIndicator color={C.emerald600} className="mt-5" />
              </View>
            </SectionCard>
          )}

          {step === 'success' && (
            <SectionCard title={t.paymentSuccess}>
              <View className="items-center py-3">
                <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center">
                  <Feather name="check" size={36} color={C.emerald600} />
                </View>
                <Text className="text-emerald-700 text-2xl font-black mt-4">{t.paymentSuccessful}</Text>
                <Text className="text-slate-500 text-sm mt-2 text-center">{t.paymentRecordedLocally}</Text>
              </View>
              <View className="bg-slate-50 rounded-2xl p-4 mt-2">
                <KeyValue label={t.transactionId} value={transactionId} />
                <KeyValue label={t.method} value={selectedMethod.label} />
                <KeyValue label={t.paidTo} value={loan.personName} />
                <KeyValue label={t.amount} value={fmt(paymentAmount)} />
                <KeyValue label={t.remainingAfterPayment} value={fmt(remainingAfterPayment)} />
              </View>
              <TouchableOpacity onPress={() => setStep('analysis')} className="bg-emerald-600 rounded-2xl py-4 items-center mt-4">
                <Text className="text-white font-black">{t.viewInsights}</Text>
              </TouchableOpacity>
            </SectionCard>
          )}

          {step === 'analysis' && (
            <SectionCard title={t.analyzingYourPayment}>
              <View className="items-center py-6">
                <View className="w-28 h-28 rounded-full border-8 border-indigo-100 items-center justify-center">
                  <Feather name="cpu" size={32} color="#6366f1" />
                </View>
                <Text className="text-slate-900 text-lg font-black mt-5">{t.updatingRepaymentInsights}</Text>
              </View>
              <View className="space-y-3">
                <AnalysisRow label="Categorizing repayment" done />
                <AnalysisRow label="Reducing outstanding balance" done />
                <AnalysisRow label="Checking due dates" done />
                <AnalysisRow label="Generating ledger summary" active />
              </View>
              <View className="bg-slate-50 rounded-2xl p-4 mt-4">
                <Text className="text-slate-500 text-sm">This may take a few seconds...</Text>
              </View>
            </SectionCard>
          )}

          {step === 'insights' && (
            <SectionCard title={t.ledgerUpdated}>
              <View className="flex-row gap-3 mb-4">
                <InsightCard label={t.newBalance} value={fmt(remainingAfterPayment)} />
                <InsightCard label={t.status} value={completed ? 'Paid down' : 'Active'} />
              </View>
              <View className="bg-emerald-50 rounded-2xl p-4">
                <Text className="text-emerald-900 font-black">{t.mockInsight}</Text>
                <Text className="text-emerald-800 text-sm mt-2 leading-5">
                  {loan.personName}. {t.paymentRecordedLocally}
                </Text>
              </View>
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity onPress={() => router.push('/(tabs)/ledger')} className="flex-1 bg-emerald-600 rounded-2xl py-4 items-center">
                  <Text className="text-white font-black">{t.goToLedger}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep('summary')} className="flex-1 bg-slate-100 rounded-2xl py-4 items-center">
                  <Text className="text-slate-900 font-black">{t.payAnother}</Text>
                </TouchableOpacity>
              </View>
            </SectionCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="bg-white rounded-3xl border border-slate-100 p-4">
      <Text className="text-slate-900 text-base font-black mb-3">{title}</Text>
      {children}
    </View>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
      <Text className="text-slate-500 text-sm">{label}</Text>
      <Text className="text-slate-900 text-sm font-black text-right flex-1 ml-4">{value}</Text>
    </View>
  );
}

function AnalysisRow({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <View className="flex-row items-center py-2">
      <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${done ? 'bg-emerald-600' : active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
        <Feather name={done ? 'check' : active ? 'loader' : 'clock'} size={12} color={done || active ? '#fff' : C.slate500} />
      </View>
      <Text className={`flex-1 text-sm font-semibold ${done || active ? 'text-slate-900' : 'text-slate-500'}`}>{label}</Text>
    </View>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-3">
      <Text className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{label}</Text>
      <Text className="text-slate-900 text-sm font-black mt-1">{value}</Text>
    </View>
  );
}
