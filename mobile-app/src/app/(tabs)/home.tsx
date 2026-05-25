import React, { useMemo } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useStore, useTotals } from '../../store';
import { HealthScoreRing } from '../../components/home/HealthScoreRing';
import { endpoints } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { C } from '../../constants/colors';

const fmt = (n: number) => 'Rs ' + n.toLocaleString('en-IN');

// ── Matching Kotlin bar chart exactly ─────────────────────────
function MiniBarChart({ data }: { data: { m: string; v: number }[] }) {
  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <View style={{ height: 110 }} className="flex-row items-end justify-between">
      {data.map((d) => (
        <View key={d.m} className="flex-1 items-center">
          <View
            style={{
              width: 16,
              height: Math.max(8, (d.v / max) * 90),
              backgroundColor: C.emerald500,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          />
          <Text className="text-[11px] font-bold text-slate-600 mt-1.5">{d.m}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router   = useRouter();
  const { income, expense, savings, score } = useTotals();
  const transactions = useStore((s) => s.transactions);
  const setTransactions = useStore((s) => s.setTransactions);
  const unread = useStore((s) => s.notifications.filter((n) => !n.read).length);
  const user = useStore((s: any) => s.user);
  const [refreshing, setRefreshing] = React.useState(false);

  const locationStr = [user?.village, user?.district].filter(Boolean).join(', ') || 'Location not set';
  const displayName = user?.name || 'User';

  const fetchTransactions = async () => {
    try {
      const res = await endpoints.getTransactions();
      setTransactions(res.data.data);
    } catch (error) {
      console.warn('Failed to fetch transactions', error);
    }
  };

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  // Calculate real monthly spending dynamically from backend data
  const monthly = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const monthTx = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return tx.type === 'expense' && txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
      });
      const total = monthTx.reduce((sum, tx) => sum + tx.amount, 0);
      result.push({ m: monthName, v: total });
    }
    return result;
  }, [transactions]);

  const recentTx = transactions.slice(0, 3);
  const eligible = Math.max(10000, Math.round((savings * 6) / 1000) * 1000);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.emerald500} />
        }
      >
        {/* ── Header gradient — Kotlin rounded bottom corners ── */}
        <LinearGradient
          colors={[C.emerald600, C.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 28,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
      {/* Header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', lineHeight: 28 }}>
            Namaste, {displayName}
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' }}>
            📍 {locationStr}
          </Text>
        </View>

        <TouchableOpacity 
          activeOpacity={0.85}
          onPress={() => router.push('../alerts')} 
          style={{ width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
        >
          <Feather name="bell" size={20} color="#fff" />
          {unread > 0 && (
            <View style={{ position: 'absolute', top: 10, right: 12, width: 8, height: 8, backgroundColor: C.rose500, borderRadius: 4 }} />
          )}
        </TouchableOpacity>
      </View>

          {/* Health score card — white/15 glass */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <HealthScoreRing score={score} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ecfdf5' }}>
                Financial Health
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff', marginTop: 2 }}>
                {score > 70 ? '✅ Excellent' : score > 40 ? '⚠️ Good' : '🔴 Needs attention'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Stat cards — Kotlin StatCardItem style ── */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 16 }}>
          {/* Income */}
          <View
            style={{
              flex: 1, backgroundColor: '#fff', borderRadius: 16,
              padding: 12,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
            }}
          >
            <View
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: `${C.emerald500}1A`,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Feather name="trending-up" size={18} color={C.emerald500} />
            </View>
            <Text style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold' }}>Income</Text>
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#0f172a', marginTop: 2 }}>
              {fmt(income)}
            </Text>
          </View>

          {/* Expense */}
          <View
            style={{
              flex: 1, backgroundColor: '#fff', borderRadius: 16,
              padding: 12,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
            }}
          >
            <View
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: `${C.rose500}1A`,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Feather name="trending-down" size={18} color={C.rose500} />
            </View>
            <Text style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold' }}>Expense</Text>
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#0f172a', marginTop: 2 }}>
              {fmt(expense)}
            </Text>
          </View>

          {/* Savings */}
          <View
            style={{
              flex: 1, backgroundColor: '#fff', borderRadius: 16,
              padding: 12,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
            }}
          >
            <View
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: `${C.blue500}1A`,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Ionicons name="wallet-outline" size={18} color={C.blue500} />
            </View>
            <Text style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold' }}>Savings</Text>
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#0f172a', marginTop: 2 }}>
              {fmt(savings)}
            </Text>
          </View>
        </View>

        {/* ── Loan eligibility — Kotlin style ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/screens/loan')}
          style={{ marginHorizontal: 20, marginTop: 12 }}
        >
          <View
            style={{
              backgroundColor: '#ecfdf5',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: C.emerald600 }}>
                🏦 Loan up to {fmt(eligible)}
              </Text>
              <Text style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                Low interest agricultural scheme
              </Text>
            </View>
            <View
              style={{
                backgroundColor: C.emerald600,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                Check →
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Quick Services 2×2 grid — exactly like Kotlin ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e293b', marginBottom: 12 }}>
            Quick Services
          </Text>

          {/* Row 1 */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            {/* Add Transaction */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/ledger')}
              style={{ flex: 1 }}
            >
              <View
                style={{
                  backgroundColor: '#fff', borderRadius: 14, padding: 14,
                  flexDirection: 'row', alignItems: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: `${C.emerald500}1F`,
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <Feather name="plus" size={20} color={C.emerald500} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#1e293b', lineHeight: 16 }}>
                  Add{'\n'}Transaction
                </Text>
              </View>
            </TouchableOpacity>

            {/* Loan Risk */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/screens/loan')}
              style={{ flex: 1 }}
            >
              <View
                style={{
                  backgroundColor: '#fff', borderRadius: 14, padding: 14,
                  flexDirection: 'row', alignItems: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: `${C.blue500}1F`,
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={C.blue500} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#1e293b', lineHeight: 16 }}>
                  Loan{'\n'}Risk Check
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Scam Check */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/screens/scam')}
              style={{ flex: 1 }}
            >
              <View
                style={{
                  backgroundColor: '#fff', borderRadius: 14, padding: 14,
                  flexDirection: 'row', alignItems: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: `${C.rose500}1F`,
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <MaterialIcons name="security" size={20} color={C.rose500} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#1e293b', lineHeight: 16 }}>
                  Scam{'\n'}Checker
                </Text>
              </View>
            </TouchableOpacity>

            {/* RTC OCR */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/screens/rtc')}
              style={{ flex: 1 }}
            >
              <View
                style={{
                  backgroundColor: '#fff', borderRadius: 14, padding: 14,
                  flexDirection: 'row', alignItems: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: `${C.amber600}1F`,
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <MaterialIcons name="upload-file" size={20} color={C.amber600} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#1e293b', lineHeight: 16 }}>
                  RTC{'\n'}Land Record
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Monthly Spending — Kotlin white card with bars ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#1e293b', marginBottom: 14 }}>
              Monthly Spending Trends
            </Text>
            <MiniBarChart data={monthly} />
          </View>
        </View>

        {/* ── Recent Transactions ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e293b' }}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/ledger')}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.emerald600 }}>See all →</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 8 }}>
            {recentTx.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#64748b', fontSize: 14 }}>No recorded transactions</Text>
              </View>
            ) : (
              recentTx.map((tx) => {
                const isInc = tx.type === 'income';
                return (
                  <View
                    key={tx.id}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
                    }}
                  >
                    {/* Left: emoji + info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View
                        style={{
                          width: 40, height: 40, borderRadius: 20,
                          backgroundColor: '#f1f5f9',
                          alignItems: 'center', justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>
                          {tx.category === 'Fertilizer' ? '🌱'
                            : tx.category === 'Milk Sale' ? '🥛'
                            : tx.category === 'Seeds' ? '🌾'
                            : tx.category === 'Labour' ? '👨‍🌾'
                            : tx.category === 'Crop Sale' ? '🚜'
                            : tx.category === 'Food' ? '🍎'
                            : '💰'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b' }}
                          numberOfLines={1}
                        >
                          {tx.category}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748b', marginTop: 1 }} numberOfLines={1}>
                          {tx.note}
                        </Text>
                      </View>
                    </View>

                    {/* Right: amount */}
                    <Text
                      style={{
                        fontSize: 15, fontWeight: '900',
                        color: isInc ? C.emerald600 : C.rose600,
                      }}
                    >
                      {isInc ? '+ ' : '- '}{fmt(tx.amount)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}