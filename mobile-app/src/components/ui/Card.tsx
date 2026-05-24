import React from 'react';
import { View, type ViewStyle } from 'react-native';

type Props = { children: React.ReactNode; style?: ViewStyle; className?: string };

export function Card({ children, style, className = '' }: Props) {
  return (
    <View
      className={`bg-white rounded-2xl border border-slate-100 ${className}`}
      style={[
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}