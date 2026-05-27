import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { C } from '../../constants/colors';
import type { OnboardingInputMode } from '../../store';

type Field = {
  label: string;
  value: string;
  placeholder: string;
  keyboardType?: 'default' | 'numeric';
  onChangeText: (value: string) => void;
};

type Choice = {
  label: string;
  active: boolean;
  onPress: () => void;
};

type Props = {
  title: string;
  subtitle: string;
  mode: OnboardingInputMode;
  onModeChange: (mode: OnboardingInputMode) => void;
  fields: Field[];
  choices?: { title: string; items: Choice[] }[];
  voiceSummary: string;
  onVoiceFill: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
};

export function QuestionScaffold({
  title,
  subtitle,
  mode,
  onModeChange,
  fields,
  choices = [],
  voiceSummary,
  onVoiceFill,
  onSubmit,
  submitLabel = 'Forward to dashboard',
  submitDisabled = false,
}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
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
          <Text className="text-white text-2xl font-black">{title}</Text>
          <Text className="text-emerald-50 text-sm mt-2 leading-5">{subtitle}</Text>
        </LinearGradient>

        <View className="px-5 mt-5">
          <Text className="text-xs font-black text-slate-500 mb-2 uppercase">Answer mode</Text>
          <View className="flex-row bg-white border border-slate-200 rounded-xl p-1 mb-5">
            {(['TEXT', 'VOICE'] as const).map((item) => {
              const active = mode === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => onModeChange(item)}
                  className={`flex-1 py-3 rounded-lg items-center ${active ? 'bg-emerald-600' : ''}`}
                >
                  <Text className={`font-black ${active ? 'text-white' : 'text-slate-600'}`}>
                    {item === 'TEXT' ? 'Normal input' : 'Voice input'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {mode === 'VOICE' ? (
            <View className="bg-white rounded-2xl border border-slate-100 p-5 mb-5 items-center">
              <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-3">
                <Feather name="mic" size={28} color={C.emerald600} />
              </View>
              <Text className="text-slate-900 font-black text-base">Voice question mode</Text>
              <Text className="text-slate-500 text-sm text-center mt-2 leading-5">{voiceSummary}</Text>
              <TouchableOpacity onPress={onVoiceFill} className="bg-emerald-600 rounded-xl px-5 py-3 mt-4">
                <Text className="text-white font-black">Simulate voice answers</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {fields.map((field) => (
            <View key={field.label} className="mb-3">
              <Text className="text-xs font-black text-slate-500 mb-2 uppercase">{field.label}</Text>
              <TextInput
                value={field.value}
                onChangeText={field.onChangeText}
                placeholder={field.placeholder}
                keyboardType={field.keyboardType ?? 'default'}
                placeholderTextColor="#94a3b8"
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
              />
            </View>
          ))}

          {choices.map((group) => (
            <View key={group.title} className="mb-4">
              <Text className="text-xs font-black text-slate-500 mb-2 uppercase">{group.title}</Text>
              <View className="flex-row flex-wrap">
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={item.onPress}
                    className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                      item.active ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text className={`font-bold ${item.active ? 'text-white' : 'text-slate-700'}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={onSubmit}
            disabled={submitDisabled}
            className={`rounded-2xl py-4 items-center mt-2 ${submitDisabled ? 'bg-emerald-400' : 'bg-emerald-600'}`}
          >
            <Text className="text-white text-base font-black">{submitLabel}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
