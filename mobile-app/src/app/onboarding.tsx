import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { C } from '../constants/colors';
import { TRANSLATIONS } from '../constants/translations';
import { useStore } from '../store';
import type { Lang } from '../types';

const LANGS: { code: Lang; native: string }[] = [
  { code: 'English', native: 'English' },
  { code: 'Hindi', native: 'Hindi' },
  { code: 'Kannada', native: 'Kannada' },
  { code: 'Marathi', native: 'Marathi' },
  { code: 'Tamil', native: 'Tamil' },
  { code: 'Telugu', native: 'Telugu' },
];

export default function Onboarding() {
  const router = useRouter();
  const lang = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const t = TRANSLATIONS[lang];

  const go = (route: '/login' | '/signup') => {
    setOnboarded(true);
    router.replace(route);
  };

  return (
    <LinearGradient colors={['#ecfdf5', '#f0fdfa', '#ffffff']} className="flex-1" style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 34, paddingBottom: 38 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-7">
            <LinearGradient
              colors={[C.emerald500, C.teal600]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 82,
                height: 82,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: C.emerald500,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <MaterialIcons name="auto-awesome" color={C.white} size={36} />
            </LinearGradient>
          </View>

          <Text className="text-2xl font-black text-slate-800 text-center">{t.welcome}</Text>
          <Text className="text-sm text-slate-500 text-center mt-2 leading-5">{t.tagline}</Text>

          <View className="mt-9">
            <Text className="text-xs font-black text-slate-500 uppercase mb-3">Choose your language</Text>
            <View className="flex-row flex-wrap">
              {LANGS.map((item) => {
                const active = lang === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    activeOpacity={0.75}
                    onPress={() => setLanguage(item.code)}
                    className={`px-4 py-2 rounded-full border mr-2 mb-2 ${active ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200'}`}
                  >
                    <Text className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-700'}`}>
                      {item.native}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="flex-1 min-h-[120px]" />

          <TouchableOpacity activeOpacity={0.85} onPress={() => go('/signup')}>
            <LinearGradient
              colors={[C.emerald500, C.teal600]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 18, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text className="text-white text-[17px] font-black">Create new account</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => go('/login')}
            className="bg-white border border-emerald-100 rounded-[18px] py-4 items-center mt-3"
          >
            <Text className="text-emerald-700 text-[16px] font-black">Login to existing account</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
