import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { C } from '../../constants/colors';
import { endpoints } from '../../services/api';
import { useTranslations } from '../../hooks/useTranslations';
import type { DeliveryMeta, OrderMeta, Transaction } from '../../types';

type OrderRow = {
  id: string;
  name: string;
  count: string;
  status: string;
  due: string;
  progress: number;
  amount: number;
};

type DeliveryRow = {
  id: string;
  customer: string;
  item: string;
  time: string;
  amount: number;
};

function txToOrder(tx: Transaction): OrderRow {
  const m = (tx.ledgerMeta ?? {}) as OrderMeta;
  return {
    id:       tx.id,
    name:     m.orderName   ?? tx.note ?? 'Unknown',
    count:    m.pieceCount  ?? '',
    status:   m.status      ?? 'New order',
    due:      m.dueDate     ?? '',
    progress: m.progress    ?? 12,
    amount:   tx.amount,
  };
}

function txToDelivery(tx: Transaction): DeliveryRow {
  const m = (tx.ledgerMeta ?? {}) as DeliveryMeta;
  return {
    id:       tx.id,
    customer: m.customer      ?? tx.note ?? 'Unknown',
    item:     m.deliveryItem  ?? '',
    time:     m.deliveryTime  ?? '',
    amount:   tx.amount,
  };
}

