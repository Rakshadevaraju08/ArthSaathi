export type Lang = 'Hindi' | 'English' | 'Marathi' | 'Tamil' | 'Telugu';
export type TxType = 'income' | 'expense' | 'saving';

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  note: string;       // was "label" — backend uses "note"
  date: string;
};

export type NotifType = 'alert' | 'tip' | 'info';

export type Notif = {
  id: string;
  type: NotifType;
  message: string;
  read: boolean;
  ts: string;
};

export type AIMsg = { role: 'user' | 'ai'; text: string };
export type LoanRisk = 'safe' | 'moderate' | 'high';

export type RtcData = {
  surveyNumber: string;
  ownerName: string;
  village: string;
  taluk: string;
  district: string;
  landArea: string;
  cropType: string;
};

export type ScamResult = {
  isScam: boolean;
  confidence: number;
  reason: string;
  warningLevel: string;   // "HIGH" | "MEDIUM" | "LOW"
} | null;

// ── Backend-aligned types ──────────────────

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  language: string;
  village?: string;
  district?: string;
  createdAt?: string;
};

export type DashboardData = {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  netBalance: number;
  monthly: {
    income: number;
    expense: number;
    saving: number;
  };
  recentTransactions: Transaction[];
  financialSummary: {
    status: string;
    savingsRate: string;
    message: string;
  };
};

export type LoanAnalysisResult = {
  reportId: string;
  result: {
    emi: number;
    totalRepayment: number;
    riskLevel: string;        // "LOW" | "MEDIUM" | "HIGH"
    debtToIncomeRatio: string;
    recommendation: string;
  };
};

export type ScamDetectionResult = {
  reportId: string;
  result: {
    isScam: boolean;
    confidence: number;
    reason: string;
    warningLevel: string;
  };
};

export type FinancialGuidanceResult = {
  reportId: string;
  result: {
    guidance: string;
    tips: string[];
  };
};