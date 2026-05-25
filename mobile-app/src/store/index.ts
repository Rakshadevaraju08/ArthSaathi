import { create } from 'zustand';

import type {
  Transaction,
  Notif,
  AIMsg,
  Lang,
  LoanRisk,
  RtcData,
  ScamResult,
  User,
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

type Store = {
  // ─────────────────────────────
  // State
  // ─────────────────────────────
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

  onboarded: boolean;

  isLoggedIn: boolean;

  loans: Loan[];

  // ─────────────────────────────
  // Actions
  // ─────────────────────────────
  setToken: (
    t: string | null
  ) => void;

  setUser: (
    u: User | null
  ) => void;

  addTransaction: (
    t: Omit<Transaction, 'id' | 'date'> & {
      date?: string;
    }
  ) => void;

  setTransactions: (
    txs: Transaction[]
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
    token: null,

    user: null,

    transactions: [
    ],

    notifications: [
    ],

    aiMessages: [
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
    ],

    // ─────────────────────────────
    // Actions
    // ─────────────────────────────
    setToken: (t) =>
      set({ token: t }),

    setUser: (u) =>
      set({ user: u }),

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

    setTransactions: (txs) =>
      set({ transactions: txs }),

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