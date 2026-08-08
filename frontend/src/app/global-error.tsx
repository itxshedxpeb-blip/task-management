'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center bg-background">
          <h1 className="text-2xl font-semibold text-foreground">Critical Error</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            A critical error occurred. The application has been notified.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="rounded-md bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/90"
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
