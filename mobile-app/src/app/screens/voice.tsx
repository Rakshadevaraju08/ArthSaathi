import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function VoiceScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950 items-center justify-center px-5">
      <View className="w-40 h-40 rounded-full bg-emerald-500 items-center justify-center">
        <Text className="text-white text-5xl">
          🎤
        </Text>
      </View>

      <Text className="text-white text-2xl font-bold mt-8">
        Listening...
      </Text>

      <Text className="text-slate-400 text-center mt-3">
        Speak your expense or financial query
      </Text>

      <Pressable
        onPress={() => router.back()}
        className="bg-white rounded-2xl px-6 py-4 mt-10"
      >
        <Text className="font-bold">
          Close
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}