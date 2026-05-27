import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { C } from '../../constants/colors';

type Order = { name: string; count: string; status: string; due: string; progress: number };
type Delivery = { customer: string; item: string; time: string };

const initialOrders: Order[] = [
  { name: 'School uniforms', count: '6 pieces', status: 'Cutting', due: 'Tomorrow', progress: 35 },
  { name: 'Blouse orders', count: '4 pieces', status: 'Stitching', due: 'Friday', progress: 62 },
  { name: 'Alterations', count: '11 pieces', status: 'Delivery today', due: 'Today', progress: 92 },
];

const initialDeliveries: Delivery[] = [
  { customer: 'Meena', item: '2 blouses', time: 'Today 6 PM' },
  { customer: 'School order', item: 'Uniform batch', time: 'Tomorrow' },
  { customer: 'Kavita', item: 'Fall pico', time: 'Friday' },
];

export function TailorOrders() {
  const [orders, setOrders] = useState(initialOrders);
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [activeForm, setActiveForm] = useState<'order' | 'delivery'>('order');
  const [orderForm, setOrderForm] = useState({ name: '', count: '', due: '' });
  const [deliveryForm, setDeliveryForm] = useState({ customer: '', item: '', time: '' });

  const addOrder = () => {
    if (!orderForm.name.trim() || !orderForm.count.trim()) return;
    setOrders((current) => [
      {
        name: orderForm.name.trim(),
        count: `${orderForm.count.trim()} pieces`,
        status: 'New order',
        due: orderForm.due.trim() || 'This week',
        progress: 12,
      },
      ...current,
    ]);
    setOrderForm({ name: '', count: '', due: '' });
  };

  const addDelivery = () => {
    if (!deliveryForm.customer.trim() || !deliveryForm.item.trim()) return;
    setDeliveries((current) => [
      {
        customer: deliveryForm.customer.trim(),
        item: deliveryForm.item.trim(),
        time: deliveryForm.time.trim() || 'Today',
      },
      ...current,
    ]);
    setDeliveryForm({ customer: '', item: '', time: '' });
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-slate-900 text-2xl font-black">Tailor Desk</Text>
          <Text className="text-slate-500 text-sm mt-1">Orders queue and delivery plan</Text>
        </View>
        <View className="w-11 h-11 rounded-full bg-emerald-600 items-center justify-center">
          <Feather name="scissors" size={20} color="#fff" />
        </View>
      </View>

      <View className="flex-row bg-white border border-slate-100 rounded-2xl p-1 mb-4">
        {(['order', 'delivery'] as const).map((item) => (
          <TouchableOpacity key={item} onPress={() => setActiveForm(item)} className={`flex-1 py-3 rounded-xl items-center ${activeForm === item ? 'bg-emerald-600' : ''}`}>
            <Text className={`font-black ${activeForm === item ? 'text-white' : 'text-slate-600'}`}>
              {item === 'order' ? 'Add Order' : 'Add Delivery'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        {activeForm === 'order' ? (
          <>
            <Text className="text-slate-900 font-black mb-3">New Order Queue Item</Text>
            <TextInput value={orderForm.name} onChangeText={(name) => setOrderForm({ ...orderForm, name })} placeholder="Order name" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <TextInput value={orderForm.count} onChangeText={(count) => setOrderForm({ ...orderForm, count })} placeholder="Pieces count" keyboardType="numeric" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <TextInput value={orderForm.due} onChangeText={(due) => setOrderForm({ ...orderForm, due })} placeholder="Due date" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3" />
            <TouchableOpacity onPress={addOrder} className="bg-emerald-600 rounded-xl py-3 items-center">
              <Text className="text-white font-black">Save Order</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-slate-900 font-black mb-3">New Delivery Plan</Text>
            <TextInput value={deliveryForm.customer} onChangeText={(customer) => setDeliveryForm({ ...deliveryForm, customer })} placeholder="Customer name" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <TextInput value={deliveryForm.item} onChangeText={(item) => setDeliveryForm({ ...deliveryForm, item })} placeholder="Delivery item" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2" />
            <TextInput value={deliveryForm.time} onChangeText={(time) => setDeliveryForm({ ...deliveryForm, time })} placeholder="Delivery time" placeholderTextColor="#94a3b8" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3" />
            <TouchableOpacity onPress={addDelivery} className="bg-emerald-600 rounded-xl py-3 items-center">
              <Text className="text-white font-black">Save Delivery</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text className="text-slate-900 text-base font-black mb-3">Orders Queue</Text>
      {orders.map((order) => (
        <View key={`${order.name}-${order.due}`} className="bg-white rounded-2xl border border-slate-100 p-4 mb-3">
          <View className="flex-row justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-slate-900 font-black text-base">{order.name}</Text>
              <Text className="text-slate-500 text-xs mt-1">{order.count} - {order.status}</Text>
            </View>
            <View className="items-end">
              <Text className="text-slate-900 font-black">{order.due}</Text>
              <Text className="text-emerald-600 text-xs font-bold mt-1">{order.progress}%</Text>
            </View>
          </View>
          <View className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
            <View className="h-2 bg-emerald-500 rounded-full" style={{ width: `${order.progress}%` }} />
          </View>
        </View>
      ))}

      <Text className="text-slate-900 text-base font-black mt-2 mb-3">Delivery Plan</Text>
      {deliveries.map((delivery) => (
        <View key={`${delivery.customer}-${delivery.time}`} className="bg-white rounded-2xl border border-slate-100 p-4 mb-3 flex-row items-center">
          <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
            <Feather name="calendar" size={18} color={C.blue500} />
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 font-black">{delivery.customer}</Text>
            <Text className="text-slate-500 text-xs mt-1">{delivery.item}</Text>
          </View>
          <Text className="text-slate-700 font-bold">{delivery.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
