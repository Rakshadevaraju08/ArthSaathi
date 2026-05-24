import React from 'react';
import { View, Text } from 'react-native';

type Variant = 'safe' | 'moderate' | 'high' | 'alert' | 'tip' | 'info';

const CFG: Record<Variant, { bg: string; text: string; label: string }> = {
  safe:     { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'SAFE'      },
  moderate: { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'MODERATE'  },
  high:     { bg: 'bg-rose-50',    text: 'text-rose-600',    label: 'HIGH RISK' },
  alert:    { bg: 'bg-rose-50',    text: 'text-rose-600',    label: 'ALERT'     },
  tip:      { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'TIP'       },
  info:     { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'INFO'      },
};

export function Badge({ variant }: { variant: Variant }) {
  const c = CFG[variant];
  return (
    <View className={`px-2.5 py-0.5 rounded-full self-start ${c.bg}`}>
      <Text className={`text-[10px] font-bold tracking-wider ${c.text}`}>{c.label}</Text>
    </View>
  );
}