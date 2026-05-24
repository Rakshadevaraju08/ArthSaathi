import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Mic } from 'lucide-react-native';
import { C } from '../constants/colors';

export function MicFAB() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/screens/voice');
      }}
      activeOpacity={0.85}
      style={{
        position:   'absolute',
        bottom:     28,
        alignSelf:  'center',
        left:       '50%',
        marginLeft: -30,
        zIndex:     99,
        shadowColor:   C.emerald500,
        shadowOffset:  { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius:  12,
        elevation: 10,
      }}
    >
      <LinearGradient
        colors={[C.emerald500, C.teal600]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 60, height: 60, borderRadius: 30,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 3, borderColor: C.white,
        }}
      >
        <Mic color={C.white} size={24} strokeWidth={2.5} />
      </LinearGradient>
    </TouchableOpacity>
  );
}