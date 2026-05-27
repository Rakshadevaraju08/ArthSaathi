import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';

import { C } from '../../constants/colors';
import { useStore } from '../../store';
import { endpoints } from '../../services/api';
import type { ScamResult } from '../../types';

const WARNING_EXAMPLES = [
  'Congratulations! You won Rs 5 lakh. Share your Aadhaar and OTP to claim.',
  'Your KCC loan is approved. Pay Rs 500 processing fee now on this link.',
  'PM Kisan extra amount released. Enter bank details to receive Rs 8000.',
  'Your electricity will be cut in 2 hours. Pay Rs 1800 on this number.',
];

export default function ScamScreen() {
  const router = useRouter();
  const language = useStore((s) => s.language);
  const setScamResult = useStore((s) => s.setScamResult);
  const storedResult = useStore((s) => s.scamResult);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamResult>(storedResult);

  const langCode = ({
    English: 'en', Hindi: 'hi', Kannada: 'kn', Marathi: 'mr', Tamil: 'ta', Telugu: 'te',
  } as const)[language] ?? 'en';

  const analyze = async () => {
    if (!message.trim()) {
      Alert.alert('Enter a message', 'Paste the suspicious message or text you received.');
      return;
    }
    try {
      setLoading(true);
      const res = await endpoints.scamDetection(message.trim());
      const data = res.data?.data?.result;

      if (!data) throw new Error('No result from server.');

      const scamResult: ScamResult = {
        isScam: data.isScam,
        confidence: data.confidence,
        reason: data.reason,
        warningLevel: data.warningLevel,
      };

      setResult(scamResult);
      setScamResult(scamResult);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 503) {
        // AI service offline — run basic local heuristic
        const lowerMsg = message.toLowerCase();
        const scamKeywords = ['otp', 'aadhaar', 'pan', 'bank account', 'upi pin', 'processing fee', 'won', 'prize', 'click here', 'limited offer', 'verify now'];
        const matches = scamKeywords.filter((kw) => lowerMsg.includes(kw));
        const isScam = matches.length >= 2;
        const localResult: ScamResult = {
          isScam,
          confidence: isScam ? 0.75 : 0.4,
          reason: isScam
            ? `Message contains suspicious keywords: ${matches.slice(0, 3).join(', ')}.`
            : 'No obvious scam keywords detected (local check only).',
          warningLevel: isScam ? 'HIGH' : 'LOW',
        };
        setResult(localResult);
        setScamResult(localResult);
      } else {
        const msg = isAxiosError(error)
          ? error.response?.data?.message || 'Scam check failed. Please try again.'
          : 'Scam check failed. Please try again.';
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const riskColor = result?.warningLevel === 'HIGH'
    ? C.rose600
    : result?.warningLevel === 'MEDIUM'
      ? C.amber600
      : C.emerald600;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[C.rose600, '#dc2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-black">Fraud Warning Check</Text>
          <Text className="text-rose-100 text-sm mt-2">Paste any suspicious message — SMS, WhatsApp, or call script — and check if it is a scam.</Text>
        </LinearGradient>

        <View className="px-5 mt-5">
          {/* Input */}
          <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
            <Text className="text-slate-800 font-black mb-3">Paste suspicious message</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Example: You won Rs 5 lakh. Click here to claim..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3"
              style={{ minHeight: 110 }}
            />
            <TouchableOpacity onPress={analyze} disabled={loading}>
              <LinearGradient
                colors={loading ? ['#fca5a5', '#fca5a5'] : [C.rose600, '#dc2626']}
                style={{ borderRadius: 14, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <MaterialIcons name="security" size={18} color="#fff" />
                )}
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 6 }}>
                  {loading ? 'Checking...' : 'Check for Scam'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Result */}
          {result && (
            <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text className="text-slate-800 font-black text-base">Result</Text>
                <View style={{ backgroundColor: `${riskColor}1A`, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Text style={{ color: riskColor, fontWeight: '900', fontSize: 12 }}>
                    {result.warningLevel} RISK
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: result.isScam ? '#fee2e2' : '#dcfce7', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: result.isScam ? C.rose600 : C.emerald600, marginBottom: 4 }}>
                  {result.isScam ? '🚨 SCAM DETECTED' : '✅ Looks Safe'}
                </Text>
                <Text style={{ fontSize: 13, color: result.isScam ? '#991b1b' : '#166534', lineHeight: 18 }}>
                  {result.reason}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginRight: 10 }}>
                  <View style={{ height: '100%', width: `${Math.round(result.confidence * 100)}%`, backgroundColor: riskColor }} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b' }}>
                  {Math.round(result.confidence * 100)}% confidence
                </Text>
              </View>

              {result.isScam && (
                <View style={{ marginTop: 12, backgroundColor: '#fff7ed', borderRadius: 10, padding: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#92400e', marginBottom: 4 }}>
                    ⚠️ What to do:
                  </Text>
                  <Text style={{ fontSize: 12, color: '#78350f', lineHeight: 18 }}>
                    Do not share OTP, Aadhaar, bank details or click any links. Block the number and report to Cybercrime at 1930.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Example messages */}
          <View className="bg-white rounded-2xl border border-slate-100 p-4">
            <Text className="text-slate-800 font-black mb-3">Try an example</Text>
            {WARNING_EXAMPLES.map((ex, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setMessage(ex)}
                style={{ backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' }}
              >
                <Text style={{ fontSize: 12, color: '#475569', lineHeight: 17 }} numberOfLines={2}>{ex}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}