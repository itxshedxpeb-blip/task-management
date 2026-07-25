import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken, setSessionData, clearSession, getTenantId } from '@/core/auth/session';
import { assertEndpointAvailable, rememberUnavailableEndpoint } from './capabilities';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_API_URL');
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// --- Refresh Token Queue ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

/** Single-flight refresh — AuthContext + axios 401 handler must not rotate in parallel. */
let refreshInFlight: Promise<string> | null = null;

export async function silentRefresh(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const responseData = data?.data ?? data;
    const accessToken = responseData.accessToken;
    if (!accessToken) throw new Error('No access token in refresh response');
    setAccessToken(accessToken);
    if (responseData.sessionId) {
      setSessionData(responseData.sessionId, getTenantId() || '');
    }
    return accessToken;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

// Request interceptor - attach access token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    await assertEndpointAvailable(config);
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const tenantId = getTenantId();
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 with refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 404 && originalRequest?.url) {
      rememberUnavailableEndpoint(originalRequest.url);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Never retry refresh on auth endpoints — they 401 for valid business reasons
    const url = originalRequest.url || '';
    if (url.includes('/auth/')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await silentRefresh();
      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearSession();
      if (typeof window !== 'undefined') {
        const authRoutes = new Set(['/login', '/register', '/forgot-password', '/reset-password']);
        const currentPath = window.location.pathname;
        if (!authRoutes.has(currentPath)) {
          const reason =
            refreshError && typeof refreshError === 'object' && 'response' in refreshError
              ? 'session_expired'
              : 'backend_unavailable';
          window.location.href = `/login?reason=${reason}`;
        }
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// Typed API methods - unwrap response.data
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then(res => res.data),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then(res => res.data),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then(res => res.data),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then(res => res.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then(res => res.data),
};

export interface ApiResponse<T> { data: T; message?: string; success: boolean; }
export interface PaginatedResponse<T> { data: T[]; pagination: { page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrevious: boolean; }; }
export interface ApiError { message: string; code: string; statusCode: number; details?: any; }

export default api;
