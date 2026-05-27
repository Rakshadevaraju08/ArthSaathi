import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { QuestionScaffold } from '../../components/signup/QuestionScaffold';
import { useStore, type OnboardingInputMode, type RepaymentHabit } from '../../store';

const habits: RepaymentHabit[] = ['Never Missed', 'Sometimes Delayed', 'Frequently Missed'];

export default function TailorDetails() {
  const router = useRouter();
  const [mode, setMode] = useState<OnboardingInputMode>('TEXT');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [machineCount, setMachineCount] = useState('');
  const [weeklyCapacity, setWeeklyCapacity] = useState('');
  const [hasActiveLoans, setHasActiveLoans] = useState(false);
  const [habit, setHabit] = useState<RepaymentHabit>('Never Missed');

  const save = () => {
    if (!monthlyIncome || !monthlyExpenses || !machineCount || !weeklyCapacity) {
      Alert.alert('Missing answers', 'Please complete income, expenses, machine count and weekly capacity.');
      return;
    }
    useStore.setState({ monthlyIncome, monthlyExpenses, hasActiveLoans, pastRepaymentHabit: habit, onboardingInputMode: mode });
    useStore.getState().setCustomRoleDetails({ machineCount, weeklyCapacity });
    useStore.getState().completeRegistration();
    router.replace('/(tabs)/home');
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
      onSubmit={save}
    />
  );
}
