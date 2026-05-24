import { create } from 'zustand';

import type {
  Transaction,
  Notif,
  AIMsg,
  Lang,
  LoanRisk,
  RtcData,
  ScamResult,
} from '../types';

// ─────────────────────────────
// Loan Type
// ─────────────────────────────
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

const today = new Date();

const d = (offset: number) => {
  const x = new Date(today);

  x.setDate(x.getDate() - offset);

  return x.toISOString().slice(0, 10);
};

type Store = {
  // ─────────────────────────────
  // State
  // ─────────────────────────────
  transactions: Transaction[];

  notifications: Notif[];

  aiMessages: AIMsg[];

  language: Lang;

  scamResult: ScamResult;

  rtcUploaded: boolean;

  rtcData: RtcData | null;

  loanRisk: LoanRisk;

  onboarded: boolean;

  isLoggedIn: boolean;

  loans: Loan[];

  // ─────────────────────────────
  // Actions
  // ─────────────────────────────
  addTransaction: (
    t: Omit<Transaction, 'id' | 'date'> & {
      date?: string;
    }
  ) => void;

  removeTransaction: (
    id: string
  ) => void;

  setLanguage: (
    l: Lang
  ) => void;

  setScamResult: (
    r: ScamResult
  ) => void;

  setRtc: (
    d: RtcData
  ) => void;

  addAiMessage: (
    m: AIMsg
  ) => void;

  markNotifRead: (
    id: string
  ) => void;

  setLoanRisk: (
    r: LoanRisk
  ) => void;

  setOnboarded: (
    v: boolean
  ) => void;

  setLoggedIn: (
    v: boolean
  ) => void;

  // ─────────────────────────────
  // Loan Actions
  // ─────────────────────────────
  addLoan: (
    loan: Omit<Loan, 'id'>
  ) => void;

  updateLoan: (
    id: string,
    updates: Partial<Loan>
  ) => void;

  removeLoan: (
    id: string
  ) => void;
};

export const useStore = create<Store>(
  (set) => ({
    // ─────────────────────────────
    // Initial State
    // ─────────────────────────────
    transactions: [
      {
        id: 't1',
        type: 'expense',
        amount: 3000,
        category: 'Fertilizer',
        label: 'DAP fertilizer 2 bags',
        date: d(1),
      },

      {
        id: 't2',
        type: 'income',
        amount: 4500,
        category: 'Milk Sale',
        label: 'Weekly milk collection',
        date: d(2),
      },

      {
        id: 't3',
        type: 'expense',
        amount: 1200,
        category: 'Seeds',
        label: 'Tomato hybrid seeds',
        date: d(4),
      },

      {
        id: 't4',
        type: 'expense',
        amount: 2200,
        category: 'Labour',
        label: '3 day wages',
        date: d(6),
      },

      {
        id: 't5',
        type: 'income',
        amount: 12000,
        category: 'Crop Sale',
        label: 'Sugarcane partial sale',
        date: d(9),
      },

      {
        id: 't6',
        type: 'expense',
        amount: 1800,
        category: 'Food',
        label: 'Monthly groceries',
        date: d(11),
      },

      {
        id: 't7',
        type: 'income',
        amount: 3200,
        category: 'Milk Sale',
        label: 'Weekly milk collection',
        date: d(14),
      },

      {
        id: 't8',
        type: 'expense',
        amount: 900,
        category: 'Other',
        label: 'Electricity bill',
        date: d(17),
      },
    ],

    notifications: [
      {
        id: 'n1',
        type: 'alert',
        message:
          'Suspicious SMS detected from +91-98XXX — flagged as potential scam.',
        read: false,
        ts: '2h ago',
      },

      {
        id: 'n2',
        type: 'tip',
        message:
          'Your savings rate improved by 4% this month. Keep going!',
        read: false,
        ts: '1d ago',
      },

      {
        id: 'n3',
        type: 'info',
        message:
          'Milk sale recorded — ₹3,200 added to income.',
        read: true,
        ts: '2d ago',
      },
    ],

    aiMessages: [
      {
        role: 'ai',
        text:
          'Namaste Ramesh! Aap kaise madad chahte hain aaj?',
      },
    ],

    language: 'Hindi',

    scamResult: null,

    rtcUploaded: false,

    rtcData: null,

    loanRisk: 'safe',

    onboarded: false,

    isLoggedIn: false,

    // ─────────────────────────────
    // Loans Initial State
    // ─────────────────────────────
    loans: [
      {
        id: 'l1',
        type: 'borrowed',
        personName: 'Mahesh',
        amount: 10000,
        remainingAmount: 6000,
        interestRate: 5,
        dueDate: d(-15),
        status: 'active',
        date: d(10),
      },

      {
        id: 'l2',
        type: 'lent',
        personName: 'Suresh',
        amount: 5000,
        remainingAmount: 0,
        interestRate: 0,
        dueDate: d(2),
        status: 'paid',
        date: d(20),
      },
    ],

    // ─────────────────────────────
    // Actions
    // ─────────────────────────────
    addTransaction: (t) =>
      set((s) => ({
        transactions: [
          {
            id:
              't' +
              Math.random()
                .toString(36)
                .slice(2, 8),

            date:
              t.date ??
              new Date()
                .toISOString()
                .slice(0, 10),

            ...t,
          },

          ...s.transactions,
        ],
      })),

    removeTransaction: (id) =>
      set((s) => ({
        transactions:
          s.transactions.filter(
            (t) => t.id !== id
          ),
      })),

    setLanguage: (l) =>
      set({
        language: l,
      }),

    setScamResult: (r) =>
      set({
        scamResult: r,
      }),

    setRtc: (d) =>
      set({
        rtcUploaded: true,
        rtcData: d,
      }),

    addAiMessage: (m) =>
      set((s) => ({
        aiMessages: [
          ...s.aiMessages,
          m,
        ],
      })),

    markNotifRead: (id) =>
      set((s) => ({
        notifications:
          s.notifications.map((n) =>
            n.id === id
              ? {
                  ...n,
                  read: true,
                }
              : n
          ),
      })),

    setLoanRisk: (r) =>
      set({
        loanRisk: r,
      }),

    setOnboarded: (v) =>
      set({
        onboarded: v,
      }),

    setLoggedIn: (v) =>
      set({
        isLoggedIn: v,
      }),

    // ─────────────────────────────
    // Loan Actions
    // ─────────────────────────────
    addLoan: (loan) =>
      set((s) => ({
        loans: [
          ...s.loans,
          {
            ...loan,
            id: Date.now().toString(),
          },
        ],
      })),

    updateLoan: (id, updates) =>
      set((s) => ({
        loans: s.loans.map((l) =>
          l.id === id
            ? {
                ...l,
                ...updates,
              }
            : l
        ),
      })),

    removeLoan: (id) =>
      set((s) => ({
        loans: s.loans.filter(
          (l) => l.id !== id
        ),
      })),
  })
);

export const useTotals = () => {
  const tx = useStore(
    (s) => s.transactions
  );

  const income = tx
    .filter((t) => t.type === 'income')
    .reduce(
      (a, b) => a + b.amount,
      0
    );

  const expense = tx
    .filter((t) => t.type === 'expense')
    .reduce(
      (a, b) => a + b.amount,
      0
    );

  const savings =
    income - expense;

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        income === 0
          ? 0
          : (savings / income) * 100 + 45
      )
    )
  );

  return {
    income,
    expense,
    savings,
    score,
  };
};