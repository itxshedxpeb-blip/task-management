'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { silentRefresh } from '@/core/api';
import { setAccessToken, setSessionData, clearSession, getAccessToken, getSessionId } from '@/core/auth/session';
import { ROUTES } from '@/core/routes';
import { authService, AuthUser, LoginInput, RegisterInput, VerifyOtpInput, ForgotPasswordInput, OtpDeliveryResponse, ResetPasswordInput } from './authService';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; email?: string; otpDelivery?: OtpDeliveryResponse; error?: string }>;
  verifyOtp: (input: VerifyOtpInput) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (input: ForgotPasswordInput) => Promise<{ success: boolean; otpDelivery?: OtpDeliveryResponse; error?: string }>;
  resetPassword: (input: ResetPasswordInput) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string, purpose?: 'REGISTRATION' | 'FORGOT_PASSWORD') => Promise<{ success: boolean; otpDelivery?: OtpDeliveryResponse; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function extractErrorMessage(err: any, fallback: string): string {
  const raw = err?.response?.data?.message;
  if (Array.isArray(raw)) return raw.join(', ');
  if (typeof raw === 'string' && raw) return raw;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
}

const PROACTIVE_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes — keeps session alive and token fresh

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopProactiveRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const startProactiveRefresh = useCallback(() => {
    stopProactiveRefresh();
    refreshIntervalRef.current = setInterval(async () => {
      try {
        await silentRefresh();
      } catch {
        // Silent refresh failed — interceptor handles if token actually expires
      }
    }, PROACTIVE_REFRESH_INTERVAL_MS);
  }, [stopProactiveRefresh]);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const hasToken = await authService.bootstrapSession();
        if (!hasToken) {
          clearSession();
          return;
        }

        const res: any = await authService.getProfile();
        const userData = res?.data ?? res;
        setUser(userData);
        const sid = getSessionId();
        if (sid && userData?.organizationId) {
          setSessionData(sid, userData.organizationId);
        }
        // Warm capabilities cache without blocking first page data requests
        void import('@/core/api/capabilities').then((m) => m.loadCapabilities());
        startProactiveRefresh();
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, [startProactiveRefresh]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => stopProactiveRefresh();
  }, [stopProactiveRefresh]);

  const getPostLoginRedirect = useCallback((userType?: string) => {
    if (userType === 'SYSTEM_ADMIN') return ROUTES.adminDashboard;
    return ROUTES.app;
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    try {
      const res: any = await authService.login(input);
      const data = res?.data ?? res;
      setAccessToken(data.accessToken);
      setSessionData(data.sessionId, data.user?.organizationId || '');
      setUser(data.user);
      startProactiveRefresh();
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const redirect = params?.get('redirect');
      const safe =
        redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : getPostLoginRedirect(data.user?.userType);
      router.push(safe);
      router.refresh();
      return { success: true };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Login failed');
      return { success: false, error: msg };
    }
  }, [router, startProactiveRefresh, getPostLoginRedirect]);

  const register = useCallback(async (input: RegisterInput) => {
    try {
      const res: any = await authService.register(input);
      const data = res?.data ?? res;
      return {
        success: true,
        email: data.email,
        otpDelivery: data,
      };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Registration failed');
      return { success: false, error: msg };
    }
  }, []);

  const verifyOtp = useCallback(async (input: VerifyOtpInput) => {
    try {
      const res: any = await authService.verifyOtp(input);
      const data = res?.data ?? res;
      setAccessToken(data.accessToken);
      setSessionData(data.sessionId, data.user?.organizationId || '');
      setUser(data.user);
      startProactiveRefresh();
      router.push(ROUTES.app);
      router.refresh();
      return { success: true };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Verification failed');
      return { success: false, error: msg };
    }
  }, [router, startProactiveRefresh]);

  const forgotPassword = useCallback(async (input: ForgotPasswordInput) => {
    try {
      const res: any = await authService.forgotPassword(input);
      return { success: true, otpDelivery: res?.data ?? res };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to send OTP');
      return { success: false, error: msg };
    }
  }, []);

  const resetPassword = useCallback(async (input: ResetPasswordInput) => {
    try {
      await authService.resetPassword(input);
      return { success: true };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to reset password');
      return { success: false, error: msg };
    }
  }, []);

  const resendOtp = useCallback(async (email: string, purpose: 'REGISTRATION' | 'FORGOT_PASSWORD' = 'REGISTRATION') => {
    try {
      const res: any = await authService.resendOtp(email, purpose);
      return { success: true, otpDelivery: res?.data ?? res };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to resend OTP');
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    stopProactiveRefresh();
    // Revoke server session + clear HttpOnly refresh cookie WHILE access token is still present.
    // Clearing the token first caused logout to 401 and left refreshToken intact (silent re-login).
    try {
      await authService.logout(getSessionId() || '');
    } catch {
      // Still clear local state even if the network call fails.
    }
    queryClient.clear();
    clearSession();
    setUser(null);
    router.push(ROUTES.login);
    router.refresh();
  }, [router, stopProactiveRefresh, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOtp,
        forgotPassword,
        resetPassword,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
