import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { isAxiosError } from 'axios';

import { QuestionScaffold } from '../../components/signup/QuestionScaffold';
import { useStore, type OnboardingInputMode, type RepaymentHabit } from '../../store';
import { endpoints } from '../../services/api';
import { setToken } from '../../services/auth';

const langMap: Record<string, string> = { English: 'en', Hindi: 'hi', Kannada: 'kn' };
const habits: RepaymentHabit[] = ['Never Missed', 'Sometimes Delayed', 'Frequently Missed'];

const repaymentMap: Record<RepaymentHabit, string> = {
  'Never Missed': 'always_on_time',
  'Sometimes Delayed': 'sometimes_late',
  'Frequently Missed': 'often_late',
};

export default function TailorDetails() {
  const router = useRouter();
  const [mode, setMode] = useState<OnboardingInputMode>('TEXT');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [machineCount, setMachineCount] = useState('');
  const [weeklyCapacity, setWeeklyCapacity] = useState('');
  const [hasActiveLoans, setHasActiveLoans] = useState(false);
  const [habit, setHabit] = useState<RepaymentHabit>('Never Missed');
  const [submitting, setSubmitting] = useState(false);

  const save = async () => {
    if (!monthlyIncome || !monthlyExpenses || !machineCount || !weeklyCapacity) {
      Alert.alert('Missing answers', 'Please complete income, expenses, machine count and weekly capacity.');
      return;
    }
    try {
      setSubmitting(true);
      const state = useStore.getState();

      // Step 1: Register user account
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

      // Step 2: Save token immediately
      await setToken(payload.token);
      useStore.setState({ token: payload.token });

      // Step 3: Create tailor profile on backend
      await endpoints.createTailorProfile({
        occupation: 'tailor',
        monthlyIncome,
        monthlyExpenses,
        machineryCount: machineCount,
        weeklyStitchCapacity: weeklyCapacity,
        repaymentHabit: repaymentMap[habit],
        hasActiveLoans,
      });

      // Step 4: Sync to Zustand store
      useStore.setState({
        onboardingInputMode: mode,
        token: payload.token,
        user: payload.user,
        occupation: 'TAILOR',
      });
      useStore.getState().completeRegistration();

      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Tailor Signup Error:', isAxiosError(error) ? error.response?.data : error);

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
      title="Tailor questions"
      subtitle="Capture machine strength and weekly order capacity."
      mode={mode}
      onModeChange={setMode}
      voiceSummary="Ask: monthly stitching income, cloth expenses, machine count and maximum weekly orders."
      onVoiceFill={() => {
        setMonthlyIncome('32000');
        setMonthlyExpenses('18500');
        setMachineCount('3');
        setWeeklyCapacity('28');
      }}
      fields={[
        { label: 'Monthly income', value: monthlyIncome, placeholder: 'Example: 32000', keyboardType: 'numeric', onChangeText: setMonthlyIncome },
        { label: 'Monthly expenses', value: monthlyExpenses, placeholder: 'Example: 18500', keyboardType: 'numeric', onChangeText: setMonthlyExpenses },
        { label: 'Machine count', value: machineCount, placeholder: 'Sewing machine count', keyboardType: 'numeric', onChangeText: setMachineCount },
        { label: 'Weekly orders', value: weeklyCapacity, placeholder: 'Max garments per week', keyboardType: 'numeric', onChangeText: setWeeklyCapacity },
      ]}
      choices={[
        { title: 'Active loans', items: [
          { label: 'No', active: !hasActiveLoans, onPress: () => setHasActiveLoans(false) },
          { label: 'Yes', active: hasActiveLoans, onPress: () => setHasActiveLoans(true) },
        ] },
        { title: 'Repayment habit', items: habits.map((item) => ({ label: item, active: habit === item, onPress: () => setHabit(item) })) },
      ]}
      submitLabel={submitting ? 'Creating account...' : 'Continue to Dashboard'}
      submitDisabled={submitting}
      onSubmit={save}
    />
  );
}