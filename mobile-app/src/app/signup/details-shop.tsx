import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { isAxiosError } from 'axios';

import { QuestionScaffold } from '../../components/signup/QuestionScaffold';
import { useStore, type OnboardingInputMode, type RepaymentHabit } from '../../store';
import { endpoints } from '../../services/api';
import { setToken } from '../../services/auth';

const langMap: Record<string, string> = { English: 'en', Hindi: 'hi', Kannada: 'kn', Marathi: 'mr', Tamil: 'ta', Telugu: 'te' };
const habits: RepaymentHabit[] = ['Never Missed', 'Sometimes Delayed', 'Frequently Missed'];

const repaymentMap: Record<RepaymentHabit, string> = {
  'Never Missed': 'always_on_time',
  'Sometimes Delayed': 'sometimes_late',
  'Frequently Missed': 'often_late',
};

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
  const [submitting, setSubmitting] = useState(false);

  const save = async () => {
    if (!monthlyIncome || !monthlyExpenses || !capitalInvestment) {
      Alert.alert('Missing answers', 'Please complete income, expenses and capital investment.');
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

      // Step 2: Save token immediately
      await setToken(payload.token);
      useStore.setState({ token: payload.token });

      // Step 3: Create shop profile on the backend
      await endpoints.createShopProfile({
        occupation: 'shop_owner',
        monthlyIncome,
        monthlyExpenses,
        investmentAmount: capitalInvestment,
        supplierCredit: supplierCredit ? '1' : '0',
        inventoryCycle: inventoryCycle === 'Weekly' ? '7' : '30',
        repaymentHabit: repaymentMap[habit],
        hasActiveLoans,
      });

      // Step 4: Sync to Zustand store
      useStore.setState({
        onboardingInputMode: mode,
        token: payload.token,
        user: payload.user,
        occupation: 'SHOP_OWNER',
      });
      useStore.getState().completeRegistration();

      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Shop Signup Error:', isAxiosError(error) ? error.response?.data : error);

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
      submitLabel={submitting ? 'Creating account...' : 'Continue to Dashboard'}
      submitDisabled={submitting}
      onSubmit={save}
    />
  );
}