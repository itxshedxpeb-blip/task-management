import api, { silentRefresh } from '@/core/api';
import { getAccessToken, getSessionId } from '@/core/auth/session';

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  userType: string;
  isActive?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  sessionId: string;
  expiresIn: number;
  user: AuthUser;
  message: string;
}

export const authService = {
  register: (data: RegisterInput) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: LoginInput) =>
    api.post<AuthResponse>('/auth/login', data),

  logout: (sessionId: string) =>
    api.post<{ message: string }>('/auth/logout', { sessionId }),

  getProfile: () =>
    api.get<AuthUser>('/auth/me'),

  bootstrapSession: async (): Promise<boolean> => {
    if (getAccessToken()) {
      return true;
    }
    if (!getSessionId()) {
      return false;
    }
    try {
      await silentRefresh();
      return true;
    } catch {
      // refresh cookie missing or expired
    }
    return false;
  },
};
