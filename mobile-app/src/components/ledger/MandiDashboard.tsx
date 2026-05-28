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
import type { CropMeta, Transaction } from '../../types';

type CropRow = {
  id: string;
  crop: string;
  status: string;
  pricePerQtl: string;
  trend: string;
  progress: number;
  amount: number;
};

function txToCropRow(tx: Transaction): CropRow {
  const m = (tx.ledgerMeta ?? {}) as CropMeta;
  return {
    id:          tx.id,
    crop:        m.crop         ?? tx.note ?? 'Unknown',
    status:      m.status       ?? '',
    pricePerQtl: m.pricePerQtl  ?? '',
    trend:       m.trend        ?? '',
    progress:    m.progress     ?? 0,
    amount:      tx.amount,
  };
}

export function MandiDashboard() {
  const t = useTranslations();
  const [rows, setRows]         = useState<CropRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({
    crop: '', status: '', pricePerQtl: '', trend: '', progress: '', amount: '',
  });

  const fetchEntries = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await endpoints.getLedgerEntries('FARMER');
      const grouped = res.data?.data?.grouped ?? {};
      const cropTxs: Transaction[] = [
        ...(grouped['Crop Sale'] ?? []),
        ...(grouped['Input Cost'] ?? []),
      ];
      setRows(cropTxs.map(txToCropRow));
    } catch (e) {
      Alert.alert('Error', t.couldNotLoadData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleSave = async () => {
    if (!form.crop.trim()) return Alert.alert('Required', 'Crop name is required.');
    setSaving(true);
    try {
      await endpoints.addLedgerEntry({
        amount:     parseFloat(form.amount) || 0,
        type:       'income',
        category:   'Crop Sale',
        note:       form.crop.trim(),
        ledgerMeta: {
          crop:        form.crop.trim(),
          status:      form.status.trim() || 'Pending',
          pricePerQtl: form.pricePerQtl.trim() || '—',
          trend:       form.trend.trim() || 'Stable',
          progress:    Math.min(100, Math.max(0, parseInt(form.progress, 10) || 0)),
        },
      });
      setForm({ crop: '', status: '', pricePerQtl: '', trend: '', progress: '', amount: '' });
      setShowForm(false);
      fetchEntries();
    } catch (e) {
      Alert.alert('Error', 'Could not save crop entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete entry?', 'This will permanently remove this crop entry.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await endpoints.deleteLedgerEntry(id);
            setRows((prev) => prev.filter((r) => r.id !== id));
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
          <Text className="text-slate-900 text-2xl font-black">Mandi Dashboard</Text>
          <Text className="text-slate-500 text-sm mt-1">Harvest pricing and RTC readiness</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowForm((v) => !v)}
          className="w-11 h-11 rounded-full bg-emerald-600 items-center justify-center"
        >
          <Feather name={showForm ? 'x' : 'plus'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Add crop form */}
      {showForm && (
        <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
          <Text className="text-slate-900 font-black mb-3">New Crop Entry</Text>
          <TextInput
            value={form.crop}
            onChangeText={(v) => setForm({ ...form, crop: v })}
            placeholder="Crop name (e.g. Tomato)"
            placeholderTextColor="#94a3b8"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
          />
          <TextInput
            value={form.status}
            onChangeText={(v) => setForm({ ...form, status: v })}
            placeholder="Status (e.g. Ready in 12 days)"
            placeholderTextColor="#94a3b8"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
          />
          <TextInput
            value={form.pricePerQtl}
            onChangeText={(v) => setForm({ ...form, pricePerQtl: v })}
            placeholder="Price per quintal (e.g. Rs 1,850/qtl)"
            placeholderTextColor="#94a3b8"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
          />
          <View className="flex-row mb-2">
            <TextInput
              value={form.trend}
              onChangeText={(v) => setForm({ ...form, trend: v })}
              placeholder="Trend (e.g. +8%)"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-1 mr-2"
            />
            <TextInput
              value={form.progress}
              onChangeText={(v) => setForm({ ...form, progress: v })}
              placeholder="Progress %"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 w-28"
            />
          </View>
          <TextInput
            value={form.amount}
            onChangeText={(v) => setForm({ ...form, amount: v })}
            placeholder="Expected sale amount (Rs)"
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3"
          />
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="bg-emerald-600 rounded-xl py-3 items-center"
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-black">Save Crop Entry</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Loading state */}
      {loading ? (
        <View className="items-center py-12">
          <ActivityIndicator color={C.emerald600} size="large" />
          <Text className="text-slate-400 mt-3 text-sm">Loading crop entries…</Text>
        </View>
      ) : rows.length === 0 ? (
        <View className="bg-white rounded-2xl border border-slate-100 p-8 items-center">
          <Feather name="sun" size={36} color="#94a3b8" />
          <Text className="text-slate-500 mt-3 text-sm text-center">
            No crop entries yet.{'\n'}Tap + to add your first entry.
          </Text>
        </View>
      ) : (
        rows.map((row) => (
          <TouchableOpacity
            key={row.id}
            onLongPress={() => handleDelete(row.id)}
            className="bg-white rounded-2xl border border-slate-100 p-4 mb-3"
            activeOpacity={0.8}
          >
            <View className="flex-row justify-between">
              <View>
                <Text className="text-slate-900 font-black text-lg">{row.crop}</Text>
                <Text className="text-slate-500 text-xs mt-1">{row.status}</Text>
              </View>
              <View className="items-end">
                <Text className="text-emerald-700 font-black">{row.pricePerQtl}</Text>
                <Text className="text-emerald-600 text-xs font-bold mt-1">{row.trend}</Text>
              </View>
            </View>
            <View className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
              <View className="h-2 bg-emerald-500 rounded-full" style={{ width: `${row.progress}%` }} />
            </View>
            {row.amount > 0 && (
              <Text className="text-slate-400 text-xs mt-2">
                Expected: Rs {row.amount.toLocaleString('en-IN')}
              </Text>
            )}
            <Text className="text-slate-300 text-[10px] mt-1">Long press to delete</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}
