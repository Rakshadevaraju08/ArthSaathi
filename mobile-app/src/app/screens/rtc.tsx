import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RtcScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-5" edges={['top']}>
      <View className="bg-white rounded-2xl border border-slate-100 p-5">
        <Text className="text-slate-900 text-2xl font-black">RTC OCR mock</Text>
        <Text className="text-emerald-700 font-bold mt-3">Simulated OCR Pass</Text>
        <Text className="text-slate-600 mt-2">No document upload or backend call is performed.</Text>
      </View>
    </SafeAreaView>
  );
}
