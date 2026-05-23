import React, { useEffect } from 'react';
import { View } from 'react-native';
import { C } from '../../constants/colors';

type Props = { active: boolean; color?: string };

const HEIGHTS = [30, 55, 70, 90, 55];

function WaveBar({ active, height, index, color }: { active: boolean; height: number; index: number; color: string }) {
  return (
    <View
      style={[{ width: 5, borderRadius: 3, backgroundColor: color, minHeight: 4, height: active ? height : height * 0.2 }]}
    />
  );
}

export function Waveform({ active, color = C.emerald500 }: Props) {
  return (
    <View className="flex-row items-center gap-1" style={{ height: 40 }}>
      {HEIGHTS.map((height, i) => (
        <WaveBar key={i} active={active} height={height} index={i} color={color} />
      ))}
    </View>
  );
}