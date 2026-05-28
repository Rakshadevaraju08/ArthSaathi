import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import { C } from '../../constants/colors';
import { useStore } from '../../store';
import { endpoints } from '../../services/api';
import { setToken } from '../../services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const login = async () => {
    if (mobileNumber.trim().length !== 10 || password.length < 6) {
      Alert.alert('Check login', 'Enter valid 10 digit mobile number and at least 6 character password.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await endpoints.login(mobileNumber.trim(), password);
      const payload = response.data?.data;

      if (!payload?.token || !payload?.user) {
        throw new Error('Invalid login response from server.');
      }

      await setToken(payload.token);

      // Fetch user profile details immediately
      let userOccupation = payload.user.occupation;

      try {
        const profileRes = await endpoints.getMyProfile();
        const profileData = profileRes.data?.data;
        if (profileData) {
          userOccupation = profileData.occupation || userOccupation;
          if (profileData.farmerProfile) userOccupation = 'farmer';
          else if (profileData.shopProfile) userOccupation = 'shop_owner';
          else if (profileData.tailorProfile) userOccupation = 'tailor';
          else if (profileData.genericProfile) userOccupation = 'daily_wage';
        }
      } catch (profileError) {
        console.warn('Failed to fetch profile details on login:', profileError);
      }

      // Map backend occupation string to frontend Occupation type
      const mapOccupation = (occ: string) => {
        switch (occ?.toLowerCase()) {
          case 'farmer':
            return 'FARMER';
          case 'shop_owner':
            return 'SHOP_OWNER';
          case 'tailor':
            return 'TAILOR';
          case 'daily_wage_worker':
          case 'daily_wage':
            return 'DAILY_WAGE';
          default:
            return 'FARMER';
        }
      };

      const mappedOccupation = mapOccupation(userOccupation || 'farmer');

      useStore.setState((state) => ({
        preferredLanguage: state.language,
        isRegistered: true,
        isLoggedIn: true,
        onboarded: true,
        token: payload.token,
        user: {
          ...payload.user,
          occupation: userOccupation,
        },
        occupation: mappedOccupation,
      }));

      // Redirect directly to the correct dashboard (business tab screen)
      router.replace('/(tabs)/home');
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message || 'Login failed. Please check phone/password.'
        : 'Login failed. Please try again.';
      Alert.alert('Login failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <LinearGradient
        colors={[C.emerald600, C.teal600]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: 32,
          paddingBottom: 28,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <Text className="text-white text-3xl font-black">Login</Text>
        <Text className="text-emerald-50 mt-2 text-sm">Continue with your mobile number and password.</Text>
      </LinearGradient>

      <View className="flex-1 justify-center px-5">
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

        <TouchableOpacity
          onPress={login}
          disabled={submitting}
          className={`rounded-2xl py-4 items-center ${submitting ? 'bg-emerald-400' : 'bg-emerald-600'}`}
        >
          <Text className="text-white text-base font-black">{submitting ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/signup')} className="py-4 items-center">
          <Text className="text-emerald-700 font-black">New user? Create account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
