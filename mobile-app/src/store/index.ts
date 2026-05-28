import { create } from 'zustand';

import type {
  AIMsg,
  Lang,
  LoanRisk,
  Notif,
  RtcData,
  ScamResult,
  Transaction,
  User,
} from '../types';

export type Occupation = 'FARMER' | 'SHOP_OWNER' | 'TAILOR' | 'DAILY_WAGE';
export type RepaymentHabit = 'Never Missed' | 'Sometimes Delayed' | 'Frequently Missed';
export type OnboardingInputMode = 'TEXT' | 'VOICE';

export type PrimaryRegistrationData = {
  fullName: string;
  mobileNumber: string;
  password: string;
  preferredLanguage: Lang;
  occupation: Occupation;
};

export type Loan = {
  id: string;
  type: 'lent' | 'borrowed';
  personName: string;
  amount: number;
  remainingAmount: number;
  interestRate: number;
  dueDate: string | null;
  status: 'active' | 'paid' | 'overdue';
  date: string;
};

type Store = PrimaryRegistrationData & {
  token: string | null;
  user: User | null;
  transactions: Transaction[];
  notifications: Notif[];
  aiMessages: AIMsg[];
  language: Lang;
  scamResult: ScamResult;
  rtcUploaded: boolean;
  rtcData: RtcData | null;
  loanRisk: LoanRisk;
  monthlyIncome: number;
  monthlyExpenses: number;
  hasActiveLoans: boolean;
  pastRepaymentHabit: RepaymentHabit;
  onboarded: boolean;
  isLoggedIn: boolean;
  isRegistered: boolean;
  loans: Loan[];
  onboardingInputMode: OnboardingInputMode;

  setToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'date'> & { date?: string }) => void;
  setTransactions: (txs: Transaction[]) => void;
  removeTransaction: (id: string) => void;
  setLanguage: (l: Lang) => void;
  setScamResult: (r: ScamResult) => void;
  setRtc: (d: RtcData) => void;
  addAiMessage: (m: AIMsg) => void;
  markNotifRead: (id: string) => void;
  setLoanRisk: (r: LoanRisk) => void;
  setOnboarded: (v: boolean) => void;
  setLoggedIn: (v: boolean) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  removeLoan: (id: string) => void;
  recordLoanRepayment: (id: string, paidAmount: number, method: string) => void;

  setPrimaryRegistration: (data: PrimaryRegistrationData) => void;
  completeRegistration: () => void;
  resetGlobalDataState: () => void;
};

const defaultRegistration: PrimaryRegistrationData = {
  fullName: '',
  mobileNumber: '',
  password: '',
  preferredLanguage: 'English',
  occupation: 'FARMER',
};

