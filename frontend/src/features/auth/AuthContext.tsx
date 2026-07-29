'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { silentRefresh } from '@/core/api';
import { setAccessToken, setSessionData, clearSession, getSessionId } from '@/core/auth/session';
import { ROUTES } from '@/core/routes';
import { authService, AuthUser, LoginInput, RegisterInput } from './authService';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; error?: string }>;
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

const PROACTIVE_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

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
        // Silent refresh failed
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
        if (sid) {
          setSessionData(sid, '');
        }
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

  useEffect(() => {
    return () => stopProactiveRefresh();
  }, [stopProactiveRefresh]);

  const getPostLoginRedirect = useCallback((userType?: string) => {
    if (userType === 'SUPER_ADMIN') return ROUTES.adminDashboard;
    return ROUTES.app;
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    try {
      const res: any = await authService.login(input);
      const data = res?.data ?? res;
      setAccessToken(data.accessToken);
      setSessionData(data.sessionId, '');
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
      setAccessToken(data.accessToken);
      setSessionData(data.sessionId, '');
      setUser(data.user);
      startProactiveRefresh();
      const redirect = getPostLoginRedirect(data.user?.userType);
      router.push(redirect);
      router.refresh();
      return { success: true };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Registration failed');
      return { success: false, error: msg };
    }
  }, [router, startProactiveRefresh, getPostLoginRedirect]);

  const logout = useCallback(async () => {
    stopProactiveRefresh();
    try {
      await authService.logout(getSessionId() || '');
    } catch {
      // Still clear local state
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
