import axios from 'axios';
import { useAuthStore } from './store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ───────────────────────────────────────────────
// Reads token from Zustand store, falls back to localStorage during hydration
apiClient.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  const token =
    state.token ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor ──────────────────────────────────────────────
// Handles expired/invalid tokens globally — clears auth and redirects to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Job API ──────────────────────────────────────────────────────────
export const jobsAPI = {
  list: (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    location?: string;
    job_type?: string;
    source?: string;
  }) => apiClient.get('/api/jobs', { params }),

  get: (id: string) => apiClient.get(`/api/jobs/${id}`),

  getCategories: () => apiClient.get('/api/jobs/filters/categories'),
  getSources: () => apiClient.get('/api/jobs/filters/sources'),
  getLocations: () => apiClient.get('/api/jobs/filters/locations'),
};

// ── Applications API ─────────────────────────────────────────────────
export const applicationsAPI = {
  list: (params: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/api/applications', { params }),

  get: (jobId: string) => apiClient.get(`/api/applications/${jobId}`),

  save: (jobId: string) => apiClient.post(`/api/applications/${jobId}/save`),

  unsave: (jobId: string) =>
    apiClient.delete(`/api/applications/${jobId}/save`),

  update: (jobId: string, data: { status?: string; notes?: string }) =>
    apiClient.patch(`/api/applications/${jobId}`, data),
};

// ── Pipeline API ─────────────────────────────────────────────────────
export const pipelineAPI = {
  run: (params?: { job_filter?: string }) =>
    apiClient.post('/api/pipeline/run', {}, { params }),

  getHistory: (limit?: number) =>
    apiClient.get('/api/pipeline/history', { params: { limit } }),

  getStatus: () => apiClient.get('/api/pipeline/status'),
};

// ── Stats API ────────────────────────────────────────────────────────
export const statsAPI = {
  getOverview: () => apiClient.get('/api/stats'),
  getAnalytics: () => apiClient.get('/api/stats'),
  getByCategory: () => apiClient.get('/api/stats/by-category'),
  getBySource: () => apiClient.get('/api/stats/by-source'),
};

export default apiClient;