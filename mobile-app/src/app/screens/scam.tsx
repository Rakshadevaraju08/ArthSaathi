import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScamScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-5" edges={['top']}>
      <View className="bg-white rounded-2xl border border-slate-100 p-5">
        <Text className="text-slate-900 text-2xl font-black">Fraud warning mock</Text>
        <Text className="text-slate-600 mt-3">This prototype uses local guidance only.</Text>
      </View>
    </SafeAreaView>
  );
}
