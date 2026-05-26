import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { QuestionScaffold } from '../../components/signup/QuestionScaffold';
import { useStore, type OnboardingInputMode, type RepaymentHabit } from '../../store';

const habits: RepaymentHabit[] = ['Never Missed', 'Sometimes Delayed', 'Frequently Missed'];

export default function ShopDetails() {
  const router = useRouter();
  const [mode, setMode] = useState<OnboardingInputMode>('TEXT');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [capitalInvestment, setCapitalInvestment] = useState('');
  const [supplierCredit, setSupplierCredit] = useState(true);
  const [inventoryCycle, setInventoryCycle] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [hasActiveLoans, setHasActiveLoans] = useState(false);
  const [habit, setHabit] = useState<RepaymentHabit>('Never Missed');

  const save = () => {
    if (!monthlyIncome || !monthlyExpenses || !capitalInvestment) {
      Alert.alert('Missing answers', 'Please complete income, expenses and capital investment.');
      return;
    }
    useStore.setState({ monthlyIncome, monthlyExpenses, hasActiveLoans, pastRepaymentHabit: habit, onboardingInputMode: mode });
    useStore.getState().setCustomRoleDetails({ capitalInvestment, supplierCredit, inventoryCycle });
    useStore.getState().completeRegistration();
    router.replace('/(tabs)/home');
  };

  return (
    <QuestionScaffold
      title="Shop questions"
      subtitle="Set the starting capital, udhar habit and stock cycle for your shop."
      mode={mode}
      onModeChange={setMode}
      voiceSummary="Ask: monthly sales income, shop expenses, starting capital, supplier credit and stock cycle."
      onVoiceFill={() => {
        setMonthlyIncome('42000');
        setMonthlyExpenses('31000');
        setCapitalInvestment('85000');
        setSupplierCredit(true);
      }}
      fields={[
        { label: 'Monthly income', value: monthlyIncome, placeholder: 'Example: 42000', keyboardType: 'numeric', onChangeText: setMonthlyIncome },
        { label: 'Monthly expenses', value: monthlyExpenses, placeholder: 'Example: 31000', keyboardType: 'numeric', onChangeText: setMonthlyExpenses },
        { label: 'Cash capital', value: capitalInvestment, placeholder: 'Initial investment amount', keyboardType: 'numeric', onChangeText: setCapitalInvestment },
      ]}
      choices={[
        { title: 'Supplier credit', items: [
          { label: 'Available', active: supplierCredit, onPress: () => setSupplierCredit(true) },
          { label: 'Not yet', active: !supplierCredit, onPress: () => setSupplierCredit(false) },
        ] },
        { title: 'Inventory cycle', items: [
          { label: 'Weekly', active: inventoryCycle === 'Weekly', onPress: () => setInventoryCycle('Weekly') },
          { label: 'Monthly', active: inventoryCycle === 'Monthly', onPress: () => setInventoryCycle('Monthly') },
        ] },
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