export function TailorOrders() {
  const t = useTranslations();
  const [orders, setOrders]         = useState<OrderRow[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [activeForm, setActiveForm] = useState<'order' | 'delivery'>('order');
  const [orderForm, setOrderForm]   = useState({ name: '', count: '', due: '', amount: '' });
  const [deliveryForm, setDeliveryForm] = useState({ customer: '', item: '', time: '', amount: '' });

  const fetchEntries = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await endpoints.getLedgerEntries('TAILOR');
      const grouped = res.data?.data?.grouped ?? {};
      setOrders((grouped['Order']    ?? []).map(txToOrder));
      setDeliveries((grouped['Delivery'] ?? []).map(txToDelivery));
    } catch {
      Alert.alert('Error', t.couldNotLoadData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const saveOrder = async () => {
    if (!orderForm.name.trim() || !orderForm.count.trim()) return;
    setSaving(true);
    try {
      await endpoints.addLedgerEntry({
        amount:     parseFloat(orderForm.amount) || 0,
        type:       'income',
        category:   'Order',
        note:       orderForm.name.trim(),
        ledgerMeta: {
          orderName:  orderForm.name.trim(),
          pieceCount: `${orderForm.count.trim()} pieces`,
          status:     'New order',
          dueDate:    orderForm.due.trim() || 'This week',
          progress:   12,
        },
      });
      setOrderForm({ name: '', count: '', due: '', amount: '' });
      fetchEntries();
    } catch {
      Alert.alert('Error', 'Could not save order.');
    } finally {
      setSaving(false);
    }
  };

  const saveDelivery = async () => {
    if (!deliveryForm.customer.trim() || !deliveryForm.item.trim()) return;
    setSaving(true);
    try {
      await endpoints.addLedgerEntry({
        amount:     parseFloat(deliveryForm.amount) || 0,
        type:       'income',
        category:   'Delivery',
        note:       deliveryForm.customer.trim(),
        ledgerMeta: {
          customer:     deliveryForm.customer.trim(),
          deliveryItem: deliveryForm.item.trim(),
          deliveryTime: deliveryForm.time.trim() || 'Today',
        },
      });
      setDeliveryForm({ customer: '', item: '', time: '', amount: '' });
      fetchEntries();
    } catch {
      Alert.alert('Error', 'Could not save delivery.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, type: 'Order' | 'Delivery') => {
    Alert.alert(`Delete ${type}?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await endpoints.deleteLedgerEntry(id);
            if (type === 'Order') setOrders((p) => p.filter((r) => r.id !== id));
            else setDeliveries((p) => p.filter((r) => r.id !== id));
          } catch {
            Alert.alert('Error', 'Could not delete entry.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchEntries(true)} />}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-slate-900 text-2xl font-black">Tailor Desk</Text>
          <Text className="text-slate-500 text-sm mt-1">Orders queue and delivery plan</Text>
        </View>
        <View className="w-11 h-11 rounded-full bg-emerald-600 items-center justify-center">
          <Feather name="scissors" size={20} color="#fff" />
        </View>
      </View>

      {/* Tab switcher */}
      <View className="flex-row bg-white border border-slate-100 rounded-2xl p-1 mb-4">
        {(['order', 'delivery'] as const).map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setActiveForm(item)}
            className={`flex-1 py-3 rounded-xl items-center ${activeForm === item ? 'bg-emerald-600' : ''}`}
          >
            <Text className={`font-black ${activeForm === item ? 'text-white' : 'text-slate-600'}`}>
              {item === 'order' ? 'Add Order' : 'Add Delivery'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Form */}
      <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        {activeForm === 'order' ? (
          <>
            <Text className="text-slate-900 font-black mb-3">New Order Queue Item</Text>
            <TextInput
              value={orderForm.name}
              onChangeText={(name) => setOrderForm({ ...orderForm, name })}
              placeholder="Order name"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={orderForm.count}
              onChangeText={(count) => setOrderForm({ ...orderForm, count })}
              placeholder="Pieces count"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={orderForm.amount}
              onChangeText={(amount) => setOrderForm({ ...orderForm, amount })}
              placeholder="Order price / deposit (Rs)"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={orderForm.due}
              onChangeText={(due) => setOrderForm({ ...orderForm, due })}
              placeholder="Due date"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3"
            />
            <TouchableOpacity onPress={saveOrder} disabled={saving} className="bg-emerald-600 rounded-xl py-3 items-center">
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-black">Save Order</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-slate-900 font-black mb-3">New Delivery Plan</Text>
            <TextInput
              value={deliveryForm.customer}
              onChangeText={(customer) => setDeliveryForm({ ...deliveryForm, customer })}
              placeholder="Customer name"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={deliveryForm.item}
              onChangeText={(item) => setDeliveryForm({ ...deliveryForm, item })}
              placeholder="Delivery item"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={deliveryForm.amount}
              onChangeText={(amount) => setDeliveryForm({ ...deliveryForm, amount })}
              placeholder="Stitching charge / remaining pay (Rs)"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
            />
            <TextInput
              value={deliveryForm.time}
              onChangeText={(time) => setDeliveryForm({ ...deliveryForm, time })}
              placeholder="Delivery time"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3"
            />
            <TouchableOpacity onPress={saveDelivery} disabled={saving} className="bg-emerald-600 rounded-xl py-3 items-center">
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-black">Save Delivery</Text>
              }
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Loading */}
      {loading ? (
        <View className="items-center py-10">
          <ActivityIndicator color={C.emerald600} size="large" />
          <Text className="text-slate-400 mt-3 text-sm">Loading orders…</Text>
        </View>
      ) : (
        <>
          {/* Orders Queue */}
          <Text className="text-slate-900 text-base font-black mb-3">Orders Queue</Text>
          {orders.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-100 p-6 items-center mb-3">
              <Text className="text-slate-400 text-sm">No orders yet. Add your first order above.</Text>
            </View>
          ) : orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onLongPress={() => handleDelete(order.id, 'Order')}
              activeOpacity={0.8}
              className="bg-white rounded-2xl border border-slate-100 p-4 mb-3"
            >
              <View className="flex-row justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-slate-900 font-black text-base">{order.name}</Text>
                  <Text className="text-slate-500 text-xs mt-1">{order.count} - {order.status}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-900 font-black">{order.due}</Text>
                  <Text className="text-emerald-600 text-xs font-black mt-1">Rs {order.amount.toLocaleString('en-IN')}</Text>
                  <Text className="text-slate-400 text-[10px] font-bold mt-1">{order.progress}% progress</Text>
                </View>
              </View>
              <View className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                <View className="h-2 bg-emerald-500 rounded-full" style={{ width: `${order.progress}%` }} />
              </View>
              <Text className="text-slate-300 text-[10px] mt-2">Long press to delete</Text>
            </TouchableOpacity>
          ))}

          {/* Delivery Plan */}
          <Text className="text-slate-900 text-base font-black mt-2 mb-3">Delivery Plan</Text>
          {deliveries.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-100 p-6 items-center mb-3">
              <Text className="text-slate-400 text-sm">No deliveries scheduled.</Text>
            </View>
          ) : deliveries.map((delivery) => (
            <TouchableOpacity
              key={delivery.id}
              onLongPress={() => handleDelete(delivery.id, 'Delivery')}
              activeOpacity={0.8}
              className="bg-white rounded-2xl border border-slate-100 p-4 mb-3 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                <Feather name="truck" size={18} color={C.blue500} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-black">{delivery.customer}</Text>
                <Text className="text-slate-500 text-xs mt-0.5">{delivery.item}</Text>
                <Text className="text-slate-400 text-[10px] mt-1 font-bold">Time: {delivery.time}</Text>
                <Text className="text-slate-300 text-[10px] mt-1">Long press to delete</Text>
              </View>
              <Text className="text-emerald-700 font-black ml-3">Rs {delivery.amount.toLocaleString('en-IN')}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}
