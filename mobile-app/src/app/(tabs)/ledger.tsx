import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore, useTotals } from '../../store';
import { endpoints } from '../../services/api';
import { C } from '../../constants/colors';
import { useTranslations } from '../../hooks/useTranslations';

const fmt = (n: number) => 'Rs ' + n.toLocaleString('en-IN');

// Profession-specific configurations
const OCCUPATION_CONFIGS = {
  FARMER: {
    title: 'Farmer Ledger',
    subtitle: 'Agricultural Income & Expenses',
    categories: ['Crop Sale', 'Milk Sale', 'Seeds', 'Fertilizer', 'Pesticides', 'Tractor Rent', 'Labour', 'Equipment', 'Others'],
    emojis: {
      'Crop Sale': '🚜',
      'Milk Sale': '🥛',
      'Seeds': '🌾',
      'Fertilizer': '🌱',
      'Pesticides': '🧪',
      'Tractor Rent': '🚜',
      'Labour': '👨‍🌾',
      'Equipment': '🔧',
      'Others': '💰',
    } as Record<string, string>
  },
  SHOP_OWNER: {
    title: 'Shop Ledger',
    subtitle: 'Store Sales & Inventory Expenses',
    categories: ['Grocery Sale', 'Stock Purchase', 'Shop Rent', 'Electricity', 'Helper Salary', 'Customer Udhar', 'Others'],
    emojis: {
      'Grocery Sale': '🛒',
      'Stock Purchase': '📦',
      'Shop Rent': '🏠',
      'Electricity': '⚡',
      'Helper Salary': '💵',
      'Customer Udhar': '📝',
      'Others': '💰',
    } as Record<string, string>
  },
  TAILOR: {
    title: 'Tailor Ledger',
    subtitle: 'Stitching Income & Material Expenses',
    categories: ['Stitching Income', 'Fabric Purchase', 'Thread & Buttons', 'Machine Maintenance', 'Shop Rent', 'Order Advance', 'Others'],
    emojis: {
      'Stitching Income': '🪡',
      'Fabric Purchase': '👗',
      'Thread & Buttons': '🧵',
      'Machine Maintenance': '⚙️',
      'Shop Rent': '🏠',
      'Order Advance': '💰',
      'Others': '💰',
    } as Record<string, string>
  },
  DAILY_WAGE: {
    title: 'Wage Ledger',
    subtitle: 'Daily Earnings & Living Expenses',
    categories: ['Daily Wages', 'Contract Payment', 'Transport', 'Food', 'Tools Maintenance', 'Medical', 'Others'],
    emojis: {
      'Daily Wages': '💸',
      'Contract Payment': '📄',
      'Transport': '🚌',
      'Food': '🍎',
      'Tools Maintenance': '🛠️',
      'Medical': '🏥',
      'Others': '💰',
    } as Record<string, string>
  }
};

