import React, { useState } from 'react';
import {
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BellRing, ChevronRight, Fingerprint, Shield, Type } from 'lucide-react-native';

import { C } from '../../constants/colors';
import { useStore } from '../../store';
import type { Lang } from '../../types';

const LANGS: { code: Lang; native: string }[] = [
  { code: 'English', native: 'English' },
  { code: 'Hindi', native: 'Hindi' },
  { code: 'Kannada', native: 'Kannada' },
  { code: 'Marathi', native: 'Marathi' },
  { code: 'Tamil', native: 'Tamil' },
  { code: 'Telugu', native: 'Telugu' },
];

const TOGGLES = [
  { key: 'notif', label: 'Enable Fraud Warnings', Icon: BellRing },
  { key: 'fraud', label: 'Notifications Alerts', Icon: Shield },
  { key: 'largeText', label: 'Large Accessibility Text', Icon: Type },
  { key: 'biometric', label: 'Biometric Passkey Access', Icon: Fingerprint },
] as const;

const MENU = ['Privacy Policy', 'Help & Support', 'About ArthSaathi'];

const roleLabel = {
  FARMER: 'Farmer',
  SHOP_OWNER: 'Grocery Shop',
  TAILOR: 'Tailor',
  DAILY_WAGE: 'Daily Wage Worker',
};

export default function ProfileScreen() {
  const router = useRouter();
  const fullName = useStore((s) => s.fullName);
  const mobileNumber = useStore((s) => s.mobileNumber);
  const occupation = useStore((s) => s.occupation);
  const language = useStore((s) => s.language);
  const monthlyIncome = useStore((s) => s.monthlyIncome);
  const monthlyExpenses = useStore((s) => s.monthlyExpenses);
  const businessDetails = useStore((s) => s.businessDetails);
  const setLanguage = useStore((s) => s.setLanguage);
  const resetGlobalDataState = useStore((s) => s.resetGlobalDataState);
  const [toggles, setToggles] = useState({ notif: true, fraud: true, largeText: false, biometric: true });

  const toggle = (key: keyof typeof toggles) => setToggles((current) => ({ ...current, [key]: !current[key] }));
  const initials = (fullName || 'User')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    resetGlobalDataState();
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[C.emerald600, C.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 20,
            padding: 18,
            paddingBottom: 20,
          }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-emerald-50 text-xs font-black uppercase">Account Profile</Text>
              <Text className="text-white text-2xl font-black mt-1" numberOfLines={1}>
                {fullName || 'ArthSaathi User'}
              </Text>
              <View className="self-start bg-white/20 border border-white/20 rounded-full px-3 py-1 mt-2">
                <Text className="text-white text-xs font-black">{roleLabel[occupation]}</Text>
              </View>
            </View>

            <View className="items-center">
              <View
                className="w-20 h-20 rounded-3xl bg-white items-center justify-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.16,
                  shadowRadius: 10,
                  elevation: 6,
                }}
              >
                <Text className="text-2xl font-black text-emerald-600">{initials}</Text>
              </View>
              <View className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-50 border-2 border-emerald-600 items-center justify-center">
                <Feather name="check" size={15} color={C.emerald600} />
              </View>
            </View>
          </View>

          <View className="flex-row mt-5">
            <View className="flex-1 bg-white/15 rounded-2xl px-3 py-3 mr-2">
              <Text className="text-emerald-50 text-[11px] font-bold">Mobile</Text>
              <Text className="text-white text-sm font-black mt-1" numberOfLines={1}>
                {mobileNumber || 'Not set'}
              </Text>
            </View>
            <View className="flex-1 bg-white/15 rounded-2xl px-3 py-3 ml-2">
              <Text className="text-emerald-50 text-[11px] font-bold">Language</Text>
              <Text className="text-white text-sm font-black mt-1">{language}</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-4 mt-4">
          <View className="flex-row mb-3">
            <View className="flex-1 bg-white rounded-2xl border border-slate-100 p-4 mr-2">
              <Text className="text-slate-500 text-xs font-bold">Monthly income</Text>
              <Text className="text-slate-900 text-lg font-black mt-1">
                Rs {Number(monthlyIncome || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl border border-slate-100 p-4 ml-2">
              <Text className="text-slate-500 text-xs font-bold">Monthly expenses</Text>
              <Text className="text-slate-900 text-lg font-black mt-1">
                Rs {Number(monthlyExpenses || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-3">
            <Text className="text-sm font-black text-slate-800 mb-3">Work profile</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-500 text-sm">Profession</Text>
              <Text className="text-slate-800 text-sm font-black">{roleLabel[occupation]}</Text>
            </View>
            {Object.entries(businessDetails).slice(0, 4).map(([key, value]) => (
              <View key={key} className="flex-row justify-between mb-2">
                <Text className="text-slate-500 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</Text>
                <Text className="text-slate-800 text-sm font-bold flex-1 text-right ml-3" numberOfLines={1}>
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </Text>
              </View>
            ))}
          </View>

          <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
            <Text className="text-sm font-black text-slate-800 mb-3">Select Language</Text>
            <View className="flex-row flex-wrap">
              {LANGS.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  onPress={() => setLanguage(item.code)}
                  className={`px-3 py-2 rounded-xl items-center border mr-2 mb-2 ${
                    language === item.code ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-slate-300'
                  }`}
                >
                  <Text className={`text-[11px] font-bold ${language === item.code ? 'text-white' : 'text-slate-700'}`}>
                    {item.native}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-3">
            <Text className="text-sm font-black text-slate-800 px-4 pt-4 pb-3">Preferences</Text>
            {TOGGLES.map((row, index) => (
              <View key={row.key} className={`flex-row items-center px-4 py-3 ${index < TOGGLES.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <row.Icon size={16} color={C.slate500} />
                <Text className="flex-1 text-sm text-slate-700 font-medium ml-3">{row.label}</Text>
                <Switch value={toggles[row.key]} onValueChange={() => toggle(row.key)} trackColor={{ false: C.slate200, true: C.emerald500 }} thumbColor={C.white} />
              </View>
            ))}
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-3">
            {MENU.map((item, index) => (
              <TouchableOpacity key={item} className={`flex-row items-center justify-between px-4 py-3.5 ${index < MENU.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <Text className="text-sm text-slate-700 font-medium">{item}</Text>
                <ChevronRight size={14} color={C.slate400} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleLogout} activeOpacity={0.85} className="bg-rose-50 border border-rose-100 rounded-2xl py-3.5 items-center justify-center">
            <Text className="text-sm font-bold text-rose-600">Sign Out</Text>
          </TouchableOpacity>

          <Text className="text-center text-[11px] text-slate-500 mt-3 mb-2">Version 1.0.4 - Local Prototype</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
