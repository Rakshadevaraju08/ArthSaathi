import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
  cancelAnimation, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic } from 'lucide-react-native';
import { C } from '../../constants/colors';

type Props = { listening: boolean; onPress: () => void };

const SIZE = 96;

export function MicButton({ listening, onPress }: Props) {
  const r1 = useSharedValue(1);
  const r2 = useSharedValue(1);
  const r3 = useSharedValue(1);

  useEffect(() => {
    if (listening) {
      r1.value = withRepeat(withSequence(withTiming(1.6, { duration: 900, easing: Easing.out(Easing.ease) }), withTiming(1, { duration: 0 })), -1, false);
      r2.value = withRepeat(withSequence(withTiming(1,   { duration: 300 }), withTiming(2.0, { duration: 1100, easing: Easing.out(Easing.ease) }), withTiming(1, { duration: 0 })), -1, false);
      r3.value = withRepeat(withSequence(withTiming(1,   { duration: 600 }), withTiming(2.4, { duration: 1200, easing: Easing.out(Easing.ease) }), withTiming(1, { duration: 0 })), -1, false);
    } else {
      [r1, r2, r3].forEach((v) => { cancelAnimation(v); v.value = withTiming(1); });
    }
  }, [listening]);

  const ring = (sv: typeof r1, opacity: number) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      transform: [{ scale: sv.value }],
      opacity: listening ? opacity : 0,
    }));

  const s1 = ring(r1, 0.5);
  const s2 = ring(r2, 0.35);
  const s3 = ring(r3, 0.2);

  const ringBase = {
    position:     'absolute' as const,
    width:        SIZE,
    height:       SIZE,
    borderRadius: SIZE / 2,
    borderWidth:  2,
    borderColor:  C.emerald400,
  };

  return (
    <Animated.View style={{ alignItems: 'center', justifyContent: 'center', width: SIZE * 2.6, height: SIZE * 2.6 }}>
      <Animated.View style={[ringBase, s3]} />
      <Animated.View style={[ringBase, s2]} />
      <Animated.View style={[ringBase, s1]} />
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <LinearGradient
          colors={[C.emerald500, C.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: SIZE, height: SIZE, borderRadius: SIZE / 2,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: C.emerald500, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.45, shadowRadius: 16, elevation: 10,
          }}
        >
          <Mic color={C.white} size={36} strokeWidth={2} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}