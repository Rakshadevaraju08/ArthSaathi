import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, cancelAnimation, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { C } from '../../constants/colors';

type Props = {
  listening: boolean;
  onPress: () => void;
  level?: number; // 0 to 1 normalized metering
};

const SIZE = 80;

export function MicButton({ listening, onPress, level = 0 }: Props) {
  const r1 = useSharedValue(1);
  const r2 = useSharedValue(1);
  const r3 = useSharedValue(1);
  const r4 = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(glowOpacity);
    glowOpacity.value = withTiming(listening ? 1 : 0, { duration: 300 });
  }, [listening]);

  useEffect(() => {
    if (!listening) {
      cancelAnimation(r1); r1.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      cancelAnimation(r2); r2.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      cancelAnimation(r3); r3.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      cancelAnimation(r4); r4.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      return;
    }

    // Gentler multipliers for a more refined expansion
    const l1 = 1 + level * 0.25;
    const l2 = 1 + level * 0.5;
    const l3 = 1 + level * 0.8;
    const l4 = 1 + level * 1.15;

    // Spring physics give an organic, fluid bounce to the voice waves
    r1.value = withSpring(l1, { damping: 12, stiffness: 200 });
    r2.value = withSpring(l2, { damping: 14, stiffness: 180 });
    r3.value = withSpring(l3, { damping: 16, stiffness: 160 });
    r4.value = withSpring(l4, { damping: 18, stiffness: 140 });
  }, [level, listening]);

  const ringBase = {
    position: 'absolute' as const,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
  };

  const s1 = useAnimatedStyle(() => ({
    ...ringBase,
    width: SIZE + 8,
    height: SIZE + 8,
    borderColor: C.emerald300,
    transform: [{ scale: r1.value }],
    opacity: withTiming(listening ? 0.6 : 0, { duration: 250 }),
  }), [listening]);

  const s2 = useAnimatedStyle(() => ({
    ...ringBase,
    width: SIZE + 24,
    height: SIZE + 24,
    borderColor: C.emerald400,
    transform: [{ scale: r2.value }],
    opacity: withTiming(listening ? 0.45 : 0, { duration: 250 }),
  }), [listening]);

  const s3 = useAnimatedStyle(() => ({
    ...ringBase,
    width: SIZE + 44,
    height: SIZE + 44,
    borderColor: C.teal400,
    transform: [{ scale: r3.value }],
    opacity: withTiming(listening ? 0.3 : 0, { duration: 250 }),
  }), [listening]);

  const s4 = useAnimatedStyle(() => ({
    ...ringBase,
    width: SIZE + 68,
    height: SIZE + 68,
    borderColor: C.emerald200,
    transform: [{ scale: r4.value }],
    opacity: withTiming(listening ? 0.15 : 0, { duration: 250 }),
  }), [listening]);

  const glowStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: SIZE + 30,
    height: SIZE + 30,
    borderRadius: (SIZE + 30) / 2,
    backgroundColor: listening ? C.emerald400 : 'transparent',
    opacity: glowOpacity.value * 0.2 * (1 + level * 0.5),
    transform: [{ scale: 1 + level * 0.3 }],
  }));

  const buttonActive = listening;

  return (
    <Animated.View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: SIZE * 2.8,
      height: SIZE * 2.8,
    }}>
      {/* Glow */}
      <Animated.View style={glowStyle} />

      {/* Wave rings propagate outward */}
      <Animated.View style={[ringBase, s4]} />
      <Animated.View style={[ringBase, s3]} />
      <Animated.View style={[ringBase, s2]} />
      <Animated.View style={[ringBase, s1]} />

      {/* Button */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={buttonActive
            ? ['#ef4444', '#dc2626']
            : [C.emerald500, C.teal600]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: buttonActive ? '#ef4444' : C.emerald500,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 14,
            elevation: 10,
          }}
        >
          <Feather
            name={buttonActive ? 'square' : 'mic'}
            color="#fff"
            size={32}
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}
