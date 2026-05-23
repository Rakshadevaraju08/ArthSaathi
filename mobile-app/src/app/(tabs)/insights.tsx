import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InsightsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
      <Text className="text-2xl font-bold">
        AI Insights
      </Text>
    </SafeAreaView>
  );
}