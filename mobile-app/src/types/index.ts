export type Lang = 'Hindi' | 'English' | 'Marathi' | 'Tamil' | 'Telugu';
export type TxType = 'income' | 'expense';

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  label: string;
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
  survey: string;
  owner: string;
  village: string;
  district: string;
  area: string;
  crop: string;
};

export type ScamResult = { safe: boolean; message: string } | null;