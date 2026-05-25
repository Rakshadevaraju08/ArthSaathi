import axios, { AxiosInstance } from 'axios';
import { getToken } from './auth';

// ─────────────────────────────────────────
// Base URLs
// ─────────────────────────────────────────
// REPLACE '192.168.1.X' WITH YOUR COMPUTER'S ACTUAL IPv4 ADDRESS!
// localhost will NOT work on a physical device.
const BASE  = process.env.EXPO_PUBLIC_API_URL   ?? 'http://192.168.1.X:3000';
const VOICE = process.env.EXPO_PUBLIC_VOICE_URL ?? 'http://192.168.1.X:8001';

// ─────────────────────────────────────────
// Axios instances
// ─────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

/** Separate voice micro-service (whisper / tts) */
export const voiceApi: AxiosInstance = axios.create({
  baseURL: VOICE,
  timeout: 20000,
});

// ─────────────────────────────────────────
// Auth interceptor — attach JWT to every request
// ─────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────
// Response unwrapper — returns `data` from
// the standard { success, message, data } envelope
// ─────────────────────────────────────────
function unwrap<T = any>(promise: Promise<{ data: { data: T } }>) {
  return promise.then((res) => res.data.data);
}

// ─────────────────────────────────────────
// API Endpoints — matches backend spec exactly
// ─────────────────────────────────────────
export const endpoints = {

  // ── Auth ────────────────────────────────
  register: (body: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    language?: string;
    village?: string;
    district?: string;
  }) => api.post('/api/auth/register', body),

  login: (phone: string, password: string, village?: string, district?: string) =>
    api.post('/api/auth/login', { phone, password, village, district }),

  getMe: () => api.get('/api/auth/me'),

  // ── User ────────────────────────────────
  getProfile: () => api.get('/api/users/profile'),

  updateProfile: (body: Record<string, any>) =>
    api.put('/api/users/profile', body),

  // ── Transactions ────────────────────────
  getTransactions: (params?: {
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/api/transactions', { params }),

  addTransaction: (body: {
    amount: number;
    type: string;      // income | expense | saving
    category: string;
    note?: string;
    date?: string;
  }) => api.post('/api/transactions', body),

  getTransaction: (id: string) =>
    api.get(`/api/transactions/${id}`),

  updateTransaction: (id: string, body: Record<string, any>) =>
    api.put(`/api/transactions/${id}`, body),

  deleteTransaction: (id: string) =>
    api.delete(`/api/transactions/${id}`),

  // ── Dashboard ───────────────────────────
  getDashboard: () => api.get('/api/dashboard'),

  // ── AI ──────────────────────────────────
  financialGuidance: (query: string, language: string) =>
    api.post('/api/ai/financial-guidance', { query, language }),

  scamDetection: (message: string) =>
    api.post('/api/ai/scam-detection', { message }),

  loanAnalysis: (body: {
    loanAmount: number;
    interestRate: number;
    tenureMonths: number;
    monthlyIncome: number;
  }) => api.post('/api/ai/loan-analysis', body),

  // ── RTC ─────────────────────────────────
  uploadRtc: (form: FormData) =>
    api.post('/api/rtc/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,   // OCR can be slow
    }),

  getRtcRecords: () => api.get('/api/rtc'),
};