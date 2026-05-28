import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { C } from '../../constants/colors';

const { width: SW } = Dimensions.get('window');
const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

// ── Animated Arc Score Ring ──────────────────────────────────────
const RING_SIZE = 160;
const STROKE = 14;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUM = 2 * Math.PI * RADIUS;

function ArthScoreRing({ score, max = 1000 }: { score: number; max?: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score / max,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score]);

  // Score determines color
  const pct = score / max;
  const ringColor = pct > 0.7 ? C.emerald500 : pct > 0.45 ? C.amber500 : C.rose500;
  const label =
    pct > 0.7 ? 'EXCELLENT' : pct > 0.55 ? 'GOOD' : pct > 0.4 ? 'FAIR' : 'POOR';
  const labelColor = pct > 0.7 ? C.emerald600 : pct > 0.45 ? C.amber600 : C.rose600;
  const labelBg = pct > 0.7 ? C.emerald50 : pct > 0.45 ? '#fffbeb' : '#fff1f2';

  return (
    <View style={styles.ringWrap}>
      {/* SVG-like ring via border trick + Animated */}
      <View style={[styles.ringOuter, { borderColor: '#e2e8f0' }]}>
        <AnimatedArcFill anim={anim} color={ringColor} />
        <View style={styles.ringInner}>
          <Text style={styles.ringScore}>{score}</Text>
          <Text style={styles.ringMax}>/{max}</Text>
          <View style={[styles.ringBadge, { backgroundColor: labelBg }]}>
            <Text style={[styles.ringBadgeText, { color: labelColor }]}>{label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function AnimatedArcFill({
  anim,
  color,
}: {
  anim: Animated.Value;
  color: string;
}) {
  // We achieve the arc using a clipped rotating half-disk approach
  // using two halves: left half always visible, right half clips at 50%
  const rotateLeft = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '180deg'],
    extrapolate: 'clamp',
  });
  const rotateRight = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-180deg', '0deg', '180deg'],
    extrapolate: 'clamp',
  });
  const rightOpacity = anim.interpolate({
    inputRange: [0, 0.01, 1],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });

  const s = RING_SIZE;
  const half = s / 2;

  return (
    <View
      style={{
        position: 'absolute',
        width: s,
        height: s,
        borderRadius: s / 2,
      }}
    >
      {/* Right half sector */}
      <Animated.View
        style={{
          position: 'absolute',
          width: half,
          height: s,
          left: half,
          overflow: 'hidden',
          opacity: rightOpacity,
        }}
      >
        <Animated.View
          style={{
            width: s,
            height: s,
            borderRadius: s / 2,
            borderWidth: STROKE,
            borderColor: color,
            position: 'absolute',
            left: -half,
            transform: [{ rotate: rotateRight }],
            transformOrigin: `${half}px ${half}px`,
          }}
        />
      </Animated.View>

      {/* Left half sector */}
      <View
        style={{
          position: 'absolute',
          width: half,
          height: s,
          left: 0,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            width: s,
            height: s,
            borderRadius: s / 2,
            borderWidth: STROKE,
            borderColor: color,
            position: 'absolute',
            left: 0,
            transform: [{ rotate: rotateLeft }],
            transformOrigin: `${half}px ${half}px`,
          }}
        />
      </View>
    </View>
  );
}

// ── Repayment Forecast Bar Chart ─────────────────────────────────
function RepaymentChart({
  emi,
  income,
  months,
}: {
  emi: number;
  income: number;
  months: number;
}) {
  const bars = Array.from({ length: Math.min(months, 8) }, (_, i) => ({
    month: `M${i + 1}`,
    emi,
    income,
  }));

  const maxVal = Math.max(income, emi) * 1.1;
  const barW = (SW - 80) / bars.length - 6;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 90 }}>
        {bars.map((b, i) => (
          <View key={i} style={{ alignItems: 'center', flex: 1 }}>
            {/* Income bar (taller, background) */}
            <View
              style={{
                width: barW,
                height: (b.income / maxVal) * 80,
                backgroundColor: `${C.emerald400}55`,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                position: 'absolute',
                bottom: 0,
              }}
            />
            {/* EMI bar (foreground) */}
            <View
              style={{
                width: barW * 0.6,
                height: (b.emi / maxVal) * 80,
                backgroundColor: C.teal600,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                position: 'absolute',
                bottom: 0,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
        {bars.map((b, i) => (
          <Text
            key={i}
            style={{ flex: 1, textAlign: 'center', fontSize: 9, color: C.slate400 }}
          >
            {b.month}
          </Text>
        ))}
      </View>
      {/* Legend */}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View
            style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: `${C.emerald400}55` }}
          />
          <Text style={{ fontSize: 11, color: C.slate500 }}>Monthly Income</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View
            style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: C.teal600 }}
          />
          <Text style={{ fontSize: 11, color: C.slate500 }}>EMI</Text>
        </View>
      </View>
    </View>
  );
}

