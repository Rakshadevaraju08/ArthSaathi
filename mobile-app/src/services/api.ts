import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { getToken } from './auth';

// ─────────────────────────────────────────
// Base URLs
// ─────────────────────────────────────────
// REPLACE '192.168.1.X' WITH YOUR COMPUTER'S ACTUAL IPv4 ADDRESS!
// localhost will NOT work on a physical device.
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
const envVoiceUrl = process.env.EXPO_PUBLIC_VOICE_URL;

const expoHost =
  Constants.expoConfig?.hostUri?.split(':')[0] ||
  (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost?.split(':')[0] ||
  null;

const fallbackApi = expoHost ? `http://${expoHost}:3000/api` : 'http://192.168.29.9:3000/api';
const fallbackVoice = expoHost ? `http://${expoHost}:8001/api` : 'http://192.168.29.9:8001/api';

const BASE = envApiUrl ?? fallbackApi;
const VOICE = envVoiceUrl ?? fallbackVoice;

console.log('[API][BOOT] Resolved API baseURL:', BASE);
console.log('[API][BOOT] Resolved Voice baseURL:', VOICE);

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

const redact = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  const cloned = { ...data };
  if ('password' in cloned) cloned.password = '[REDACTED]';
  if ('token' in cloned) cloned.token = '[REDACTED]';
  return cloned;
};

// ─────────────────────────────────────────
// Auth interceptor — attach JWT to every request
// ─────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('[API][REQ]', config.method?.toUpperCase(), `${config.baseURL}${config.url}`, {
    params: config.params,
    data: redact(config.data),
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(
      '[API][RES]',
      response.status,
      `${response.config.baseURL}${response.config.url}`,
      redact(response.data)
    );
    return response;
  },
  (error) => {
    console.log(
      '[API][ERR]',
      error?.response?.status ?? 'NO_RESPONSE',
      error?.config ? `${error.config.baseURL}${error.config.url}` : 'unknown-url',
      redact(error?.response?.data ?? error?.message)
    );
    return Promise.reject(error);
  }
);

voiceApi.interceptors.request.use((config) => {
  console.log('[VOICE][REQ]', config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
  return config;
});

voiceApi.interceptors.response.use(
  (response) => {
    console.log('[VOICE][RES]', response.status, `${response.config.baseURL}${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(
      '[VOICE][ERR]',
      error?.response?.status ?? 'NO_RESPONSE',
      error?.config ? `${error.config.baseURL}${error.config.url}` : 'unknown-url',
      error?.response?.data ?? error?.message
    );
    return Promise.reject(error);
  }
);

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
  }) => api.post('/auth/register', body),

  login: (phone: string, password: string, village?: string, district?: string) =>
    api.post('/auth/login', { phone, password, village, district }),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),

  getMyProfile: () => api.get('/profile/me'),

  // ── User ────────────────────────────────
  getProfile: () => api.get('/users/profile'),

  updateProfile: (body: Record<string, any>) =>
    api.put('/profile/me', body),

  createFarmerProfile: (data: any) => api.post('/profile/farmer', data),
  createShopProfile: (data: any) => api.post('/profile/shop', data),
  createTailorProfile: (data: any) => api.post('/profile/tailor', data),
  createGenericProfile: (data: any) => api.post('/profile/generic', data),

  // ── Transactions ────────────────────────
  getTransactions: (params?: {
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/transactions', { params }),

  addTransaction: (body: {
    amount: number;
    type: string;      // income | expense | saving
    category: string;
    note?: string;
    date?: string;
  }) => api.post('/transactions', body),

  getTransaction: (id: string) =>
    api.get(`/transactions/${id}`),

  updateTransaction: (id: string, body: Record<string, any>) =>
    api.put(`/transactions/${id}`, body),

  deleteTransaction: (id: string) =>
    api.delete(`/transactions/${id}`),

  // ── Dashboard ───────────────────────────
  getDashboard: () => api.get('/dashboard'),

  // ── AI ──────────────────────────────────
  financialGuidance: (query: string, language: string) =>
    api.post('/ai/financial-guidance', { query, language }),

  scamDetection: (message: string) =>
    api.post('/ai/scam-detection', { message }),

  loanAnalysis: (body: {
    loanAmount: number;
    interestRate: number;
    tenureMonths: number;
    monthlyIncome: number;
  }) => api.post('/ai/loan-analysis', body),

  // ── RTC ─────────────────────────────────
  uploadRtc: (form: FormData) =>
    api.post('/rtc/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,   // OCR can be slow
    }),

  getRtcRecords: () => api.get('/rtc'),
};
