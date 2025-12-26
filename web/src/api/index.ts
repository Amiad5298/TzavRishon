import axios from 'axios';
import type {
  AuthResponse,
  PracticeSessionResponse,
  Question,
  AnswerResponse,
  PracticeSummaryResponse,
  ExamAttemptResponse,
  CurrentSectionResponse,
  ExamSummaryResponse,
  ProgressSummaryResponse,
  TrendResponse,
  PracticeStatsResponse,
  ExamAttemptListResponse,
} from './types';

const API_BASE = (typeof window !== 'undefined' && (import.meta as any).env?.VITE_API_BASE)
  || (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
  || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const authApi = {
  me: () => api.get<AuthResponse>('/auth/me'),
  logout: () => api.post('/auth/logout'),
  loginUrl: () => `${API_BASE}/auth/google/login/google`, // Note: /google suffix is the OAuth2 registration ID
};

// Practice
export const practiceApi = {
  start: (type: string) => api.post<PracticeSessionResponse>('/practice/start', { type }),
  getQuestions: (sessionId: string) =>
    api.get<Question[]>(`/practice/${sessionId}/questions`),
  submitAnswer: (
    sessionId: string,
    data: {
      questionId: string;
      textAnswer?: string;
      selectedOptionId?: string;
      timeMs?: number;
    }
  ) => api.post<AnswerResponse>(`/practice/${sessionId}/answer`, data),
  finish: (sessionId: string) =>
    api.post<PracticeSummaryResponse>(`/practice/${sessionId}/finish`),
};

// Exam
export const examApi = {
  start: () => api.post<ExamAttemptResponse>('/exam/start'),
  getCurrentSection: (attemptId: string) =>
    api.get<CurrentSectionResponse>(`/exam/${attemptId}/section/current`),
  submitAnswer: (
    attemptId: string,
    data: {
      questionId: string;
      textAnswer?: string;
      selectedOptionId?: string;
      timeMs?: number;
    }
  ) => api.post<AnswerResponse>(`/exam/${attemptId}/answer`, data),
  confirmFinishSection: (attemptId: string) =>
    api.post(`/exam/${attemptId}/section/confirm-finish`),
  finish: (attemptId: string) =>
    api.post<ExamSummaryResponse>(`/exam/${attemptId}/finish`),
};

// Progress
export const progressApi = {
  getSummary: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get<ProgressSummaryResponse>(`/progress/summary?${params.toString()}`);
  },
  getTrend: () => api.get<TrendResponse>('/progress/trend'),
  getAttemptDetail: (attemptId: string) =>
    api.get<ExamSummaryResponse>(`/progress/attempts/${attemptId}`),
  getPracticeSummary: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get<PracticeStatsResponse>(`/progress/practice-summary?${params.toString()}`);
  },
  getPracticeTrend: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get<TrendResponse>(`/progress/practice-trend?${params.toString()}`);
  },
  getExamAttempts: (limit: number = 5) =>
    api.get<ExamAttemptListResponse>(`/progress/exam-attempts?limit=${limit}`),
};

// Image Proxy
export const getProxiedImageUrl = (url: string) => {
  return `${API_BASE}/proxy/image?url=${encodeURIComponent(url)}`;
};

export default api;

