import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { endpoints } from '../../services/api';
import { C } from '../../constants/colors';

const INSIGHTS = [
  {
    title: 'Kisan Credit Card (KCC)',
    tag:   'Savings',
    desc:  'Ramesh, complete your KCC renewal online before May 30 to lock in the absolute lowest 4% interest rate incentive.',
  },
  {
    title: 'Urea Subsidy Guidelines',
    tag:   'Goal',
    desc:  'Your fertilizer costs are 12% lower than the Sindagi regional average. Check Government registered depots to maximize direct benefit balances.',
  },
  {
    title: 'Rainfall & Crop Saving',
    tag:   'Alert',
    desc:  'Meteorology warning indicates moderate rainfall for Bijapur area inside 48 hours. Consider postponing field fertilizer treatments.',
  },
  {
    title: 'Bacterial Sugarcane Blight',
    tag:   'Safety',
    desc:  'Reports from Sindhanoor farms alert for early shoot cane borers. Regularly check water drainage levels in sugarcane plots.',
  },
  {
    title: 'Cold Storage Economics',
    tag:   'Growth',
    desc:  'Local storage rates for onions in Vijayapura decreased by 5% this week. Storing crops for 30 more days could improve crop sale income by 15%.',
  },
  {
    title: 'Direct Income PM-Kisan',
    tag:   'Scheme',
    desc:  'The 17th installment of PM-Kisan has been initiated. Expect ₹2,000 credit notifications shortly. Check status via simple RTC uploads.',
  },
];

// Tag → Tailwind color classes
const TAG_CFG: Record<string, {
  border: string;
  pillBg: string;
  pillText: string;
}> = {
  Savings: { border: 'bg-emerald-500', pillBg: 'bg-emerald-50',  pillText: 'text-emerald-600' },
  Goal:    { border: 'bg-blue-500',    pillBg: 'bg-blue-50',     pillText: 'text-blue-600'    },
  Alert:   { border: 'bg-rose-500',    pillBg: 'bg-rose-50',     pillText: 'text-rose-600'    },
  Safety:  { border: 'bg-amber-500',   pillBg: 'bg-amber-50',    pillText: 'text-amber-600'   },
  Growth:  { border: 'bg-teal-600',    pillBg: 'bg-teal-50',     pillText: 'text-teal-700'    },
  Scheme:  { border: 'bg-slate-500',   pillBg: 'bg-slate-100',   pillText: 'text-slate-600'   },
};

export default function InsightsScreen() {
  const router = useRouter();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await endpoints.getDashboard();
        if (res.data?.data?.insights) {
          setInsights(res.data.data.insights);
        }
      } catch (error) {
        console.warn('Failed to fetch real insights from backend');
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>

      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-5 py-[18px] bg-white">
        <Text className="text-xl font-black text-slate-900">
          Smart Insights
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/screens/voice')}
          className="bg-emerald-50 rounded-xl px-3.5 py-2"
        >
          <Text className="text-xs font-bold text-emerald-600">
            💬 Ask AI
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Insight cards ── */}
        {loading ? (
          <ActivityIndicator size="large" color={C.emerald500} style={{ marginTop: 40 }} />
        ) : insights.length === 0 ? (
          <Text className="text-center text-slate-500 mt-10">No new insights available at the moment.</Text>
        ) : (
          insights.map((ins, idx) => {
          const cfg = TAG_CFG[ins.tag] ?? TAG_CFG.Scheme;
          return (
            <View
              key={idx}
              className="bg-white rounded-2xl mt-3 flex-row overflow-hidden"
              style={{
                shadowColor:  '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius:  6,
                elevation:     2,
              }}
            >
              {/* 6dp left colored border — Kotlin style */}
              <View className={`w-1.5 ${cfg.border}`} />

              <View className="flex-1 p-3.5">
                {/* Title + tag row */}
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    className="text-sm font-black text-slate-800 flex-1"
                    numberOfLines={1}
                  >
                    {ins.title}
                  </Text>

                  {/* Tag pill */}
                  <View className={`ml-2 rounded-md px-2 py-0.5 ${cfg.pillBg}`}>
                    <Text className={`text-[11px] font-bold ${cfg.pillText}`}>
                      {ins.tag}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text className="text-xs text-slate-600 leading-4">
                  {ins.desc}
                </Text>
              </View>
            </View>
          );
          })
        )}

        {/* ── Bottom CTA — solid emerald card ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/screens/voice')}
          className="mt-[18px] mb-[18px]"
        >
          <View className="bg-emerald-600 rounded-2xl p-5 items-center">
            <Text className="text-white font-black text-base mb-1">
              Want deeper financial analysis?
            </Text>
            <Text className="text-emerald-50 text-xs text-center leading-[18px]">
              Use ArthSaathi Voice Assistant immediately by clicking below.
            </Text>

            {/* White inner button */}
            <View
              className="mt-3 bg-white rounded-xl px-5 py-2 self-center"
              style={{ minWidth: 200 }}
            >
              <Text className="text-emerald-600 font-bold text-sm text-center">
                💡 Start Voice Assistant
              </Text>
            </View>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}