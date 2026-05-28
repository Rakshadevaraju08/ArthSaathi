import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';

import { RiskGauge } from '../../components/ui/RiskGauge';
import { C } from '../../constants/colors';
import { useStore } from '../../store';
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
  const [expectedInterest, setExpectedInterest] = useState(12);
  const [purpose, setPurpose] = useState('Working capital');
  const [result, setResult] = useState<null | { emi: number; total: number; risk: LoanRisk; eligible: number }>(null);

  const eligible = useMemo(() => {
    const savings = Math.max(0, monthlyIncome - monthlyExpenses);
    const habitMultiplier = pastRepaymentHabit === 'Never Missed' ? 8 : pastRepaymentHabit === 'Sometimes Delayed' ? 5 : 3;
    return Math.max(10000, Math.round((savings * habitMultiplier) / 1000) * 1000);
  }, [monthlyIncome, monthlyExpenses, pastRepaymentHabit]);

  const analyze = () => {
    const principal = Number(amount);
    const tenure = Number(months);
    if (!principal || !tenure) {
      Alert.alert('Check loan details', 'Enter loan amount and tenure.');
      return;
    }
    const monthlyRate = (expectedInterest / 100) / 12;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
    const burden = monthlyIncome ? emi / monthlyIncome : 1;
    const risk: LoanRisk = burden > 0.45 || pastRepaymentHabit === 'Frequently Missed'
      ? 'high'
      : burden > 0.28 || hasActiveLoans
        ? 'moderate'
        : 'safe';

    // Compute ArthScore (0-1000): savings rate + repayment habit + burden
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
    const habitBonus = pastRepaymentHabit === 'Never Missed' ? 200 : pastRepaymentHabit === 'Sometimes Delayed' ? 80 : 0;
    const burdenPenalty = Math.round(burden * 300);
    const rawScore = Math.round(400 + savingsRate * 250 + habitBonus - burdenPenalty);
    const arthScore = Math.max(300, Math.min(950, rawScore));

    setLoanRisk(risk);
    setResult({ emi: Math.round(emi), total: Math.round(emi * tenure), risk, eligible });

    // Navigate to ArthScore result screen
    router.push({
      pathname: '/screens/loan-result',
      params: {
        score: String(arthScore),
        emi: String(Math.round(emi)),
        total: String(Math.round(emi * tenure)),
        eligible: String(eligible),
        tenure: String(tenure),
        interest: String(expectedInterest),
        income: String(monthlyIncome),
        risk,
        purpose,
      },
    });
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
          <Text className="text-white text-2xl font-black">Loan Risk Check</Text>
          <Text className="text-emerald-50 text-sm mt-2">Local estimate using your onboarding income, expense and repayment habit.</Text>
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
            
            {/* The Interest Rate Dragger UI */}
            <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#64748b', fontWeight: '600' }}>
                  Expected Interest Rate
                </Text>
                <Text style={{ fontSize: 16, color: '#0f172a', fontWeight: '900' }}>
                  {expectedInterest}%
                </Text>
              </View>

              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={36}
                step={0.5}
                value={expectedInterest}
                onValueChange={(val) => setExpectedInterest(val)}
                minimumTrackTintColor="#10b981"
                maximumTrackTintColor="#cbd5e1"
                thumbTintColor="#059669"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>1%</Text>
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>36%</Text>
              </View>
            </View>

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
                  className={`px-3 py-2 rounded-full border mr-2 mb-2 ${
                    purpose === item ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className={`text-xs font-black ${purpose === item ? 'text-white' : 'text-slate-600'}`}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={analyze}>
              <LinearGradient colors={[C.emerald500, C.teal600]} style={{ borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
                <Text className="text-white font-black">Analyze Loan</Text>
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
              <Text className="text-slate-900 font-black mb-3">Analysis result</Text>
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
              <View className="flex-row items-start">
                <Feather name="info" size={17} color={C.slate500} />
                <Text className="text-slate-600 text-sm ml-2 flex-1">
                  Purpose: {purpose}. Keep EMI below one-third of monthly income for a safer local score.
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
