import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { isAxiosError } from 'axios';

import { QuestionScaffold } from '../../components/signup/QuestionScaffold';
import { useStore, type OnboardingInputMode, type RepaymentHabit } from '../../store';
import { endpoints } from '../../services/api';
import { setToken } from '../../services/auth';

const langMap: Record<string, string> = { English: 'en', Hindi: 'hi', Kannada: 'kn' };
const crops = ['Tomato', 'Ragi', 'Sugarcane', 'Cotton', 'Onion', 'Paddy'];
const habits: RepaymentHabit[] = ['Never Missed', 'Sometimes Delayed', 'Frequently Missed'];

const repaymentMap: Record<RepaymentHabit, string> = {
  'Never Missed': 'always_on_time',
  'Sometimes Delayed': 'sometimes_late',
  'Frequently Missed': 'often_late',
};

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

      // Step 1: Register the user account
      const registerResponse = await endpoints.register({
        name: state.fullName.trim(),
        phone: state.mobileNumber.trim(),
        password: state.password,
        language: langMap[state.preferredLanguage] || 'en',
        village: 'Not specified',
        district: 'Not specified',
      });

      const payload = registerResponse.data?.data;
      if (!payload?.token || !payload?.user) {
        throw new Error('Invalid registration response from server.');
      }

      // Step 2: Save token immediately so the next API call is authenticated
      await setToken(payload.token);
      useStore.setState({ token: payload.token });

      // Step 3: Create farmer profile on the backend
      const totalInputCost = String(
        (parseFloat(seedSpend) || 0) + (parseFloat(fertilizerSpend) || 0)
      );

      await endpoints.createFarmerProfile({
        occupation: 'farmer',
        monthlyIncome,
        monthlyExpenses,
        crops: selectedCrops,
        inputCost: totalInputCost,
        repaymentHabit: repaymentMap[habit],
        hasActiveLoans,
      });

      // Step 4: Sync to Zustand store
      useStore.setState({
        onboardingInputMode: mode,
        token: payload.token,
        user: payload.user,
        occupation: 'FARMER',
      });
      useStore.getState().completeRegistration();

      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Farmer Signup Error:', isAxiosError(error) ? error.response?.data : error);

      const message = isAxiosError(error)
        ? error.response?.data?.message || JSON.stringify(error.response?.data?.errors) || 'Signup failed.'
        : error instanceof Error ? error.message : 'Signup failed. Please try again.';
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