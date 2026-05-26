import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withRepeat, withSequence, cancelAnimation, Easing,
} from 'react-native-reanimated';
import { C } from '../../constants/colors';

type Props = {
  active: boolean;
  level?: number; // 0 to 1
  color?: string;
  barCount?: number;
  height?: number;
};

const MIN_H = 6;

function WaveBar({ active, level, maxH, sensitivity, color }:
{
  active: boolean;
  level: number;
  maxH: number;
  sensitivity: number;
  color: string;
}) {
  const animH = useSharedValue(MIN_H);
  const baseIdleH = useSharedValue(MIN_H);

  // Gentle idle sine-bar
  useEffect(() => {
    if (active) return;
    baseIdleH.value = withRepeat(
      withSequence(
        withTiming(MIN_H + (maxH - MIN_H) * 0.25, { duration: 800 + sensitivity * 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(MIN_H, { duration: 800 + sensitivity * 300, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    return () => {
      cancelAnimation(baseIdleH);
    };
  }, [active, maxH, sensitivity]);

  useEffect(() => {
    if (!active) {
      animH.value = MIN_H;
      return;
    }
    const target = MIN_H + (maxH - MIN_H) * Math.min(1, level * sensitivity);
    animH.value = withTiming(target, {
      duration: 60,
      easing: Easing.out(Easing.ease),
    });
  }, [active, level, maxH, sensitivity]);

  const style = useAnimatedStyle(() => ({
    height: active ? animH.value : baseIdleH.value,
  }));

  return (
    <Animated.View style={[{
      width: 4,
      borderRadius: 2,
      backgroundColor: color,
      minHeight: MIN_H,
    }, style]} />
  );
}

// Generate symmetric bar profile for a natural waveform look
function generateBarProfile(count: number, maxHeight: number) {
  const bars: { maxH: number; sensitivity: number }[] = [];
  const mid = (count - 1) / 2;
  for (let i = 0; i < count; i++) {
    const dist = Math.abs(i - mid) / mid; // 0 at center, 1 at edges
    const heightFactor = 1 - dist * dist;  // parabolic, peaks in center
    bars.push({
      maxH: Math.max(MIN_H + 4, Math.round(maxHeight * heightFactor)),
      sensitivity: 0.3 + heightFactor * 0.7,
    });
  }
  return bars;
}

export function Waveform({ active, level = 0, color = C.emerald500, barCount = 21, height = 56 }: Props) {
  const bars = React.useMemo(() => generateBarProfile(barCount, height), [barCount, height]);

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      height: height + 8,
      paddingHorizontal: 16,
    }}>
      {bars.map((bar, i) => (
        <WaveBar
          key={i}
          active={active}
          level={level}
          maxH={bar.maxH}
          sensitivity={bar.sensitivity}
          color={active ? color : C.emerald300}
        />
      ))}
    </View>
  );
}
