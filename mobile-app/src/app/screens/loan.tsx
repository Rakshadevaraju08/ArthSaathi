import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';

import { RiskGauge } from '../../components/ui/RiskGauge';
import { C } from '../../constants/colors';
import { useStore } from '../../store';
import { endpoints } from '../../services/api';
import type { LoanRisk } from '../../types';

const fmt = (n: number) => 'Rs ' + n.toLocaleString('en-IN');

const purposeOptions = {
  FARMER: ['Seeds and fertilizer', 'Irrigation repair', 'Crop transport'],
  SHOP_OWNER: ['Stock purchase', 'Supplier payment', 'Shop repair'],
  TAILOR: ['Machine repair', 'Cloth purchase', 'Order advance'],
  DAILY_WAGE: ['Emergency cash', 'Tools purchase', 'Travel for work'],
};

export default function LoanScreen() {
  const router = useRouter();
  const monthlyIncome = Number(useStore((s) => s.monthlyIncome || 0));
  const monthlyExpenses = Number(useStore((s) => s.monthlyExpenses || 0));
  const hasActiveLoans = useStore((s) => s.hasActiveLoans);
  const pastRepaymentHabit = useStore((s) => s.pastRepaymentHabit);
  const occupation = useStore((s) => s.occupation);
  const setLoanRisk = useStore((s) => s.setLoanRisk);
  const loanRisk = useStore((s) => s.loanRisk);

  const [amount, setAmount] = useState(String(Math.max(10000, Math.round(monthlyIncome * 3))));
  const [months, setMonths] = useState('12');
  const [purpose, setPurpose] = useState('Working capital');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    emi: number;
    total: number;
    risk: LoanRisk;
    eligible: number;
    recommendation?: string;
    debtToIncomeRatio?: string;
    source: 'ai' | 'local';
  }>(null);

  const eligible = useMemo(() => {
    const savings = Math.max(0, monthlyIncome - monthlyExpenses);
    const habitMultiplier = pastRepaymentHabit === 'Never Missed' ? 8 : pastRepaymentHabit === 'Sometimes Delayed' ? 5 : 3;
    return Math.max(10000, Math.round((savings * habitMultiplier) / 1000) * 1000);
  }, [monthlyIncome, monthlyExpenses, pastRepaymentHabit]);

  const calculateLocal = () => {
    const principal = Number(amount);
    const tenure = Number(months);
    const monthlyRate = 0.12 / 12;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
    const burden = monthlyIncome ? emi / monthlyIncome : 1;
    const risk: LoanRisk = burden > 0.45 || pastRepaymentHabit === 'Frequently Missed'
      ? 'high'
      : burden > 0.28 || hasActiveLoans
        ? 'moderate'
        : 'safe';
    return { emi: Math.round(emi), total: Math.round(emi * tenure), risk };
  };

  const analyze = async () => {
    const principal = Number(amount);
    const tenure = Number(months);
    if (!principal || !tenure) {
      Alert.alert('Check loan details', 'Enter loan amount and tenure.');
      return;
    }
    try {
      setLoading(true);

      // Try AI backend first
      const res = await endpoints.loanAnalysis({
        loanAmount: principal,
        interestRate: 12,
        tenureMonths: tenure,
        monthlyIncome,
      });

      const data = res.data?.data?.result;
      const risk: LoanRisk = data?.riskLevel === 'LOW' ? 'safe' : data?.riskLevel === 'MEDIUM' ? 'moderate' : 'high';

      setLoanRisk(risk);
      setResult({
        emi: data?.emi ?? calculateLocal().emi,
        total: data?.totalRepayment ?? calculateLocal().total,
        risk,
        eligible,
        recommendation: data?.recommendation,
        debtToIncomeRatio: data?.debtToIncomeRatio,
        source: 'ai',
      });
    } catch {
      // AI service offline — use local calculation
      const local = calculateLocal();
      setLoanRisk(local.risk);
      setResult({ ...local, eligible, source: 'local' });
    } finally {
      setLoading(false);
    }
  };

  const riskColor = loanRisk === 'safe' ? C.emerald600 : loanRisk === 'moderate' ? C.amber600 : C.rose600;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[C.emerald600, C.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-black">Loan Risk Check</Text>
          <Text className="text-emerald-50 text-sm mt-2">AI-powered loan analysis. Falls back to local estimate when offline.</Text>
        </LinearGradient>

        <View className="px-5 mt-5">
          <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
            <Text className="text-slate-500 text-xs font-bold">Estimated eligible amount</Text>
            <Text className="text-slate-900 text-3xl font-black mt-1">{fmt(eligible)}</Text>
            <Text className="text-slate-500 text-xs mt-2">
              Income {fmt(monthlyIncome)} - Expenses {fmt(monthlyExpenses)}
            </Text>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
            <Text className="text-slate-900 font-black mb-3">Loan details</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Loan amount"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3"
            />
            <TextInput
              value={months}
              onChangeText={setMonths}
              placeholder="Tenure in months"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3"
            />
            <TextInput
              value={purpose}
              onChangeText={setPurpose}
              placeholder="Purpose"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-4"
            />
            <View className="flex-row flex-wrap mb-4">
              {purposeOptions[occupation].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setPurpose(item)}
                  className={`px-3 py-2 rounded-full border mr-2 mb-2 ${purpose === item ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200'}`}
                >
                  <Text className={`text-xs font-black ${purpose === item ? 'text-white' : 'text-slate-600'}`}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={analyze} disabled={loading}>
              <LinearGradient colors={loading ? ['#a7f3d0', '#a7f3d0'] : [C.emerald500, C.teal600]} style={{ borderRadius: 14, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                {loading && <ActivityIndicator color="#fff" size="small" />}
                <Text className="text-white font-black" style={{ marginLeft: loading ? 6 : 0 }}>
                  {loading ? 'Analyzing...' : 'Analyze Loan'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-slate-900 font-black">Risk meter</Text>
              <View style={{ backgroundColor: `${riskColor}1A`, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: riskColor, fontWeight: '900', fontSize: 12, textTransform: 'capitalize' }}>{loanRisk}</Text>
              </View>
            </View>
            <RiskGauge risk={loanRisk} />
          </View>

          {result ? (
            <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text className="text-slate-900 font-black">Analysis result</Text>
                <View style={{ backgroundColor: result.source === 'ai' ? '#ecfdf5' : '#fef3c7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: result.source === 'ai' ? C.emerald600 : C.amber600 }}>
                    {result.source === 'ai' ? '🤖 AI' : '📱 Local'}
                  </Text>
                </View>
              </View>
              <View className="flex-row mb-3">
                <View className="flex-1 bg-emerald-50 rounded-xl p-3 mr-2">
                  <Text className="text-emerald-700 text-xs font-bold">Monthly EMI</Text>
                  <Text className="text-emerald-900 text-xl font-black mt-1">{fmt(result.emi)}</Text>
                </View>
                <View className="flex-1 bg-blue-50 rounded-xl p-3 ml-2">
                  <Text className="text-blue-700 text-xs font-bold">Total repayment</Text>
                  <Text className="text-blue-900 text-xl font-black mt-1">{fmt(result.total)}</Text>
                </View>
              </View>
              {result.recommendation && (
                <View style={{ backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: '#475569', lineHeight: 18 }}>{result.recommendation}</Text>
                </View>
              )}
              {result.debtToIncomeRatio && (
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>Debt-to-Income: {result.debtToIncomeRatio}</Text>
              )}
              <View className="flex-row items-start mt-2">
                <Feather name="info" size={17} color={C.slate500} />
                <Text className="text-slate-600 text-sm ml-2 flex-1">
                  Purpose: {purpose}. Keep EMI below one-third of monthly income for a safer score.
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}