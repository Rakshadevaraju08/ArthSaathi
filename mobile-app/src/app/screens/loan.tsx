import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore, useTotals } from '../../store';
import { RiskGauge } from '../../components/ui/RiskGauge';
import { Card } from '../../components/ui/Card';
import { C } from '../../constants/colors';
import { endpoints } from '../../services/api';
import type { LoanRisk } from '../../types';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

const RESULT_CFG = {
  safe: {
    bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700',
    title: 'SAFE LOAN', msg: 'Great! This loan is within your repayment capacity.', Icon: (p: any) => <MaterialCommunityIcons name="shield-check-outline" {...p} />, iconColor: C.emerald600,
  },
  moderate: {
    bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700',
    title: 'MODERATE RISK', msg: 'Caution: This may strain your monthly budget.', Icon: (p: any) => <MaterialCommunityIcons name="shield-alert-outline" {...p} />, iconColor: C.amber500,
  },
  high: {
    bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700',
    title: 'HIGH RISK', msg: 'Warning: This loan exceeds safe borrowing limits.', Icon: (p: any) => <MaterialCommunityIcons name="alert-outline" {...p} />, iconColor: C.rose600,
  },
};

export default function LoanScreen() {
  const router      = useRouter();
  const { income }  = useTotals();
  const loanRisk    = useStore((s) => s.loanRisk);
  const setLoanRisk = useStore((s) => s.setLoanRisk);

  const [amount,       setAmount]       = useState(50000);
  const [months,       setMonths]       = useState(24);
  const [interestRate, setInterestRate] = useState(12);
  const [monthlyIncome, setMonthlyIncome] = useState(income > 0 ? income : 15000);
  const [analyzed,     setAnalyzed]     = useState(false);
  const [loading,      setLoading]      = useState(false);

  // Backend response data
  const [analysisResult, setAnalysisResult] = useState<{
    emi: number;
    totalRepayment: number;
    riskLevel: string;
    debtToIncomeRatio: string;
    recommendation: string;
  } | null>(null);

  // Local EMI estimate (for preview before analyze)
  const localEMI = Math.round((amount * (1 + interestRate / 100)) / months);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await endpoints.loanAnalysis({
        loanAmount: amount,
        interestRate,
        tenureMonths: months,
        monthlyIncome,
      });
      const { result } = res.data.data;
      setAnalysisResult(result);

      // Map backend riskLevel to store's LoanRisk type
      const level = result.riskLevel?.toUpperCase();
      const risk: LoanRisk = level === 'LOW' ? 'safe' : level === 'MEDIUM' ? 'moderate' : 'high';
      setLoanRisk(risk);
      setAnalyzed(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Loan analysis failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const r = RESULT_CFG[loanRisk];

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3.5 bg-white border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
        >
          <Text className="text-xl text-slate-700 mt-[-2px]">‹</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-base font-bold text-slate-800">Loan Risk Analysis</Text>
          <Text className="text-xs text-slate-500">AI-powered safe borrowing check</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View>
          <Card className="p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-medium text-slate-600">Loan Amount</Text>
              <Text className="text-sm font-bold text-emerald-600">{fmt(amount)}</Text>
            </View>
            <TextInput
              value={String(amount)}
              onChangeText={(v) => setAmount(Number(v.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="numeric"
              className="border border-slate-200 rounded-xl px-3 py-2 text-base font-bold text-slate-800 bg-slate-50"
            />
            <Text className="text-[11px] text-slate-400 mt-1.5">₹10,000 — ₹5,00,000</Text>
          </Card>
        </View>

        {/* Tenure */}
        <View>
          <Card className="p-4">
            <View className="flex-row justify-between items-center mb-2.5">
              <Text className="text-xs font-medium text-slate-600">Repayment Tenure</Text>
              <Text className="text-sm font-bold text-emerald-600">{months} months</Text>
            </View>
            <View className="flex-row gap-2">
              {[6, 12, 24, 36, 48, 60].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMonths(m)}
                  className={`flex-1 py-2 rounded-xl items-center ${months === m ? 'bg-emerald-500' : 'bg-slate-100'}`}
                >
                  <Text className={`text-xs font-semibold ${months === m ? 'text-white' : 'text-slate-600'}`}>{m}m</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Interest Rate */}
        <View>
          <Card className="p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-medium text-slate-600">Interest Rate (%)</Text>
              <Text className="text-sm font-bold text-emerald-600">{interestRate}%</Text>
            </View>
            <TextInput
              value={String(interestRate)}
              onChangeText={(v) => setInterestRate(Number(v.replace(/[^0-9.]/g, '')) || 0)}
              keyboardType="numeric"
              className="border border-slate-200 rounded-xl px-3 py-2 text-base font-bold text-slate-800 bg-slate-50"
            />
          </Card>
        </View>

        {/* Monthly Income */}
        <View>
          <Card className="p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-medium text-slate-600">Monthly Income</Text>
              <Text className="text-sm font-bold text-emerald-600">{fmt(monthlyIncome)}</Text>
            </View>
            <TextInput
              value={String(monthlyIncome)}
              onChangeText={(v) => setMonthlyIncome(Number(v.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="numeric"
              className="border border-slate-200 rounded-xl px-3 py-2 text-base font-bold text-slate-800 bg-slate-50"
            />
          </Card>
        </View>

        {/* EMI preview */}
        <View>
          <View className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
            <Text className="text-xs text-emerald-700">Estimated Monthly EMI</Text>
            <Text className="text-3xl font-black text-emerald-700 my-0.5">{fmt(localEMI)}</Text>
            <Text className="text-[11px] text-emerald-500">at {interestRate}% annual interest rate</Text>
          </View>
        </View>

        {/* Analyze */}
        <TouchableOpacity activeOpacity={0.85} onPress={analyze} disabled={loading}>
          <LinearGradient
            colors={loading ? [C.slate300, C.slate400] : [C.emerald500, C.teal600]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: 18, paddingVertical: 15, alignItems: 'center', shadowColor: C.emerald500, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}
          >
            <Text className="text-white text-base font-bold">
              {loading ? '⏳ Analyzing...' : '🧠 Analyze Risk'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Result */}
        {analyzed && (
          <View className="gap-3">
            <View className={`rounded-2xl p-4 border-2 flex-row items-start gap-3 ${r.bg} ${r.border}`}>
              <r.Icon size={22} color={r.iconColor} />
              <View className="flex-1">
                <Text className={`text-sm font-bold ${r.text}`}>{r.title}</Text>
                <Text className={`text-xs mt-1 ${r.text} opacity-80`}>
                  {analysisResult?.recommendation || r.msg}
                </Text>
              </View>
            </View>

            <Card className="p-4">
              <Text className="text-xs text-slate-500 mb-2.5">Risk Meter</Text>
              <RiskGauge risk={loanRisk} />
            </Card>

            <View className="flex-row gap-2">
              <Card className="flex-1 p-3">
                <Text className="text-[10px] text-slate-500">Monthly EMI</Text>
                <Text className="text-base font-bold text-slate-800 mt-0.5">
                  {fmt(analysisResult?.emi ?? localEMI)}
                </Text>
              </Card>
              <Card className="flex-1 p-3">
                <Text className="text-[10px] text-slate-500">Total Repayment</Text>
                <Text className="text-base font-bold text-emerald-600 mt-0.5">
                  {fmt(analysisResult?.totalRepayment ?? localEMI * months)}
                </Text>
              </Card>
            </View>

            {analysisResult && (
              <View className="flex-row gap-2">
                <Card className="flex-1 p-3">
                  <Text className="text-[10px] text-slate-500">Debt-to-Income</Text>
                  <Text className="text-base font-bold text-slate-800 mt-0.5">
                    {analysisResult.debtToIncomeRatio}
                  </Text>
                </Card>
                <Card className="flex-1 p-3">
                  <Text className="text-[10px] text-slate-500">Risk Level</Text>
                  <Text className="text-base font-bold text-slate-800 mt-0.5">
                    {analysisResult.riskLevel}
                  </Text>
                </Card>
              </View>
            )}

            <Card className="p-4">
              <Text className="text-sm font-bold text-slate-800 mb-2.5">💡 Tips to improve eligibility</Text>
              {[
                'Reduce existing monthly expenses by 10%',
                'Show consistent milk/crop income for 3 months',
                'Upload RTC to verify land as collateral',
              ].map((tip) => (
                <View key={tip} className="flex-row gap-2 mb-1.5">
                  <Text className="text-emerald-500 text-sm">•</Text>
                  <Text className="text-xs text-slate-600 flex-1 leading-5">{tip}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}