export default function LedgerScreen() {
  const router = useRouter();
  const t = useTranslations();
  const occupation = useStore((s) => s.occupation) || 'FARMER';
  const transactions = useStore((s) => s.transactions);
  const setTransactions = useStore((s) => s.setTransactions);
  const { income, expense, savings } = useTotals();

  // Get configuration based on active occupation
  const config = OCCUPATION_CONFIGS[occupation as keyof typeof OCCUPATION_CONFIGS] || OCCUPATION_CONFIGS.FARMER;

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'saving'>('all');
  
  // Modal state for adding a transaction
  const [showAddModal, setShowAddModal] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense' | 'saving'>('income');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState(config.categories[0] || 'Others');
  const [customCategory, setCustomCategory] = useState('');
  const [formNote, setFormNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync category state when occupation changes
  useEffect(() => {
    setFormCategory(config.categories[0] || 'Others');
  }, [occupation]);

  const fetchTransactions = async () => {
    try {
      const res = await endpoints.getTransactions();
      setTransactions(res.data.data);
    } catch (error) {
      console.warn('Failed to fetch transactions', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  // Filtered transactions based on selected tab
  const filteredTx = useMemo(() => {
    if (activeTab === 'all') return transactions;
    return transactions.filter((t) => t.type === activeTab);
  }, [transactions, activeTab]);

  const getEmoji = (category: string) => {
    // Check local config emojis first
    if (config.emojis[category]) return config.emojis[category];
    
    // Check fallback of other configs
    for (const key in OCCUPATION_CONFIGS) {
      const em = OCCUPATION_CONFIGS[key as keyof typeof OCCUPATION_CONFIGS].emojis[category];
      if (em) return em;
    }
    
    return '💰';
  };

  const handleAddTransaction = async () => {
    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number for amount.');
      return;
    }

    const finalCategory = formCategory === 'Custom' ? customCategory.trim() : formCategory;
    if (!finalCategory) {
      Alert.alert('Invalid Category', 'Please select or enter a category.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        amount: amt,
        type: formType,
        category: finalCategory,
        note: formNote.trim(),
        date: new Date().toISOString(),
      };
      
      const res = await endpoints.addTransaction(payload);
      
      if (res.data?.success) {
        // Refresh local store from backend to guarantee complete sync
        await fetchTransactions();
        setShowAddModal(false);
        // Reset form
        setFormAmount('');
        setFormCategory(config.categories[0] || 'Others');
        setCustomCategory('');
        setFormNote('');
      } else {
        Alert.alert('Error', res.data?.message || 'Failed to save transaction');
      }
    } catch (e: any) {
      console.warn(e);
      Alert.alert('Error', e.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to permanently delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const res = await endpoints.deleteTransaction(id);
              if (res.data?.success) {
                // Update local store state
                useStore.getState().removeTransaction(id);
                // Also optionally sync from backend
                await fetchTransactions();
              } else {
                Alert.alert('Error', res.data?.message || 'Failed to delete transaction');
              }
            } catch (e: any) {
              console.warn(e);
              Alert.alert('Error', e.response?.data?.message || 'Failed to delete transaction');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-5 pt-3 pb-2 flex-row justify-between items-center bg-white border-b border-slate-100">
        <View>
          <Text className="text-2xl font-black text-slate-800">{config.title}</Text>
          <Text className="text-xs text-slate-500 font-medium">{config.subtitle}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowAddModal(true)}
          className="bg-emerald-600 px-4 py-2.5 rounded-full flex-row items-center"
          style={{
            shadowColor: C.emerald600,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 3,
          }}
          >
            <Feather name="plus" size={16} color="#fff" />
            <Text className="text-white font-bold ml-1 text-sm">{t.addNew}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.emerald600} />
        }
      >
        {/* Stat Cards Strip */}
        <View className="px-5 mt-4 flex-row gap-3">
          {/* Income Card */}
          <View className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 items-center">
            <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mb-1">
              <Feather name="arrow-down-left" size={16} color={C.emerald600} />
            </View>
            <Text className="text-[10px] font-bold text-slate-400 uppercase">Income</Text>
            <Text className="text-[13px] font-black text-emerald-600 mt-0.5">{fmt(income)}</Text>
          </View>

          {/* Expense Card */}
          <View className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 items-center">
            <View className="w-8 h-8 rounded-full bg-rose-50 items-center justify-center mb-1">
              <Feather name="arrow-up-right" size={16} color={C.rose500} />
            </View>
            <Text className="text-[10px] font-bold text-slate-400 uppercase">Expense</Text>
            <Text className="text-[13px] font-black text-rose-500 mt-0.5">{fmt(expense)}</Text>
          </View>

          {/* Net Savings Card */}
          <View className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 items-center">
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mb-1">
              <Feather name="shield" size={16} color={C.blue500} />
            </View>
            <Text className="text-[10px] font-bold text-slate-400 uppercase">Savings</Text>
            <Text className="text-[13px] font-black text-blue-600 mt-0.5">{fmt(savings)}</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="px-5 mt-5 flex-row">
          {(['all', 'income', 'expense', 'saving'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2 items-center rounded-xl border mr-1.5 ${
                activeTab === tab
                  ? 'bg-slate-900 border-slate-900'
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text
                className={`text-xs font-black capitalize ${
                  activeTab === tab ? 'text-white' : 'text-slate-600'
                }`}
              >
                {tab === 'saving' ? 'Savings' : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions List */}
        <View className="px-5 mt-4">
          <Text className="text-sm font-black text-slate-800 mb-2">
            History ({filteredTx.length})
          </Text>

          {loading && (
            <View className="py-4 items-center">
              <ActivityIndicator color={C.emerald600} />
            </View>
          )}

          {filteredTx.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-100 p-8 items-center justify-center">
              <Text className="text-slate-400 font-bold text-sm">No transactions found</Text>
              <Text className="text-slate-400 text-xs mt-1">{t.addNew} to register a transaction</Text>
            </View>
          ) : (
            <View className="gap-2">
              {filteredTx.map((tx) => {
                const isInc = tx.type === 'income';
                const isSaving = tx.type === 'saving';
                let amtColor = C.rose600;
                let amtPrefix = '- ';
                if (isInc) {
                  amtColor = C.emerald600;
                  amtPrefix = '+ ';
                } else if (isSaving) {
                  amtColor = C.blue500;
                  amtPrefix = '💸 ';
                }

                return (
                  <TouchableOpacity
                    key={tx.id}
                    activeOpacity={0.8}
                    onLongPress={() => handleDeleteTransaction(tx.id)}
                    className="bg-white border border-slate-100 rounded-2xl p-4 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center flex-1 pr-3">
                      <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                        <Text className="text-xl">{getEmoji(tx.category)}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-black text-slate-800" numberOfLines={1}>
                          {tx.category}
                        </Text>
                        {tx.note ? (
                          <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
                            {tx.note}
                          </Text>
                        ) : null}
                        <Text className="text-[10px] text-slate-400 mt-1 font-bold">
                          {new Date(tx.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text style={{ fontSize: 14, fontWeight: '900', color: amtColor }}>
                        {amtPrefix}{fmt(tx.amount)}
                      </Text>
                      <Text className="text-[9px] uppercase font-black tracking-widest text-slate-400 mt-1">
                        {tx.type}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <Text className="text-center text-[10px] text-slate-400 mt-2">
                💡 {t.tipDeleteTransaction}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Transaction Modal */}
      {/* Dynamic depending on occupation configs */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[30px] p-6 max-h-[90%]">
            
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-800">{t.addTransaction}</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Feather name="x" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              
              {/* Transaction Type Selection */}
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.type}</Text>
              <View className="flex-row gap-2 mb-4">
                {(['income', 'expense', 'saving'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setFormType(type);
                      if (type === 'saving') {
                        setFormCategory('Savings');
                      } else {
                        setFormCategory(config.categories[0] || 'Others');
                      }
                    }}
                    className={`flex-1 py-3 items-center rounded-2xl border ${
                      formType === type
                        ? type === 'income'
                          ? 'bg-emerald-50 border-emerald-600'
                          : type === 'saving'
                          ? 'bg-blue-50 border-blue-600'
                          : 'bg-rose-50 border-rose-600'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-black capitalize ${
                        formType === type
                          ? type === 'income'
                            ? 'text-emerald-700'
                            : type === 'saving'
                            ? 'text-blue-700'
                            : 'text-rose-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {type === 'saving' ? 'Savings' : type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount Input */}
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.amount} (Rs)</Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 mb-4">
                <Text className="text-lg font-black text-slate-700 mr-2">₹</Text>
                <TextInput
                  placeholder="Enter Amount"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={formAmount}
                  onChangeText={setFormAmount}
                  className="flex-1 text-slate-900 text-lg font-black"
                />
              </View>

              {/* Category Selection */}
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.category}</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {config.categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setFormCategory(cat)}
                    className={`px-3 py-2 rounded-xl border flex-row items-center ${
                      formCategory === cat ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text className="mr-1.5 text-base">{getEmoji(cat)}</Text>
                    <Text
                      className={`text-xs font-bold ${
                        formCategory === cat ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => setFormCategory('Custom')}
                  className={`px-3 py-2 rounded-xl border flex-row items-center ${
                    formCategory === 'Custom' ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className="mr-1.5 text-base">✏️</Text>
                  <Text
                    className={`text-xs font-bold ${
                      formCategory === 'Custom' ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    Custom Category
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Custom Category Input if Custom is selected */}
              {formCategory === 'Custom' && (
                <View className="mb-4">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Enter Custom Category Name
                  </Text>
                  <TextInput
                    placeholder="e.g. Electric Bill, Fertilizers"
                    placeholderTextColor="#94a3b8"
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-sm font-bold"
                  />
                </View>
              )}

              {/* Note Input */}
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.note} (Optional)</Text>
              <TextInput
                placeholder="Add a brief description..."
                placeholderTextColor="#94a3b8"
                value={formNote}
                onChangeText={setFormNote}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-sm font-bold mb-6"
                multiline
                numberOfLines={2}
              />

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleAddTransaction}
                disabled={isSubmitting}
                className="bg-emerald-600 py-4 rounded-2xl items-center"
                style={{
                  shadowColor: C.emerald600,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-base font-black">{t.saveTransaction}</Text>
                )}
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
