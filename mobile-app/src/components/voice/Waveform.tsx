import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { C } from '../../constants/colors';

type Props = { 
  active: boolean; 
  color?: string;
};

const HEIGHTS = [30, 55, 70, 90, 55];

function WaveBar({ 
  active, 
  height, 
  index, 
  color 
}: { 
  active: boolean; 
  height: number; 
  index: number; 
  color: string;
}) {
  const animatedHeight = useSharedValue(height * 0.2);

  useEffect(() => {
    if (active) {
      // Random duration for each bar to create natural wave effect
      const duration = 400 + Math.random() * 300;
      const maxHeight = height * (0.7 + Math.random() * 0.3);
      
      animatedHeight.value = withRepeat(
        withSequence(
          withTiming(maxHeight, { 
            duration: duration, 
            easing: Easing.inOut(Easing.ease) 
          }),
          withTiming(height * 0.2, { 
            duration: duration, 
            easing: Easing.inOut(Easing.ease) 
          })
        ),
        -1,
        false
      );
    } else {
      // Stop animation and return to minimum height
      cancelAnimation(animatedHeight);
      animatedHeight.value = withTiming(height * 0.2, { duration: 200 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 5,
          borderRadius: 3,
          backgroundColor: color,
          minHeight: 4,
        },
        animatedStyle,
      ]}
    />
  );
}

export function Waveform({ active, color = C.emerald500 }: Props) {
  return (
    <View className="flex-row items-center gap-1" style={{ height: 40 }}>
      {HEIGHTS.map((height, i) => (
        <WaveBar 
          key={i} 
          active={active} 
          height={height} 
          index={i} 
          color={color} 
        />
      ))}
    </View>
  );
}