import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Link,
  useRouter,
} from 'expo-router';

import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { useStore } from '../../store';
import { endpoints } from '../../services/api';
import { setToken as saveAuthToken } from '../../services/auth';

export default function LoginScreen() {

  const router = useRouter();


  const [phone, setPhone] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // ─────────────────────────────
  // Login
  // ─────────────────────────────
  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Enter phone number and password');
      return;
    }

    setLoading(true);

    let village = '';
    let district = '';

    // Safely get user's location coordinates
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // getLastKnownPosition is instant; fallback to balanced accuracy if null
        let location = await Location.getLastKnownPositionAsync({});
        if (!location) {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        }
        if (location) {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (geocode.length > 0) {
            const addr = geocode[0];
            village = addr.city || addr.district || addr.subregion || addr.name || '';
            district = addr.region || addr.country || '';
            console.log('📍 GPS Found:', village, district);
          }
        }
      } else {
        console.warn('GPS Permission Denied by User');
      }
    } catch (locErr) {
      console.warn('Failed to get location', locErr);
    }

    // Fallback so you can see it working even if your phone's GPS is off!
    if (!village) village = 'Bengaluru (Test GPS Off)';
    if (!district) district = 'Karnataka';

    try {
      const res = await endpoints.login(phone.trim(), password, village, district);
      const { user, token } = res.data.data;

      // Persist token
      await saveAuthToken(token);
      useStore.setState({ token, user, loggedIn: true });

      // Redirect home
      router.replace('/(tabs)/home');
    } catch (err: any) {
      console.error('Login Error:', err?.response?.data || err.message);

      let msg = 'Login failed. Please check your credentials.';
      
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        msg = err.response.data.errors.map((e: any) => e.message || e.msg).join('\n');
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message === 'Network Error') {
        msg = 'Network connection failed. Are you using localhost on a physical device? Check api.ts!';
      }

      Alert.alert('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? 0
            : 20
        }
        className="flex-1"
      >

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Header */}
          <View className="mb-8">

            <Text className="text-3xl font-bold text-slate-800 mb-2">
              Welcome Back
            </Text>

            <Text className="text-base text-slate-500">
              Sign in to continue to ArthSaathi
            </Text>

          </View>

          {/* Inputs */}
          <View className="gap-4">

            {/* Phone */}
            <View>

              <Text className="text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </Text>

              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">

                <Feather
                  name="phone"
                  size={18}
                  color="#64748b"
                />

                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  className="flex-1 ml-3 text-base text-slate-800"
                />

              </View>

            </View>

            {/* Password */}
            <View>

              <Text className="text-sm font-medium text-slate-700 mb-1">
                Password
              </Text>

              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">

                <Feather
                  name="lock"
                  size={18}
                  color="#64748b"
                />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-3 text-base text-slate-800"
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >

                  <Feather
                    name={
                      showPassword
                        ? 'eye-off'
                        : 'eye'
                    }
                    size={18}
                    color="#64748b"
                  />

                </TouchableOpacity>

              </View>

            </View>

          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
            className="mt-8 bg-emerald-500 py-4 rounded-xl items-center"
            style={loading ? { opacity: 0.7 } : undefined}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                Login
              </Text>
            )}
          </TouchableOpacity>

          {/* Signup */}
          <View className="flex-row justify-center mt-6 mb-10">

            <Text className="text-slate-500">
              Don't have an account?
            </Text>

            <Link
              href="/(auth)/signup"
              asChild
            >
              <TouchableOpacity>

                <Text className="text-emerald-600 font-semibold ml-1">
                  Sign Up
                </Text>

              </TouchableOpacity>
            </Link>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}