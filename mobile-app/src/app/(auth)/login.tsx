import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import { C } from '../../constants/colors';
import { useStore, type Occupation } from '../../store';
import { endpoints } from '../../services/api';
import { setToken } from '../../services/auth';

// Map backend occupation enum values to frontend enum values
const occupationMap: Record<string, Occupation> = {
  farmer: 'FARMER',
  shop_owner: 'SHOP_OWNER',
  tailor: 'TAILOR',
  daily_wage_worker: 'DAILY_WAGE',
};

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

      // Step 1: Login and get token + basic user
      const response = await endpoints.login(mobileNumber.trim(), password);
      const payload = response.data?.data;

      if (!payload?.token || !payload?.user) {
        throw new Error('Invalid login response from server.');
      }

      // Step 2: Save token to secure storage
      await setToken(payload.token);

      // Step 3: Set token in store first so subsequent API calls are authenticated
      useStore.setState({ token: payload.token });

      // Step 4: Fetch full profile to get occupation and financial data
      let occupation: Occupation = 'FARMER';
      let monthlyIncome = '';
      let monthlyExpenses = '';
      let businessDetails = {};

      try {
        const profileRes = await endpoints.getProfile();
        const profile = profileRes.data?.data;

        if (profile) {
          if (profile.occupation) {
            occupation = occupationMap[profile.occupation] ?? 'FARMER';
          }
          if (profile.monthlyIncome) monthlyIncome = String(profile.monthlyIncome);
          if (profile.monthlyExpenses) monthlyExpenses = String(profile.monthlyExpenses);

          // Pick the occupation-specific sub-profile
          const subProfile =
            profile.farmerProfile ??
            profile.shopProfile ??
            profile.tailorProfile ??
            profile.genericProfile ??
            {};
          businessDetails = subProfile;
        }
      } catch {
        // Profile fetch failed — not a blocking error, continue with defaults
        console.warn('[Login] Profile fetch failed, using defaults');
      }

      // Step 5: Sync everything to Zustand store
      useStore.setState({
        fullName: payload.user.name ?? '',
        mobileNumber: payload.user.phone ?? '',
        password,
        preferredLanguage: useStore.getState().language,
        occupation,
        monthlyIncome,
        monthlyExpenses,
        isRegistered: true,
        isLoggedIn: true,
        onboarded: true,
        token: payload.token,
        user: payload.user,
        businessDetails,
      });

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