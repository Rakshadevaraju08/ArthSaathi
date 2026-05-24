import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated';
import type { LoanRisk } from '../../types';

const POS: Record<LoanRisk, number> = { safe: 8, moderate: 50, high: 87 };

export function RiskGauge({ risk }: { risk: LoanRisk }) {
  const left = useSharedValue(POS.safe);

  useEffect(() => {
    left.value = withTiming(POS[risk], { duration: 600 });
  }, [risk]);

  const dotStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left:     `${left.value}%` as any,
    top:      -4,
    width:    20,
    height:   20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
    marginLeft: -10,
  }));

  return (
    <View className="my-1">
      <View className="h-3 rounded-full overflow-visible" style={{ backgroundColor: '#e2e8f0' }}>
        {/* gradient overlay */}
        <View className="absolute inset-0 rounded-full flex-row overflow-hidden">
          <View className="flex-1 bg-emerald-400" />
          <View className="flex-1 bg-amber-400" />
          <View className="flex-1 bg-rose-500" />
        </View>
        <Animated.View style={dotStyle} />
      </View>
      <View className="flex-row justify-between mt-1.5">
        <Text className="text-[10px] text-emerald-600 font-semibold">Safe</Text>
        <Text className="text-[10px] text-amber-500 font-semibold">Moderate</Text>
        <Text className="text-[10px] text-rose-600 font-semibold">High</Text>
      </View>
    </View>
  );
}