export const useStore = create<Store>((set) => ({
  ...defaultRegistration,
  token: null,
  user: null,
  transactions: [
    {
      id: 'm1',
      type: 'income',
      amount: 7800,
      category: 'Crop Sale',
      note: 'Tomato crate settlement',
      date: '2026-05-21',
    },
    {
      id: 'm2',
      type: 'expense',
      amount: 1450,
      category: 'Seeds',
      note: 'Vegetable seeds and trays',
      date: '2026-05-19',
    },
  ],
  notifications: [],
  aiMessages: [],
  language: 'English',
  scamResult: null,
  rtcUploaded: false,
  rtcData: null,
  loanRisk: 'safe',
  monthlyIncome: 0,
  monthlyExpenses: 0,
  hasActiveLoans: false,
  pastRepaymentHabit: 'Never Missed',
  onboarded: false,
  isLoggedIn: false,
  isRegistered: false,
  loans: [
    {
      id: 'loan-1',
      type: 'borrowed',
      personName: 'SBI Kisan Branch',
      amount: 50000,
      remainingAmount: 18500,
      interestRate: 10.5,
      dueDate: '2026-06-12',
      status: 'active',
      date: '2026-01-18',
    },
    {
      id: 'loan-2',
      type: 'borrowed',
      personName: 'Krishi Cooperative Bank',
      amount: 32000,
      remainingAmount: 12400,
      interestRate: 9.2,
      dueDate: '2026-05-30',
      status: 'overdue',
      date: '2026-02-04',
    },
    {
      id: 'loan-3',
      type: 'borrowed',
      personName: 'Village Trader Ramesh',
      amount: 14000,
      remainingAmount: 4200,
      interestRate: 18,
      dueDate: '2026-06-05',
      status: 'active',
      date: '2026-03-15',
    },
  ],
  onboardingInputMode: 'TEXT',

  setToken: (t) => set({ token: t }),
  setUser: (u) => set({ user: u }),
  addTransaction: (t) =>
    set((s) => ({
      transactions: [
        {
          id: 't' + Math.random().toString(36).slice(2, 8),
          date: t.date ?? new Date().toISOString().slice(0, 10),
          ...t,
        },
        ...s.transactions,
      ],
    })),
  setTransactions: (txs) => set({ transactions: txs }),
  removeTransaction: (id) =>
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
  setLanguage: (l) => set({ language: l, preferredLanguage: l }),
  setScamResult: (r) => set({ scamResult: r }),
  setRtc: (d) => set({ rtcUploaded: true, rtcData: d }),
  addAiMessage: (m) => set((s) => ({ aiMessages: [...s.aiMessages, m] })),
  markNotifRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  setLoanRisk: (r) => set({ loanRisk: r }),
  setOnboarded: (v) => set({ onboarded: v }),
  setLoggedIn: (v) => set({ isLoggedIn: v }),
  addLoan: (loan) =>
    set((s) => ({ loans: [...s.loans, { ...loan, id: Date.now().toString() }] })),
  updateLoan: (id, updates) =>
    set((s) => ({
      loans: s.loans.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),
  removeLoan: (id) => set((s) => ({ loans: s.loans.filter((l) => l.id !== id) })),
  recordLoanRepayment: (id, paidAmount, method) =>
    set((s) => {
      const loan = s.loans.find((item) => item.id === id);
      if (!loan) return s;

      const safePaidAmount = Math.max(0, Math.min(paidAmount, loan.remainingAmount));
      const nextRemaining = Math.max(0, loan.remainingAmount - safePaidAmount);

      return {
        loans: s.loans.map((item) =>
          item.id === id
            ? {
                ...item,
                remainingAmount: nextRemaining,
                status: nextRemaining === 0 ? 'paid' : 'active',
              }
            : item
        ),
        transactions: [
          {
            id: `rep-${Date.now()}`,
            type: 'expense',
            amount: safePaidAmount,
            category: 'Loan Repayment',
            note: `Paid to ${loan.personName} via ${method}`,
            date: new Date().toISOString(),
          },
          ...s.transactions,
        ],
      };
    }),

  setPrimaryRegistration: (data) =>
    set({
      ...data,
      language: data.preferredLanguage,
      user: {
        id: 'local-user',
        name: data.fullName,
        phone: data.mobileNumber,
        language: data.preferredLanguage,
      },
    }),
  completeRegistration: () =>
    set({ isRegistered: true, isLoggedIn: true, onboarded: true }),
  resetGlobalDataState: () =>
    set({
      ...defaultRegistration,
      token: null,
      user: null,
      language: 'English',
      isRegistered: false,
      isLoggedIn: false,
      onboarded: false,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      hasActiveLoans: false,
      pastRepaymentHabit: 'Never Missed',
      transactions: [],
      loans: [],
    }),
}));

export const useTotals = () => {
  const tx = useStore((s) => s.transactions);
  const income = tx
    .filter((t) => t.type === 'income')
    .reduce((a, b) => a + b.amount, 0);
  const expense = tx
    .filter((t) => t.type === 'expense')
    .reduce((a, b) => a + b.amount, 0);
  const savings = income - expense;
  const score = Math.max(
    0,
    Math.min(100, Math.round(income === 0 ? 0 : (savings / income) * 100 + 45))
  );

  return { income, expense, savings, score };
};
