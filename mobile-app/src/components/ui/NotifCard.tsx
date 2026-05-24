import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Shield, Lightbulb, BellRing, X } from 'lucide-react-native';
import type { Notif } from '../../types';
import { C } from '../../constants/colors';

type Props = { notif: Notif; onDismiss: (id: string) => void };

const CFG = {
  alert: { bg: 'bg-rose-50',    border: 'border-rose-200',    dot: 'bg-rose-500',    Icon: Shield,    iconColor: C.rose500   },
  tip:   { bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500',   Icon: Lightbulb, iconColor: C.amber500  },
  info:  { bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', Icon: BellRing,  iconColor: C.emerald500 },
};

export function NotifCard({ notif, onDismiss }: Props) {
  const c = CFG[notif.type];
  return (
    <View className={`rounded-2xl p-3 flex-row items-start gap-3 border ${c.bg} ${c.border}`}>
      <View className={`w-9 h-9 rounded-xl items-center justify-center ${c.bg}`}>
        <c.Icon size={16} color={c.iconColor} />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-sm text-slate-800 leading-[18px]">{notif.message}</Text>
        <Text className="text-[11px] text-slate-400 mt-0.5">{notif.ts}</Text>
      </View>
      <TouchableOpacity onPress={() => onDismiss(notif.id)} className="p-1">
        <X size={16} color={C.slate400} />
      </TouchableOpacity>
      {!notif.read && (
        <View className={`absolute top-3 right-8 w-2 h-2 rounded-full ${c.dot}`} />
      )}
    </View>
  );
}