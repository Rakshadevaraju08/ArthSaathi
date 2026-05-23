import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing,
} from 'react-native-reanimated';
import { C } from '../../constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const R    = 38;
const CIRC = 2 * Math.PI * R;

export function HealthScoreRing({ score }: { score: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 1400, easing: Easing.out(Easing.cubic) });
  }, [score, progress]);

  const animProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - progress.value),
  }));

  const strokeColor = score > 70 ? C.emerald400 : score > 40 ? C.amber400 : C.rose500;

  return (
    <View className="items-center justify-center" style={{ width: 92, height: 92 }}>
      <Svg width={92} height={92} viewBox="0 0 92 92" style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={46} cy={46} r={R} stroke="rgba(255,255,255,0.25)" strokeWidth={8} fill="none" />
        <AnimatedCircle
          cx={46} cy={46} r={R}
          stroke={strokeColor}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animatedProps={animProps}
        />
      </Svg>
      <View className="absolute">
        <Text className="text-3xl font-bold text-white text-center leading-tight">{score}</Text>
        <Text className="text-[11px] text-white/70 text-center">/100</Text>
      </View>
    </View>
  );
}