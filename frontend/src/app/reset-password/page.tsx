import Link from 'next/link';
import { ROUTES } from '@/core/routes';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-foreground">TaskFlow</h2>
        <div className="rounded-md bg-amber-500/10 p-6">
          <p className="text-sm text-amber-600">
            Password reset is not available. Please contact your administrator to reset your password.
          </p>
        </div>
        <Link
          href={ROUTES.login}
          className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