// ── Recommended Product Card ─────────────────────────────────────
function ProductCard({
  icon,
  name,
  rate,
  upto,
  tag,
  url,
}: {
  icon: string;
  name: string;
  rate: string;
  upto: string;
  tag?: string;
  url?: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => url && Linking.openURL(url)}
      style={styles.productCard}
    >
      <LinearGradient
        colors={['#f0fdf4', '#ecfdf5']}
        style={styles.productCardGradient}
      >
        <View style={styles.productLeft}>
          <Text style={{ fontSize: 28 }}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{name}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <View style={styles.productBadge}>
                <Text style={styles.productBadgeText}>🏷 {rate}</Text>
              </View>
              <View style={[styles.productBadge, { backgroundColor: '#eff6ff' }]}>
                <Text style={[styles.productBadgeText, { color: C.blue600 }]}>
                  Upto {upto}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.applyBtn}>
          <Text style={styles.applyBtnText}>Apply</Text>
          <Feather name="arrow-right" size={13} color={C.emerald700} />
        </View>
      </LinearGradient>
      {tag && (
        <View style={styles.productTag}>
          <Text style={styles.productTagText}>{tag}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Main Screen ──────────────────────────────────────────────────
export default function LoanResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    score: string;
    emi: string;
    total: string;
    eligible: string;
    tenure: string;
    interest: string;
    income: string;
    risk: string;
    purpose: string;
  }>();

  const score = Number(params.score ?? 742);
  const emi = Number(params.emi ?? 2800);
  const total = Number(params.total ?? 50400);
  const eligible = Number(params.eligible ?? 45000);
  const tenure = Number(params.tenure ?? 18);
  const interest = Number(params.interest ?? 11.5);
  const income = Number(params.income ?? 12000);
  const risk = (params.risk ?? 'safe') as 'safe' | 'moderate' | 'high';
  const purpose = params.purpose ?? 'Working capital';

  const riskLabel =
    risk === 'safe' ? 'Low Risk Borrower' : risk === 'moderate' ? 'Moderate Risk' : 'High Risk';
  const riskColor =
    risk === 'safe' ? C.emerald600 : risk === 'moderate' ? C.amber600 : C.rose600;
  const riskBg =
    risk === 'safe' ? C.emerald50 : risk === 'moderate' ? '#fffbeb' : '#fff1f2';

  const scoreFactors = [
    { ok: true, label: 'Regular transactions recorded' },
    { ok: true, label: 'No existing defaults' },
    { ok: true, label: 'Land collateral available (RTC)' },
    { ok: true, label: '6+ months app history' },
    { ok: false, label: 'Irregular income in past months' },
    { ok: false, label: 'High expense-to-income ratio' },
  ];

  const riskFactors = [
    'Seasonal income — 3 low income months per year',
    'No formal credit bureau history',
  ];

  // Animated entrance
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[C.emerald600, C.teal600]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>ArthScore</Text>
          <Text style={styles.headerSub}>Your Loan Eligibility Report</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* ── Score Card ── */}
          <View style={styles.scoreCard}>
            <ArthScoreRing score={score} />
            <View style={[styles.riskPill, { backgroundColor: riskBg }]}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: riskColor,
                  marginRight: 6,
                }}
              />
              <Text style={[styles.riskPillText, { color: riskColor }]}>
                {riskLabel}
              </Text>
            </View>
            <Text style={styles.scoreCaption}>
              Based on your income, expenses & repayment habits
            </Text>
          </View>

          {/* ── Loan Summary ── */}
          <SectionCard title="📋 Loan Summary">
            <SummaryRow icon="✅" label="Eligible Amount" value={fmt(eligible)} valueColor={C.emerald600} />
            <SummaryRow icon="📅" label="Best Tenure" value={`${tenure} months`} />
            <SummaryRow icon="💰" label="Monthly EMI" value={fmt(emi)} />
            <SummaryRow icon="📊" label="Interest Rate" value={`~${interest}%`} />
            <SummaryRow icon="💸" label="Total Payable" value={fmt(total)} valueColor={C.rose600} />
          </SectionCard>

          {/* ── Repayment Forecast ── */}
          <SectionCard title="📈 Repayment Forecast">
            <Text style={styles.forecastNote}>
              Monthly EMI vs. Income over loan tenure
            </Text>
            <RepaymentChart emi={emi} income={income} months={tenure} />
          </SectionCard>

          {/* ── Why This Score ── */}
          <SectionCard title="🧠 Why This Score?">
            {scoreFactors.map((f, i) => (
              <View key={i} style={styles.factorRow}>
                <Text style={{ fontSize: 15, marginRight: 8 }}>
                  {f.ok ? '✅' : '⚠️'}
                </Text>
                <Text
                  style={[
                    styles.factorText,
                    { color: f.ok ? C.slate700 : C.amber600 },
                  ]}
                >
                  {f.label}
                </Text>
              </View>
            ))}
          </SectionCard>

          {/* ── Risk Factors ── */}
          <SectionCard title="⚠️ Risk Factors">
            {riskFactors.map((r, i) => (
              <View key={i} style={styles.riskRow}>
                <View style={styles.riskDot} />
                <Text style={styles.riskText}>{r}</Text>
              </View>
            ))}
          </SectionCard>

          {/* ── Recommended Products ── */}
          <SectionCard title="🏦 Recommended Products">
            <ProductCard
              icon="🏛"
              name="SBI Kisan Credit Card"
              rate="7% p.a."
              upto="₹3L"
              tag="Best Rate"
              url="https://sbi.co.in"
            />
            <ProductCard
              icon="🌾"
              name="NABARD Farm Loan"
              rate="9% p.a."
              upto="₹5L"
              url="https://nabard.org"
            />
            <ProductCard
              icon="🤝"
              name="Grameen MFI Loan"
              rate="14% p.a."
              upto="₹1L"
              url="https://nabard.org"
            />
          </SectionCard>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Helper sub-components ────────────────────────────────────────
