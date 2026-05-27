import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { isAxiosError } from 'axios';

import { QuestionScaffold } from '../../components/signup/QuestionScaffold';
import { useStore, type OnboardingInputMode, type RepaymentHabit } from '../../store';
import { endpoints } from '../../services/api';
import { setToken } from '../../services/auth';

const crops = ['Tomato', 'Ragi', 'Sugarcane', 'Cotton', 'Onion', 'Paddy'];
const habits: RepaymentHabit[] = ['Never Missed', 'Sometimes Delayed', 'Frequently Missed'];

export default function FarmerDetails() {
  const router = useRouter();
  const [mode, setMode] = useState<OnboardingInputMode>('TEXT');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [seedSpend, setSeedSpend] = useState('');
  const [fertilizerSpend, setFertilizerSpend] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Tomato']);
  const [hasActiveLoans, setHasActiveLoans] = useState(false);
  const [habit, setHabit] = useState<RepaymentHabit>('Never Missed');
  const [submitting, setSubmitting] = useState(false);

  const save = async () => {
    if (!monthlyIncome || !monthlyExpenses || !seedSpend || !fertilizerSpend) {
      Alert.alert('Missing answers', 'Please complete income, expenses and input costs.');
      return;
    }
    try {
      setSubmitting(true);
      const state = useStore.getState();
      const languageMap = {
        English: 'en',
        Hindi: 'hi',
        Kannada: 'kn',
        Marathi: 'mr',
        Tamil: 'ta',
        Telugu: 'te',
      } as const;

      const response = await endpoints.register({
        name: state.fullName.trim(),
        phone: state.mobileNumber.trim(),
        password: state.password,
        language: languageMap[state.preferredLanguage] ?? 'en',
      });

      const payload = response.data?.data;
      if (!payload?.token || !payload?.user) {
        throw new Error('Invalid registration response from server.');
      }

      await setToken(payload.token);

      useStore.setState({
        monthlyIncome,
        monthlyExpenses,
        hasActiveLoans,
        pastRepaymentHabit: habit,
        onboardingInputMode: mode,
        token: payload.token,
        user: payload.user,
      });
      useStore.getState().setCustomRoleDetails({
        crops: selectedCrops,
        seedSpend,
        fertilizerSpend,
        rtcScanStatus: 'Simulated OCR Pass',
      });
      useStore.getState().completeRegistration();
      router.replace('/(tabs)/home');
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message || 'Signup failed. Please try again.'
        : 'Signup failed. Please try again.';
      Alert.alert('Registration failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <QuestionScaffold
      title="Farm questions"
      subtitle="Answer by typing or use voice mode to fill farm details quickly."
      mode={mode}
      onModeChange={setMode}
      voiceSummary="Ask: monthly income, monthly expenses, main crops, seed cost, fertilizer cost and loan habit."
      onVoiceFill={() => {
        setMonthlyIncome('28000');
        setMonthlyExpenses('16500');
        setSeedSpend('2400');
        setFertilizerSpend('3800');
        setSelectedCrops(['Tomato', 'Onion']);
      }}
      fields={[
        { label: 'Monthly income', value: monthlyIncome, placeholder: 'Example: 28000', keyboardType: 'numeric', onChangeText: setMonthlyIncome },
        { label: 'Monthly expenses', value: monthlyExpenses, placeholder: 'Example: 16500', keyboardType: 'numeric', onChangeText: setMonthlyExpenses },
        { label: 'Seed spending', value: seedSpend, placeholder: 'Monthly seed cost', keyboardType: 'numeric', onChangeText: setSeedSpend },
        { label: 'Fertilizer spending', value: fertilizerSpend, placeholder: 'Monthly fertilizer cost', keyboardType: 'numeric', onChangeText: setFertilizerSpend },
      ]}
      choices={[
        {
          title: 'Primary crops',
          items: crops.map((crop) => ({
            label: crop,
            active: selectedCrops.includes(crop),
            onPress: () =>
              setSelectedCrops((current) =>
                current.includes(crop) ? current.filter((item) => item !== crop) : [...current, crop]
              ),
          })),
        },
        {
          title: 'Active loans',
          items: [
            { label: 'No', active: !hasActiveLoans, onPress: () => setHasActiveLoans(false) },
            { label: 'Yes', active: hasActiveLoans, onPress: () => setHasActiveLoans(true) },
          ],
        },
        {
          title: 'Repayment habit',
          items: habits.map((item) => ({ label: item, active: habit === item, onPress: () => setHabit(item) })),
        },
      ]}
      submitLabel={submitting ? 'Creating account...' : 'Continue to Dashboard'}
      submitDisabled={submitting}
      onSubmit={save}
    />
  );
}
