import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { useStore } from '../../store';
import { endpoints } from '../../services/api';
import { C } from '../../constants/colors';

const COMMON_SCAMS = [
  { emoji: '📞', t: 'Fake KYC update calls',  d: "Never share OTP for 'KYC verification'. Banks never call asking for OTP." },
  { emoji: '🎰', t: 'Lottery / prize SMS',     d: 'No bank gives money for codes or fees.' },
  { emoji: '🏦', t: 'Loan approval scams',     d: "Real lenders never ask upfront 'processing fees'." },
];

export default function ScamScreen() {
  const router        = useRouter();
  const scamResult    = useStore((s) => s.scamResult);
  const setScamResult = useStore((s) => s.setScamResult);
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setScamResult(null);
    try {
      const res = await endpoints.scamDetection(text.trim());
      const { result } = res.data.data;
      setScamResult({
        isScam: result.isScam,
        confidence: result.confidence,
        reason: result.reason,
        warningLevel: result.warningLevel,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Scam detection failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

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
        <View className="flex-row items-center gap-2">
          <Shield size={18} color={C.emerald600} />
          <View>
            <Text className="text-base font-bold text-slate-800">Scam Checker</Text>
            <Text className="text-xs text-slate-500">Paste a message or call summary</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Paste suspicious SMS or describe the call..."
            placeholderTextColor={C.slate400}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="bg-white border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-800 leading-5"
            style={{ minHeight: 120 }}
          />
        </Animated.View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={analyze}
          disabled={!text.trim() || loading}
        >
          <LinearGradient
            colors={!text.trim() || loading ? [C.slate300, C.slate400] : [C.emerald500, C.teal600]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: 18, paddingVertical: 15, alignItems: 'center', shadowColor: C.emerald500, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 }}
          >
            <Text className="text-white text-base font-bold">
              {loading ? '🔍 Analyzing...' : '🛡️ Analyze for Scam'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Shimmer while loading */}
        {loading && (
          <View className="h-16 rounded-2xl bg-slate-100" />
        )}

        {/* Result */}
        {scamResult && !loading && (
          <Animated.View entering={ZoomIn.springify()}>
            <View
              className={`rounded-2xl p-4 border-2 flex-row items-start gap-2.5 ${
                !scamResult.isScam ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}
            >
              {!scamResult.isScam
                ? <CheckCircle2 size={20} color={C.emerald600} className="flex-shrink-0 mt-0.5" />
                : <AlertTriangle size={20} color={C.rose600} className="flex-shrink-0 mt-0.5" />
              }
              <View className="flex-1">
                <Text className={`text-sm font-bold ${!scamResult.isScam ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {scamResult.isScam ? `⚠️ ${scamResult.warningLevel} SCAM RISK` : '✅ Looks Safe'}
                </Text>
                <Text className={`text-xs mt-1 leading-5 ${!scamResult.isScam ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {scamResult.reason}
                </Text>
                <Text className={`text-[10px] mt-1 ${!scamResult.isScam ? 'text-emerald-500' : 'text-rose-500'}`}>
                  Confidence: {Math.round(scamResult.confidence * 100)}%
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Common scams */}
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">⚠️ Common rural scams</Text>
        {COMMON_SCAMS.map((scam, i) => (
          <Animated.View key={scam.t} entering={FadeInDown.delay(300 + i * 60).springify()}>
            <View className="bg-white rounded-2xl p-3 border-l-4 border-rose-500 border border-slate-100"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
              <Text className="text-sm font-semibold text-slate-800">{scam.emoji} {scam.t}</Text>
              <Text className="text-xs text-slate-500 mt-0.5">{scam.d}</Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}