'use client';
import { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ROUTES } from '@/core/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { registerSchema, verifyOtpSchema, RegisterInput } from '@/features/auth/validations';
import { FormInput } from '@/components/form/FormInput';
import { useOtpRecovery } from '@/features/auth/useOtpRecovery';
import { OtpResendButton } from '@/features/auth/OtpResendButton';

function RegisterForm() {
  const { register: registerUser, verifyOtp, resendOtp } = useAuth();
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [email, setEmail] = useState('');
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { state: otpState, persist, clear, resendSeconds, isExpired } = useOtpRecovery();

  useEffect(() => {
    if (otpState?.purpose === 'REGISTRATION') {
      setEmail(otpState.email);
      setStep('otp');
    }
  }, [otpState]);

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', name: '', companyName: '', password: '', confirmPassword: '' },
  });

  const otpForm = useForm({ resolver: zodResolver(verifyOtpSchema), defaultValues: { otp: '' } });

  const onRegister = async (formData: RegisterInput) => {
    setSubmitting(true);
    setApiError('');
    const result = await registerUser(formData);
    setSubmitting(false);
    if (result.success) {
      setEmail(result.email || formData.email);
      if (result.otpDelivery) persist(result.otpDelivery, 'REGISTRATION');
      setStep('otp');
    } else {
      setApiError(result.error || 'Registration failed');
    }
  };

  const onVerifyOtp = async (data: { otp: string }) => {
    if (isExpired) {
      setApiError('OTP has expired. Please request a new one.');
      return;
    }
    setSubmitting(true);
    setApiError('');
    const result = await verifyOtp({ email, otp: data.otp });
    setSubmitting(false);
    if (!result.success) {
      setApiError(result.error || 'Verification failed');
      return;
    }
    clear();
  };

  const onResend = async () => {
    if (resendSeconds > 0 || submitting) return;
    setSubmitting(true);
    setApiError('');
    const result = await resendOtp(email, 'REGISTRATION');
    setSubmitting(false);
    if (!result.success) {
      setApiError(result.error || "We couldn't send the verification code. Please try again.");
      return;
    }
    if (result.otpDelivery) persist(result.otpDelivery, 'REGISTRATION');
    otpForm.reset({ otp: '' });
    otpForm.clearErrors();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">TaskFlow</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {step === 'register' ? 'Create your account' : 'Verify your email'}
          </p>
        </div>

        {step === 'register' ? (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="mt-8 space-y-4" noValidate>
            <FormInput label="Full Name" type="text" placeholder="John Doe" autoComplete="name"
              registration={registerForm.register('name')} error={registerForm.formState.errors.name?.message as string}
              disabled={submitting} />
            <FormInput label="Company Name" type="text" placeholder="Acme Corp" autoComplete="organization"
              registration={registerForm.register('companyName')} error={registerForm.formState.errors.companyName?.message as string}
              disabled={submitting} />
            <FormInput label="Email" type="email" placeholder="you@example.com" autoComplete="email"
              registration={registerForm.register('email')} error={registerForm.formState.errors.email?.message as string}
              required disabled={submitting} />
            <FormInput label="Password" type="password" placeholder="Min 8 chars, upper+lower+number" autoComplete="new-password"
              registration={registerForm.register('password')} error={registerForm.formState.errors.password?.message as string}
              required disabled={submitting} />
            <FormInput label="Confirm Password" type="password" placeholder="Re-enter password" autoComplete="new-password"
              registration={registerForm.register('confirmPassword')} error={registerForm.formState.errors.confirmPassword?.message as string}
              required disabled={submitting} />
            {apiError && (<div className="rounded-md bg-destructive/10 p-3"><p className="text-sm text-destructive">{apiError}</p></div>)}
            <button type="submit" disabled={submitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}<Link href={ROUTES.login} className="font-medium text-primary">Sign in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="mt-8 space-y-4" noValidate>
            <p className="text-sm text-muted-foreground text-center">We sent a 6-digit code to <strong className="text-foreground">{email}</strong></p>
            {isExpired && (
              <p className="rounded-md bg-amber-500/10 p-3 text-center text-sm text-amber-500">
                OTP has expired. Please request a new one.
              </p>
            )}
            <FormInput
              label="OTP Code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              registration={otpForm.register('otp', {
                setValueAs: (v) => String(v ?? '').replace(/\D/g, '').slice(0, 6),
              })}
              error={otpForm.formState.errors.otp?.message as string}
              required
              disabled={submitting || isExpired}
            />
            {apiError && (<div className="rounded-md bg-destructive/10 p-3"><p className="text-sm text-destructive">{apiError}</p></div>)}
            <button
              type="submit"
              disabled={submitting || isExpired}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Verifying...' : 'Verify Email'}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive the code?{' '}
              <OtpResendButton resendSeconds={resendSeconds} disabled={submitting} onResend={onResend} />
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (<Suspense><RegisterForm /></Suspense>);
}
