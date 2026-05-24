import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Link,
  useRouter,
} from 'expo-router';

import { Feather } from '@expo/vector-icons';

import { useStore } from '../../store';

export default function SignupScreen() {

  const router = useRouter();

  // Zustand
  const setLoggedIn = useStore(
    (s) => s.setLoggedIn
  );

  const [name, setName] =
    useState('');

  const [contact, setContact] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  // ─────────────────────────────
  // Signup
  // ─────────────────────────────
  const handleSignup = () => {

    // Password mismatch
    if (
      password !== confirmPassword
    ) {
      return;
    }

    // TODO:
    // Backend signup API

    // Save login state
    setLoggedIn(true);

    // Redirect home
    router.replace('/(tabs)/home');
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
              Create Account
            </Text>

            <Text className="text-base text-slate-500">
              Join ArthSaathi to start your journey
            </Text>

          </View>

          {/* Inputs */}
          <View className="gap-4">

            {/* Full Name */}
            <View>

              <Text className="text-sm font-medium text-slate-700 mb-1">
                Full Name
              </Text>

              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">

                <Feather
                  name="user"
                  size={18}
                  color="#64748b"
                />

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-3 text-base text-slate-800"
                />

              </View>

            </View>

            {/* Contact */}
            <View>

              <Text className="text-sm font-medium text-slate-700 mb-1">
                Phone Number or Email
              </Text>

              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">

                <Feather
                  name="mail"
                  size={18}
                  color="#64748b"
                />

                <TextInput
                  value={contact}
                  onChangeText={setContact}
                  placeholder="Enter phone or email"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <View>

              <Text className="text-sm font-medium text-slate-700 mb-1">
                Confirm Password
              </Text>

              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">

                <Feather
                  name="check-circle"
                  size={18}
                  color="#64748b"
                />

                <TextInput
                  value={confirmPassword}
                  onChangeText={
                    setConfirmPassword
                  }
                  placeholder="Confirm your password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-3 text-base text-slate-800"
                />

              </View>

            </View>

          </View>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
            activeOpacity={0.85}
            className="mt-8 bg-emerald-500 py-4 rounded-xl items-center"
          >

            <Text className="text-white font-semibold text-lg">
              Sign Up
            </Text>

          </TouchableOpacity>

          {/* Login */}
          <View className="flex-row justify-center mt-6 mb-10">

            <Text className="text-slate-500">
              Already have an account?
            </Text>

            <Link
              href="/(auth)/login"
              asChild
            >
              <TouchableOpacity>

                <Text className="text-emerald-600 font-semibold ml-1">
                  Login
                </Text>

              </TouchableOpacity>
            </Link>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}