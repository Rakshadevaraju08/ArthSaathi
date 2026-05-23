import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { C } from '../../constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const R    = 38;
const CIRC = 2 * Math.PI * R;

type Props = { score: number; max?: number };

export function TrustScore({ score, max = 1000 }: Props) {
  const progress = useSharedValue(0);
  const pct      = score / max;

  useEffect(() => {
    progress.value = withTiming(pct, { duration: 1400, easing: Easing.out(Easing.cubic) });
  }, [pct, progress]);

  const animProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - progress.value),
  }));

  const color = pct > 0.7 ? C.emerald500 : pct > 0.4 ? C.amber500 : C.rose500;

  return (
    <View className="items-center justify-center" style={{ width: 92, height: 92 }}>
      <Svg width={92} height={92} viewBox="0 0 92 92" style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={46} cy={46} r={R} stroke="rgba(255,255,255,0.25)" strokeWidth={8} fill="none" />
        <AnimatedCircle
          cx={46} cy={46} r={R}
          stroke={color}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animatedProps={animProps}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-xl font-bold text-white">{score}</Text>
        <Text className="text-[9px] text-white/70">/{max}</Text>
      </View>
    </View>
  );
}