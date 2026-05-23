import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Plus, Wallet, Shield, ScanLine } from 'lucide-react-native';
import { C } from '../../constants/colors';

const ACTIONS = [
  { label: 'Add',  Icon: Plus,     route: '/(tabs)/expenses', gradient: [C.emerald500, C.teal600]   },
  { label: 'Loan', Icon: Wallet,   route: '/screens/loan',    gradient: [C.blue500,    '#1d4ed8']    },
  { label: 'Scam', Icon: Shield,   route: '/screens/scam',    gradient: ['#8b5cf6',    '#7c3aed']    },
  { label: 'RTC',  Icon: ScanLine, route: '/screens/rtc',     gradient: [C.amber500,   C.amber600]   },
] as const;

export function QuickActions() {
  const router = useRouter();
  return (
    <View className="flex-row gap-2">
      {ACTIONS.map((a) => (
        <TouchableOpacity
          key={a.label}
          activeOpacity={0.8}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(a.route as any);
          }}
          className="flex-1 bg-white rounded-2xl p-2.5 items-center border border-slate-100"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
        >
          <LinearGradient
            colors={a.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-9 h-9 rounded-xl items-center justify-center mb-1"
          >
            <a.Icon size={16} color={C.white} />
          </LinearGradient>
          <Text className="text-[10px] font-medium text-slate-600">{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}