import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { InsightCard } from '../../components/ui/InsightCard';
import { C } from '../../constants/colors';

const INSIGHTS = [
  { emoji: '📉', title: 'Save on Fertilizer',  desc: 'Reduce fertilizer spend by 10% → save ₹300/month. Bulk buying cooperative in your area.' },
  { emoji: '💰', title: 'Boost Savings Rate',   desc: 'Your savings rate is 23% — target 30% for better loan eligibility and emergency buffer.' },
  { emoji: '🥛', title: 'Dairy Expansion',      desc: 'Milk income is consistent — consider a dairy expansion loan at 8.5% PM-KISAN rate.' },
  { emoji: '🛡️', title: 'Digital Safety',       desc: '3 months without scam incidents — great record! Keep verifying all unknown callers.' },
  { emoji: '🌾', title: 'Govt Scheme Match',    desc: 'You qualify for PM-KISAN ₹2,000 next installment on Oct 15. Verify on pmkisan.gov.in.' },
];

export default function InsightsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']} style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View className="flex-row items-center justify-between px-4 py-3.5 bg-white border-b border-slate-100">
        <View>
          <Text className="text-base font-bold text-slate-800">Smart Insights</Text>
          <Text className="text-xs text-slate-500">Personalized by AI</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/screens/voice')}>
          <LinearGradient
            colors={[C.emerald500, C.teal600]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99 }}
          >
            <Feather name="mic" size={14} color={C.white} />
            <Text className="text-white text-xs font-semibold">Ask AI</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 120 }} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {INSIGHTS.map((ins, i) => (
          <View key={ins.title}>
            <InsightCard emoji={ins.emoji} title={ins.title} desc={ins.desc} />
          </View>
        ))}

        {/* AI prompt CTA */}
        <View>
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/screens/voice')}>
            <LinearGradient
              colors={[C.emerald600, C.teal600]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20, marginTop: 4 }}
            >
              <Text className="text-white text-base font-bold">Want deeper analysis?</Text>
              <Text className="text-white/80 text-xs mt-1.5 leading-5">
                Speak to ArthSaathi in Hindi or Kannada for personalized financial guidance
              </Text>
              <View className="mt-3 self-start bg-white/20 rounded-xl px-3 py-2 border border-white/30">
                <Text className="text-white text-sm font-semibold">Start Voice Session →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}