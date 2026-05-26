import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { C } from '../../constants/colors';
import { useStore } from '../../store';

export default function LoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    if (mobileNumber.trim().length < 10 || password.length < 4) {
      Alert.alert('Check login', 'Enter mobile number and password.');
      return;
    }

    useStore.setState((state) => ({
      fullName: state.fullName || 'Ramesh Patil',
      mobileNumber: mobileNumber.trim(),
      password,
      preferredLanguage: state.language,
      monthlyIncome: state.monthlyIncome || '28000',
      monthlyExpenses: state.monthlyExpenses || '16500',
      isRegistered: true,
      isLoggedIn: true,
      onboarded: true,
      user: {
        id: 'local-login',
        name: state.fullName || 'Ramesh Patil',
        phone: mobileNumber.trim(),
        language: state.language,
      },
    }));
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <LinearGradient colors={[C.emerald600, C.teal600]} className="px-5 pt-8 pb-8 rounded-b-[28px]">
        <Text className="text-white text-3xl font-black">Login</Text>
        <Text className="text-emerald-50 mt-2 text-sm">Continue with your mobile number and password.</Text>
      </LinearGradient>

      <View className="px-5 mt-6">
        <TextInput
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder="Mobile number"
          keyboardType="phone-pad"
          maxLength={10}
          placeholderTextColor="#94a3b8"
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#94a3b8"
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-5"
        />

        <TouchableOpacity onPress={login} className="bg-emerald-600 rounded-2xl py-4 items-center">
          <Text className="text-white text-base font-black">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/signup')} className="py-4 items-center">
          <Text className="text-emerald-700 font-black">New user? Create account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
