import axios, { AxiosInstance } from 'axios';

const BASE = process.env.EXPO_PUBLIC_API_URL  ?? 'http://localhost:3000';
const AI   = process.env.EXPO_PUBLIC_AI_URL   ?? 'http://localhost:8000';
const VOICE= process.env.EXPO_PUBLIC_VOICE_URL ?? 'http://localhost:8001';

export const api: AxiosInstance      = axios.create({ baseURL: BASE,  timeout: 15000 });
export const aiApi: AxiosInstance    = axios.create({ baseURL: AI,    timeout: 30000 });
export const voiceApi: AxiosInstance = axios.create({ baseURL: VOICE, timeout: 20000 });

export const endpoints = {
  login:         (phone: string, otp: string) => api.post('/auth/login', { phone, otp }),
  getTransactions: ()                         => api.get('/transactions'),
  addTransaction:  (body: object)             => api.post('/transactions', body),
  getSummary:      ()                         => api.get('/financial-summary'),
  uploadRtc:       (form: FormData)           => api.post('/rtc/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  analyze:         (text: string, lang: string) => aiApi.post('/ai/analyze',       { text, language: lang }),
  loanRisk:        (body: object)             => aiApi.post('/ai/loan-risk',       body),
  scamCheck:       (text: string)             => aiApi.post('/ai/scam-check',      { text }),
  financialPlan:   (body: object)             => aiApi.post('/ai/financial-plan',  body),
  extractRtc:      (form: FormData)           => aiApi.post('/ai/extract-rtc',     form, { headers: { 'Content-Type': 'multipart/form-data' } }),
};