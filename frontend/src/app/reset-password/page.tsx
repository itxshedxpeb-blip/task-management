'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/core/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { resetPasswordSchema, ResetPasswordInput } from '@/features/auth/validations';
import { FormInput } from '@/components/form/FormInput';
import { FormField } from '@/components/form/FormField';
import { useOtpRecovery } from '@/features/auth/useOtpRecovery';
import { OtpResendButton } from '@/features/auth/OtpResendButton';

function ResetPasswordForm() {
  const { resetPassword, resendOtp } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { persist, clear, resendSeconds, isExpired } = useOtpRecovery(email, 'FORGOT_PASSWORD');

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (isExpired) {
      setApiError('OTP has expired. Please request a new one.');
      return;
    }
    setSubmitting(true);
    setApiError('');
    const result = await resetPassword({ ...data, email });
    setSubmitting(false);
    if (!result.success) {
      setApiError(result.error || 'Failed to reset password');
      return;
    }
    clear();
    setSuccess(true);
  };

  const onResend = async () => {
    if (resendSeconds > 0 || submitting || !email) return;
    setSubmitting(true);
    setApiError('');
    const result = await resendOtp(email, 'FORGOT_PASSWORD');
    setSubmitting(false);
    if (!result.success) {
      setApiError(result.error || "We couldn't send the verification code. Please try again.");
      return;
    }
    if (result.otpDelivery) persist(result.otpDelivery, 'FORGOT_PASSWORD');
    form.setValue('otp', '');
    form.clearErrors('otp');
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="rounded-md bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-600">Password reset successfully!</p>
        </div>
        <Link
          href={ROUTES.login}
          className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90"
        >
          Sign in with new password
        </Link>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="text-center space-y-4">
        <div className="rounded-md bg-amber-500/10 p-4">
          <p className="text-sm text-amber-500">Missing email. Please start the forgot password process again.</p>
        </div>
        <Link
          href={ROUTES.forgotPassword}
          className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90"
        >
          Forgot Password
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
      <p className="text-sm text-muted-foreground text-center">
        Enter the OTP sent to <strong className="text-foreground">{email}</strong> and set a new password.
      </p>
      {isExpired && (
        <div className="rounded-md bg-amber-500/10 p-3 text-center text-sm text-amber-500">
          OTP has expired. Please request a new one.
        </div>
      )}

      <FormField label="OTP" required error={form.formState.errors.otp?.message}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          className="flex h-12 w-full rounded-md border border-input bg-input px-3 py-1 text-center text-2xl tracking-[0.5em] shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="------"
          {...form.register('otp', {
            setValueAs: (v) => String(v ?? '').replace(/\D/g, '').slice(0, 6),
          })}
          disabled={submitting || isExpired}
        />
      </FormField>

      <FormInput
        label="New Password"
        type="password"
        placeholder="Min. 8 characters, upper + lower + number"
        autoComplete="new-password"
        registration={form.register('newPassword')}
        error={form.formState.errors.newPassword?.message}
        required
        disabled={submitting}
      />

      <FormInput
        label="Confirm New Password"
        type="password"
        placeholder="Repeat your new password"
        autoComplete="new-password"
        registration={form.register('confirmPassword')}
        error={form.formState.errors.confirmPassword?.message}
        required
        disabled={submitting}
      />

      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3" role="alert">
          <p className="text-sm text-destructive">{apiError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || isExpired}
        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Resetting...
          </span>
        ) : 'Reset Password'}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{' '}
        <OtpResendButton resendSeconds={resendSeconds} disabled={submitting} onResend={onResend} />
      </p>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={ROUTES.login} className="font-medium text-primary hover:opacity-80">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">TaskFlow</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">Set new password</p>
        </div>

        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
