'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ROUTES } from '@/core/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema } from '@/features/auth/validations';
import { FormInput } from '@/components/form/FormInput';
import { useTheme } from '@/theme/ThemeProvider';

export default function LoginPage() {
  const { login } = useAuth();
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const reason = params.get('reason');
    if (reason === 'session_expired' || reason === 'session_required') {
      setApiError('Your session has expired. Please sign in again.');
    }
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setApiError('');
    const result = await login(data);
    setSubmitting(false);
    if (!result.success) {
      setApiError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">TaskFlow</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <FormInput label="Email" type="email" placeholder="you@example.com" autoComplete="email"
            registration={form.register('email')} error={form.formState.errors.email?.message as string}
            required disabled={submitting} />
          <FormInput label="Password" type="password" placeholder="Enter your password" autoComplete="current-password"
            registration={form.register('password')} error={form.formState.errors.password?.message as string}
            required disabled={submitting} />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" {...form.register('rememberMe')} className="rounded border-border" />
              Remember me
            </label>
            <Link href={ROUTES.forgotPassword} className="text-sm font-medium text-primary hover:opacity-80">
              Forgot password?
            </Link>
          </div>
          {apiError && (<div className="rounded-md bg-destructive/10 p-3" role="alert"><p className="text-sm text-destructive">{apiError}</p></div>)}
          <button type="submit" disabled={submitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? (<span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Signing in...</span>) : 'Sign in'}
          </button>
          <p className="text-center text-sm text-muted-foreground">Don&apos;t have an account?{' '}
            <Link href={ROUTES.register} className="font-medium text-primary hover:opacity-80">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
