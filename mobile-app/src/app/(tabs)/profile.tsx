import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text,
  TouchableOpacity, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useStore } from '../../store';
import { endpoints } from '../../services/api';
import { C } from '../../constants/colors';
import type { Lang } from '../../types';

const LANGS: { code: Lang; native: string }[] = [
  { code: 'Hindi',   native: 'Hindi'   },
  { code: 'English', native: 'English' },
  { code: 'Marathi', native: 'Marathi' },
  { code: 'Tamil',   native: 'Tamil'   },
  { code: 'Telugu',  native: 'Telugu'  },
];

const TOGGLES = [
  { key: 'notif',     label: 'Enable Fraud Warnings',    Icon: (p: any) => <Feather      name="bell"        {...p} /> },
  { key: 'fraud',     label: 'Notifications Alerts',     Icon: (p: any) => <Feather      name="shield"      {...p} /> },
  { key: 'largeText', label: 'Large Accessibility Text', Icon: (p: any) => <Feather      name="type"        {...p} /> },
  { key: 'biometric', label: 'Biometric Passkey Access', Icon: (p: any) => <MaterialIcons name="fingerprint" {...p} /> },
] as const;

const MENU = [
  'Privacy Policy',
  'Help & Support',
  'About ArthSaathi',
];

export default function ProfileScreen() {
  const router      = useRouter();
  const language    = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const user        = useStore((s: any) => s.user);

  const [toggles, setToggles] = useState({
    notif: true, fraud: true, largeText: false, biometric: true,
  });

  const toggle = (k: keyof typeof toggles) =>
    setToggles((p) => ({ ...p, [k]: !p[k] }));

  // Fetch latest profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await endpoints.getProfile();
        const fetchedUser = res.data.data;
        useStore.setState({ user: fetchedUser });
        if (fetchedUser.language) {
          setLanguage(fetchedUser.language as Lang);
        }
      } catch (error) {
        console.warn('Failed to fetch latest profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleLanguageChange = async (code: Lang) => {
    setLanguage(code); // Update UI instantly
    try {
      await endpoints.updateProfile({ language: code });
      useStore.setState((s: any) => ({ user: { ...s.user, language: code } }));
    } catch (error) {
      console.warn('Failed to save language to backend', error);
    }
  };

  const handleLogout = async () => {
    useStore.setState({ loggedIn: false, token: null, user: null });
    router.replace('/(auth)/login');
  };

  const getInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'U';
  const locationStr = [user?.village, user?.district].filter(Boolean).join(', ') || 'Location not set';
  const displayName = user?.name || 'ArthSaathi User';

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Profile header card — Kotlin emerald gradient card ── */}
        <LinearGradient
          colors={[C.emerald600, C.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-4 mt-4 rounded-[18px] p-5"
        >
          <View className="flex-row items-center gap-4">

            {/* Avatar — white circle with emerald initials */}
            <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
              <Text className="text-xl font-black text-emerald-600">
                {getInitials(displayName)}
              </Text>
            </View>

            {/* Name + location */}
            <View className="flex-1">
              <Text className="text-lg font-black text-white">
                {displayName}
              </Text>
              <Text className="text-xs text-emerald-50 mt-0.5">
                📍 {locationStr}
              </Text>
            </View>

          </View>
        </LinearGradient>

        <View className="px-4 mt-4 gap-3">

          {/* ── Language selector ── */}
          <View className="bg-white rounded-2xl p-4 border border-slate-100">

            <Text className="text-sm font-black text-slate-800 mb-3">
              Select Language 
            </Text>

            <View className="flex-row gap-1.5">
              {LANGS.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  onPress={() => handleLanguageChange(l.code)}
                  className={`flex-1 py-2 rounded-xl items-center border ${
                    language === l.code
                      ? 'bg-emerald-500 border-emerald-600'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <Text className={`text-[11px] font-bold ${
                    language === l.code
                      ? 'text-white'
                      : 'text-slate-700'
                  }`}>
                    {l.native}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

          </View>

          {/* ── Preferences toggles ── */}
          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

            <Text className="text-sm font-black text-slate-800 px-4 pt-4 pb-3">
              Preferences 
            </Text>

            {TOGGLES.map((row, i) => (
              <View
                key={row.key}
                className={`flex-row items-center gap-3 px-4 py-3.5 ${
                  i < TOGGLES.length - 1
                    ? 'border-b border-slate-100'
                    : ''
                }`}
              >
                <row.Icon size={16} color={C.slate500} />

                <Text className="flex-1 text-sm font-medium text-slate-700">
                  {row.label}
                </Text>

                <Switch
                  value={toggles[row.key]}
                  onValueChange={() => toggle(row.key)}
                  trackColor={{ false: C.slate200, true: C.emerald500 }}
                  thumbColor={C.white}
                />
              </View>
            ))}

          </View>

          {/* ── More menu ── */}
          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

            {MENU.map((item, i) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.7}
                className={`flex-row items-center justify-between px-4 py-4 ${
                  i < MENU.length - 1
                    ? 'border-b border-slate-100'
                    : ''
                }`}
              >
                <Text className="text-sm font-medium text-slate-700">
                  {item}
                </Text>
                <Feather name="chevron-right" size={14} color={C.slate400} />
              </TouchableOpacity>
            ))}

          </View>

          {/* ── Sign out button — Kotlin rose50 style ── */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            className="bg-rose-50 border border-rose-100 rounded-2xl py-4 items-center justify-center"
          >
            <Text className="text-sm font-bold text-rose-600">
              Sign Out
            </Text>
          </TouchableOpacity>

          {/* ── Version footer ── */}
          <Text className="text-center text-[11px] text-slate-500 mt-1 mb-2">
            Version 1.0.4 · Made for Indian Farmers
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}