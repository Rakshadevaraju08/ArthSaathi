import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { C } from '../../constants/colors';

const rows = [
  { crop: 'Tomato', status: 'Ready in 12 days', price: 'Rs 1,850/qtl', trend: '+8%', progress: 72 },
  { crop: 'Onion', status: 'Storage check', price: 'Rs 2,240/qtl', trend: '+3%', progress: 58 },
  { crop: 'Ragi', status: 'Hold stock', price: 'Rs 3,920/qtl', trend: 'Stable', progress: 44 },
];

export function MandiDashboard() {
  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-slate-900 text-2xl font-black">Mandi Dashboard</Text>
          <Text className="text-slate-500 text-sm mt-1">Harvest pricing and RTC readiness</Text>
        </View>
        <TouchableOpacity className="w-11 h-11 rounded-full bg-emerald-600 items-center justify-center">
          <Feather name="file-text" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-4">
        <View className="flex-1 bg-emerald-600 rounded-2xl p-4 mr-2">
          <Text className="text-emerald-50 text-xs font-bold">Best crop today</Text>
          <Text className="text-white text-2xl font-black mt-1">Onion</Text>
          <Text className="text-emerald-50 text-xs mt-1">Rs 2,240/qtl</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl border border-slate-100 p-4 ml-2">
          <Text className="text-slate-500 text-xs font-bold">RTC status</Text>
          <Text className="text-slate-900 text-xl font-black mt-1">Ready</Text>
          <Text className="text-emerald-600 text-xs font-bold mt-1">OCR passed</Text>
        </View>
      </View>

      {rows.map((row) => (
        <View key={row.crop} className="bg-white rounded-2xl border border-slate-100 p-4 mb-3">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-slate-900 font-black text-lg">{row.crop}</Text>
              <Text className="text-slate-500 text-xs mt-1">{row.status}</Text>
            </View>
            <View className="items-end">
              <Text className="text-emerald-700 font-black">{row.price}</Text>
              <Text className="text-emerald-600 text-xs font-bold mt-1">{row.trend}</Text>
            </View>
          </View>
          <View className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
            <View className="h-2 bg-emerald-500 rounded-full" style={{ width: `${row.progress}%` }} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
