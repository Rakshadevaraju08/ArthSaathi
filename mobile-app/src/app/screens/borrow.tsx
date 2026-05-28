import React, { useMemo } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { C } from '../../constants/colors';
import { useStore } from '../../store';
import { useTranslations } from '../../hooks/useTranslations';

const fmt = (n: number) => 'Rs ' + n.toLocaleString('en-IN');

function formatDate(dateValue: string | null) {
  if (!dateValue) return 'No due date';
  const date = new Date(dateValue);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BorrowScreen() {
  const router = useRouter();
  const t = useTranslations();
  const loans = useStore((state) => state.loans);

  const activeBorrowings = useMemo(
    () => loans.filter((loan) => loan.type === 'borrowed'),
    [loans]
  );

  const summary = useMemo(() => {
    const totalBorrowed = activeBorrowings.reduce((sum, loan) => sum + loan.amount, 0);
    const totalRemaining = activeBorrowings.reduce((sum, loan) => sum + loan.remainingAmount, 0);
    const overdueCount = activeBorrowings.filter((loan) => loan.status === 'overdue').length;
    const lenderCount = new Set(activeBorrowings.map((loan) => loan.personName)).size;
    const nextDue = [...activeBorrowings].sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      return (a.dueDate ?? '').localeCompare(b.dueDate ?? '');
    })[0];

    return { totalBorrowed, totalRemaining, overdueCount, lenderCount, nextDue };
  }, [activeBorrowings]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[C.emerald600, C.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 22,
            paddingBottom: 24,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-white text-2xl font-black">{t.borrowerFlow}</Text>
              <Text className="text-emerald-50 text-sm mt-2 leading-5">
                {t.whatHappensNext}
              </Text>
            </View>
            <View className="w-12 h-12 rounded-2xl bg-white/15 items-center justify-center">
              <Feather name="credit-card" size={20} color="#fff" />
            </View>
          </View>

          <View className="flex-row mt-4 space-x-3">
            <MetricCard label={t.remainingBalance} value={fmt(summary.totalRemaining)} />
            <MetricCard label={t.originalBorrowed} value={fmt(summary.totalBorrowed)} />
          </View>
        </LinearGradient>

        <View className="px-5 mt-5">
          <View className="bg-white rounded-3xl border border-slate-100 p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">{t.quickSnapshot}</Text>
                <Text className="text-slate-900 text-lg font-black mt-1">{summary.lenderCount} {t.lendersAndBanks}</Text>
              </View>
              <View className="w-12 h-12 rounded-2xl bg-emerald-50 items-center justify-center">
                <Feather name="trending-down" size={20} color={C.emerald600} />
              </View>
            </View>

            <View className="flex-row mt-4 gap-3">
              <StatPill label={t.dueSoon} value={summary.overdueCount ? `${summary.overdueCount} overdue` : 'No overdue'} />
              <StatPill label={t.nextPayment} value={summary.nextDue ? formatDate(summary.nextDue.dueDate) : 'None'} />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-slate-900 text-base font-black mb-3">{t.activeBorrowings}</Text>
            {activeBorrowings.length === 0 ? (
              <View className="bg-white rounded-3xl border border-slate-100 p-6 items-center">
                <Feather name="check-circle" size={24} color={C.emerald600} />
                <Text className="text-slate-500 text-sm mt-3">{t.noMockBorrowings}</Text>
              </View>
            ) : (
              activeBorrowings.map((loan) => {
                const progress = Math.max(0, Math.min(100, Math.round(((loan.amount - loan.remainingAmount) / loan.amount) * 100)));
                const statusColor = loan.status === 'overdue' ? C.rose600 : C.emerald600;
                const dueLabel = loan.status === 'overdue' ? 'Overdue' : 'Due on';

                return (
                  <TouchableOpacity
                    key={loan.id}
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/screens/borrow-result', params: { loanId: loan.id } } as any)}
                    className="bg-white rounded-3xl border border-slate-100 p-4 mb-3"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-slate-900 font-black text-base">{loan.personName}</Text>
                        <Text className="text-slate-500 text-xs mt-1">Borrowed on {formatDate(loan.date)}</Text>
                      </View>
                      <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: `${statusColor}12` }}>
                        <Text className="text-[11px] font-black" style={{ color: statusColor }}>
                          {loan.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row mt-4 gap-3">
                      <BorrowStat label="Remaining" value={fmt(loan.remainingAmount)} />
                      <BorrowStat label="Interest" value={`${loan.interestRate}%`} />
                    </View>

                    <View className="mt-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-slate-500 text-xs font-semibold">
                          {dueLabel} {formatDate(loan.dueDate)}
                        </Text>
                        <Text className="text-slate-900 text-xs font-black">{progress}% repaid</Text>
                      </View>
                      <View className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <View
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.max(progress, 6)}%`,
                            backgroundColor: loan.status === 'overdue' ? C.rose500 : C.emerald500,
                          }}
                        />
                      </View>
                    </View>

                    <View className="mt-4 flex-row items-center justify-between">
                      <Text className="text-slate-400 text-[11px]">Tap to open payment flow</Text>
                      <View className="flex-row items-center">
                        <Text className="text-emerald-600 font-black mr-1">Pay now</Text>
                        <Feather name="arrow-right" size={16} color={C.emerald600} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View className="bg-white rounded-3xl border border-slate-100 p-4">
              <Text className="text-slate-900 text-base font-black">{t.whatHappensNext}</Text>
              <Text className="text-slate-600 text-sm mt-2 leading-5">
                {t.paymentRecordedLocally}
              </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-white/15 border border-white/20 px-4 py-3">
      <Text className="text-emerald-50 text-[11px] font-semibold">{label}</Text>
      <Text className="text-white text-base font-black mt-1">{value}</Text>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-3">
      <Text className="text-slate-500 text-[11px] font-semibold">{label}</Text>
      <Text className="text-slate-900 text-sm font-black mt-1">{value}</Text>
    </View>
  );
}

function BorrowStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-3">
      <Text className="text-slate-500 text-[11px] font-semibold">{label}</Text>
      <Text className="text-slate-900 text-sm font-black mt-1">{value}</Text>
    </View>
  );
}
