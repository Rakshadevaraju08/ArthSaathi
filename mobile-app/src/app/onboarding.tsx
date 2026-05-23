import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants/translations';
import { C } from '../constants/colors';
import type { Lang } from '../types';

const LANGS: { code: Lang; native: string }[] = [
  { code: 'Hindi',   native: 'हिंदी'   },
  { code: 'English', native: 'English' },
  { code: 'Marathi', native: 'मराठी'  },
  { code: 'Tamil',   native: 'தமிழ்'   },
  { code: 'Telugu',  native: 'తెలుగు'  },
];

export default function Onboarding() {
  const router       = useRouter();
  const lang         = useStore((s) => s.language);
  const setLanguage  = useStore((s) => s.setLanguage);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const t            = TRANSLATIONS[lang];

  return (
    <LinearGradient colors={['#ecfdf5', '#f0fdfa', '#ffffff']} className="flex-1" style={{ flex: 1 }}>
      <SafeAreaView className="flex-1" style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 32, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View className="items-center mb-7">
            <LinearGradient
              colors={[C.emerald500, C.teal600]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{
                width: 80, height: 80, borderRadius: 24,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: C.emerald500, shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
              }}
            >
              <MaterialIcons name="auto-awesome" color={C.white} size={36} />
            </LinearGradient>
          </View>

          <View>
            <Text className="text-2xl font-bold text-slate-800 text-center">{t.welcome}</Text>
            <Text className="text-sm text-slate-500 text-center mt-1.5 leading-5">{t.tagline}</Text>
          </View>

          {/* Feature pills */}
          <View className="flex-row flex-wrap justify-center gap-2 mt-6">
            {['🎙️ Voice-first', '🌐 5 Languages', '🛡️ Scam Guard', '📊 Analytics'].map((f) => (
              <View key={f} className="bg-white px-3.5 py-1.5 rounded-full border border-emerald-100"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
                <Text className="text-sm text-slate-700 font-medium">{f}</Text>
              </View>
            ))}
          </View>

          {/* Language selector */}
          <View className="mt-8">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Choose your language</Text>
            <View className="flex-row flex-wrap gap-2">
              {LANGS.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  activeOpacity={0.75}
                  onPress={() => setLanguage(l.code)}
                  className={`px-4 py-2 rounded-full border-[1.5px] flex-row items-center gap-1.5 ${
                    lang === l.code
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {lang === l.code && (
                    <View className="w-4 h-4 rounded-full bg-white/30 items-center justify-center">
                      <Text className="text-[9px] text-white">✓</Text>
                    </View>
                  )}
                  <Text className={`text-sm font-semibold ${lang === l.code ? 'text-white' : 'text-slate-700'}`}>
                    {l.native}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-1 min-h-[40px]" />

          {/* CTA */}
          <View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => { setOnboarded(true); router.replace('/(auth)/signup'); }}
            >
              <LinearGradient
                colors={[C.emerald500, C.teal600]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 18, paddingVertical: 16, alignItems: 'center',
                  shadowColor: C.emerald500, shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
                }}
              >
                <Text className="text-white text-[17px] font-extrabold">{t.getStarted} →</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text className="text-center text-xs text-slate-400 mt-3">No account needed · Always free</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}