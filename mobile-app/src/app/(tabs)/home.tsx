import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useStore } from "@/store";

export default function HomeScreen() {
  const transactions = useStore((s) => s.transactions);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5">
        <View className="mt-4">
          <Text className="text-3xl font-bold text-slate-800">
            ArthSaathi
          </Text>

          <Text className="text-slate-500 mt-1">
            Rural Financial Intelligence
          </Text>
        </View>

        <View className="flex-row gap-4 mt-8">
          <View className="flex-1 bg-emerald-500 rounded-3xl p-5">
            <Text className="text-white/80">
              Income
            </Text>

            <Text className="text-white text-2xl font-bold mt-2">
              ₹{income}
            </Text>
          </View>

          <View className="flex-1 bg-rose-500 rounded-3xl p-5">
            <Text className="text-white/80">
              Expense
            </Text>

            <Text className="text-white text-2xl font-bold mt-2">
              ₹{expense}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/voice")}
          className="bg-slate-900 rounded-3xl p-5 mt-6"
        >
          <Text className="text-white text-lg font-bold">
            Open Voice Assistant
          </Text>
        </Pressable>

        <View className="mt-8">
          <Text className="text-xl font-bold text-slate-800">
            Recent Transactions
          </Text>

          <View className="gap-3 mt-4">
            {transactions.map((tx) => (
              <View
                key={tx.id}
                className="bg-white rounded-2xl p-4 flex-row justify-between"
              >
                <Text className="text-slate-700">
                  {tx.title}
                </Text>

                <Text className="font-bold">
                  ₹{tx.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}