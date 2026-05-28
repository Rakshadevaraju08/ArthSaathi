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
const tags = ['Same employer', 'Seasonal work', 'Multiple sites', 'Weekly cash'];

const repaymentMap: Record<RepaymentHabit, string> = {
  'Never Missed': 'always_on_time',
  'Sometimes Delayed': 'sometimes_late',
  'Frequently Missed': 'often_late',
};

const stabilityMap: Record<string, string> = {
  'Same employer': 'stable',
  'Seasonal work': 'seasonal',
  'Multiple sites': 'irregular',
  'Weekly cash': 'irregular',
};

export default function GenericDetails() {
  const router = useRouter();
  const [mode, setMode] = useState<OnboardingInputMode>('TEXT');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [shiftDays, setShiftDays] = useState('');
  const [stabilityTags, setStabilityTags] = useState<string[]>(['Weekly cash']);
  const [hasActiveLoans, setHasActiveLoans] = useState(false);
  const [habit, setHabit] = useState<RepaymentHabit>('Never Missed');
  const [submitting, setSubmitting] = useState(false);

  const save = async () => {
    if (!monthlyIncome || !monthlyExpenses || !shiftDays) {
      Alert.alert('Missing answers', 'Please complete income, expenses and target shift days.');
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

      // Derive stability from tags
      const employmentStability = stabilityTags.includes('Same employer')
        ? 'stable'
        : stabilityTags.includes('Seasonal work')
          ? 'seasonal'
          : 'irregular';

      // Step 3: Create generic profile on backend
      await endpoints.createGenericProfile({
        occupation: 'daily_wage_worker',
        monthlyIncome,
        monthlyExpenses,
        workingDaysPerMonth: shiftDays,
        employmentStability,
        repaymentHabit: repaymentMap[habit],
        hasActiveLoans,
      });

      // Step 4: Sync to Zustand store
      useStore.setState({
        onboardingInputMode: mode,
        token: payload.token,
        user: payload.user,
        occupation: 'DAILY_WAGE',
      });
      useStore.getState().completeRegistration();

      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Wage Signup Error:', isAxiosError(error) ? error.response?.data : error);

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
      title="Work questions"
      subtitle="Track daily wage work, shift days and payment pattern."
      mode={mode}
      onModeChange={setMode}
      voiceSummary="Ask: monthly wage income, monthly expenses, shift days and job stability."
      onVoiceFill={() => {
        setMonthlyIncome('24000');
        setMonthlyExpenses('15200');
        setShiftDays('24');
        setStabilityTags(['Same employer', 'Weekly cash']);
      }}
      fields={[
        { label: 'Monthly income', value: monthlyIncome, placeholder: 'Example: 24000', keyboardType: 'numeric', onChangeText: setMonthlyIncome },
        { label: 'Monthly expenses', value: monthlyExpenses, placeholder: 'Example: 15200', keyboardType: 'numeric', onChangeText: setMonthlyExpenses },
        { label: 'Shift days', value: shiftDays, placeholder: 'Target work days per month', keyboardType: 'numeric', onChangeText: setShiftDays },
      ]}
      choices={[
        { title: 'Work stability', items: tags.map((tag) => ({
          label: tag,
          active: stabilityTags.includes(tag),
          onPress: () =>
            setStabilityTags((current) =>
              current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
            ),
        })) },
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