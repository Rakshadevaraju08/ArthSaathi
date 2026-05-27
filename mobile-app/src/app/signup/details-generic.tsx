import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { isAxiosError } from 'axios';

import { QuestionScaffold } from '../../components/signup/QuestionScaffold';
import { useStore, type OnboardingInputMode, type RepaymentHabit } from '../../store';
import { endpoints } from '../../services/api';
import { setToken } from '../../services/auth';

const habits: RepaymentHabit[] = ['Never Missed', 'Sometimes Delayed', 'Frequently Missed'];
const tags = ['Same employer', 'Seasonal work', 'Multiple sites', 'Weekly cash'];

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
      useStore.getState().setCustomRoleDetails({ stabilityTags, shiftDays });
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
