import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { QuestionScaffold } from '../../components/signup/QuestionScaffold';
import { useStore, type OnboardingInputMode, type RepaymentHabit } from '../../store';

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

  const save = () => {
    if (!monthlyIncome || !monthlyExpenses || !shiftDays) {
      Alert.alert('Missing answers', 'Please complete income, expenses and target shift days.');
      return;
    }
    useStore.setState({ monthlyIncome, monthlyExpenses, hasActiveLoans, pastRepaymentHabit: habit, onboardingInputMode: mode });
    useStore.getState().setCustomRoleDetails({ stabilityTags, shiftDays });
    useStore.getState().completeRegistration();
    router.replace('/(tabs)/home');
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
      onSubmit={save}
    />
  );
}
