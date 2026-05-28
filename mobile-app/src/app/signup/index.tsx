import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useStore, type Occupation } from '../../store';
import { C } from '../../constants/colors';
import { useTranslations } from '../../hooks/useTranslations';

export default function SignupScreen() {
  const router = useRouter();
  const setPrimaryRegistration = useStore((s) => s.setPrimaryRegistration);
  const t = useTranslations();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [occupation, setOccupation] = useState<Occupation>('FARMER');
  const preferredLanguage = useStore((s) => s.language);

  const occupations: { label: string; sub: string; value: Occupation; icon: keyof typeof Feather.glyphMap }[] = [
    { label: t.farmer ?? 'Farmer', sub: t.farmerSub ?? 'Mandi, crops, RTC and input costs', value: 'FARMER', icon: 'sun' },
    { label: t.shopOwner ?? 'Grocery Shop', sub: t.shopOwnerSub ?? 'Udhar, inventory and supplier credit', value: 'SHOP_OWNER', icon: 'shopping-bag' },
    { label: t.tailor ?? 'Tailor', sub: t.tailorSub ?? 'Orders, cloth yield and delivery dates', value: 'TAILOR', icon: 'scissors' },
    { label: t.dailyWage ?? 'Daily Wage', sub: t.dailyWageSub ?? 'Shift days, payments and work stability', value: 'DAILY_WAGE', icon: 'briefcase' },
  ];

  const submit = () => {
    if (!fullName.trim() || mobileNumber.trim().length !== 10 || password.length < 6) {
      Alert.alert('Check signup details', 'Enter name, 10 digit mobile number and at least 6 characters password.');
      return;
    }

    setPrimaryRegistration({
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      password,
      preferredLanguage,
      occupation,
    });

    const route =
      occupation === 'FARMER'
        ? '/signup/details-farmer'
        : occupation === 'SHOP_OWNER'
          ? '/signup/details-shop'
          : occupation === 'TAILOR'
            ? '/signup/details-tailor'
            : '/signup/details-generic';

    router.push(route);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[C.emerald600, C.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 22,
            paddingBottom: 26,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <Text className="text-white text-2xl font-black">{t.createAccountTitle}</Text>
          <Text className="text-emerald-50 text-sm mt-2 leading-5">{t.createAccountSubtitle}</Text>
        </LinearGradient>

        <View className="px-5 mt-5">
          <Text className="text-xs font-black text-slate-500 mb-2 uppercase">{t.signupDetails}</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder={t.fullName}
            placeholderTextColor="#94a3b8"
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3"
          />
          <TextInput
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder={t.mobileNumber}
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor="#94a3b8"
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t.password}
            secureTextEntry
            placeholderTextColor="#94a3b8"
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-5"
          />

          <Text className="text-xs font-black text-slate-500 mb-2 uppercase">{t.chooseProfession}</Text>
          {occupations.map((item) => {
            const active = occupation === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setOccupation(item.value)}
                activeOpacity={0.85}
                className={`mb-3 rounded-2xl border p-4 flex-row items-center ${
                  active ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-200'
                }`}
              >
                <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${active ? 'bg-emerald-600' : 'bg-slate-100'}`}>
                  <Feather name={item.icon} size={20} color={active ? '#fff' : C.slate600} />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-black text-base">{item.label}</Text>
                  <Text className="text-slate-500 text-xs mt-1">{item.sub}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity onPress={submit} className="bg-emerald-600 rounded-2xl py-4 items-center mt-2">
            <Text className="text-white text-base font-black">{t.register}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/login')} className="py-4 items-center">
            <Text className="text-emerald-700 font-black">{t.alreadyHaveAccount}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
