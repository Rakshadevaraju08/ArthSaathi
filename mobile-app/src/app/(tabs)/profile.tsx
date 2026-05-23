import React, { useState } from 'react';

import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';

import { useRouter } from 'expo-router';

import {
  BellRing,
  Shield,
  Type,
  Fingerprint,
  Languages,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';

import { Feather } from '@expo/vector-icons';

import { useStore } from '../../store';

import { C } from '../../constants/colors';

import type { Lang } from '../../types';

const LANGS: {
  code: Lang;
  native: string;
}[] = [
  {
    code: 'Hindi',
    native: 'Hindi',
  },

  {
    code: 'English',
    native: 'English',
  },

  {
    code: 'Marathi',
    native: 'Marathi',
  },

  {
    code: 'Tamil',
    native: 'Tamil',
  },

  {
    code: 'Telugu',
    native: 'Telugu',
  },
];

const TOGGLES = [
  {
    key: 'notif',
    label: 'Notifications',
    Icon: BellRing,
  },

  {
    key: 'fraud',
    label: 'Fraud Alerts',
    Icon: Shield,
  },

  {
    key: 'largeText',
    label: 'Large Text',
    Icon: Type,
  },

  {
    key: 'biometric',
    label: 'Biometric',
    Icon: Fingerprint,
  },
] as const;

const MENU = [
  'Privacy Policy',
  'Help & Support',
  'About ArthSaathi',
];

export default function ProfileScreen() {

  const router = useRouter();

  // Zustand
  const language = useStore(
    (s) => s.language
  );

  const setLanguage = useStore(
    (s) => s.setLanguage
  );

  const setLoggedIn = useStore(
    (s) => s.setLoggedIn
  );

  const setOnboarded = useStore(
    (s) => s.setOnboarded
  );

  // Local toggles
  const [toggles, setToggles] =
    useState({
      notif: true,
      fraud: true,
      largeText: false,
      biometric: true,
    });

  const toggle = (
    k: keyof typeof toggles
  ) => {

    setToggles((p) => ({
      ...p,
      [k]: !p[k],
    }));
  };

  // ─────────────────────────────
  // Logout
  // ─────────────────────────────
  const handleLogout = () => {

    // Remove login state
    setLoggedIn(false);

    // Reset onboarding flag so it shows up next time
    setOnboarded(false);

    // Redirect directly to onboarding
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <LinearGradient
          colors={[
            C.emerald600,
            C.teal600,
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          className="px-4 pt-4 pb-6 rounded-b-3xl"
        >

          <View className="flex-row items-center justify-between">

            {/* Left */}
            <View className="flex-row items-center gap-3">

              <View className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 items-center justify-center">

                <Text className="text-xl font-bold text-white">
                  RP
                </Text>

              </View>

              <View>

                <Text className="text-base font-bold text-white">
                  Ramesh Patil
                </Text>

                <Text className="text-xs text-white/80">
                  Sindagi, Karnataka
                </Text>

                <Text className="text-[10px] text-white/60 mt-0.5">
                  Member since Apr 2025
                </Text>

              </View>
            </View>

            {/* Right */}
            <View className="w-11 h-11 rounded-full bg-white/20 border border-white/30 items-center justify-center">

              <Feather
                name="user"
                size={22}
                color="white"
              />

            </View>

          </View>

        </LinearGradient>

        {/* Body */}
        <View className="px-4 mt-4 gap-3">

          {/* Language */}
          <View className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">

            <View className="flex-row items-center gap-2 mb-2">

              <Languages
                size={16}
                color={C.emerald600}
              />

              <Text className="text-sm font-semibold text-slate-800">
                App Language
              </Text>

            </View>

            <View className="flex-row flex-wrap gap-2">

              {LANGS.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  onPress={() =>
                    setLanguage(l.code)
                  }
                  className={`px-3 py-1 rounded-full ${
                    language === l.code
                      ? 'bg-emerald-500'
                      : 'bg-slate-100'
                  }`}
                >

                  <Text
                    className={`text-xs font-medium ${
                      language === l.code
                        ? 'text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    {l.native}
                  </Text>

                </TouchableOpacity>
              ))}

            </View>

          </View>

          {/* Toggles */}
          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">

            {TOGGLES.map((row, i) => (
              <View
                key={row.key}
                className={`flex-row items-center gap-3 p-4 ${
                  i <
                  TOGGLES.length - 1
                    ? 'border-b border-slate-100'
                    : ''
                }`}
              >

                <row.Icon
                  size={18}
                  color={C.slate500}
                />

                <Text className="flex-1 text-sm text-slate-700">
                  {row.label}
                </Text>

                <Switch
                  value={toggles[row.key]}
                  onValueChange={() =>
                    toggle(row.key)
                  }
                  trackColor={{
                    false: C.slate200,
                    true: C.emerald400,
                  }}
                  thumbColor={C.white}
                />

              </View>
            ))}

          </View>

          {/* Menu */}
          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">

            {MENU.map((item, i) => (
              <TouchableOpacity
                key={item}
                className={`flex-row items-center justify-between p-4 ${
                  i < MENU.length - 1
                    ? 'border-b border-slate-100'
                    : ''
                }`}
              >

                <Text className="text-sm text-slate-700">
                  {item}
                </Text>

                <ChevronRight
                  size={16}
                  color={C.slate300}
                />

              </TouchableOpacity>
            ))}

          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            className="bg-rose-50 border border-rose-100 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >

            <LogOut
              size={18}
              color={C.rose600}
            />

            <Text className="text-sm font-semibold text-rose-600">
              Log out
            </Text>

          </TouchableOpacity>

          {/* Footer */}
          <Text className="text-center text-[10px] text-slate-400 mt-2">
            ArthSaathi v1.2.0
          </Text>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}