function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionDivider} />
      {children}
    </View>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  // Score ring
  ringWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: STROKE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringInner: {
    alignItems: 'center',
  },
  ringScore: {
    fontSize: 34,
    fontWeight: '900',
    color: C.slate900,
    lineHeight: 38,
  },
  ringMax: {
    fontSize: 13,
    fontWeight: '600',
    color: C.slate400,
  },
  ringBadge: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  ringBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  scoreCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  riskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  riskPillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  scoreCaption: {
    fontSize: 12,
    color: C.slate400,
    textAlign: 'center',
  },

  sectionCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: C.slate900,
    marginBottom: 10,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  summaryIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 22,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 13,
    color: C.slate600,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '900',
    color: C.slate900,
  },

  forecastNote: {
    fontSize: 12,
    color: C.slate400,
    marginBottom: 12,
  },

  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  factorText: {
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },

  riskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.amber500,
    marginTop: 5,
    marginRight: 10,
  },
  riskText: {
    flex: 1,
    fontSize: 13,
    color: C.slate700,
    lineHeight: 19,
  },

  productCard: {
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  productCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  productLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: C.slate900,
  },
  productBadge: {
    backgroundColor: '#ecfdf5',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  productBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.emerald700,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: C.emerald700,
  },
  productTag: {
    position: 'absolute',
    top: 8,
    right: 80,
    backgroundColor: C.amber400,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  productTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
  },
});
