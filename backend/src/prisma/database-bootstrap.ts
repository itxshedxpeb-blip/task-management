export function getPrismaConnectionUrl(): string {
  const rawUrl =
    process.env.DIRECT_DATABASE_URL ||
    process.env.DATABASE_URL ||
    '';

  if (!rawUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  const url = new URL(rawUrl);

  // Remove SSL-related parameters to let explicit Pool SSL configuration take precedence
  url.searchParams.delete('sslmode');
  url.searchParams.delete('ssl');
  url.searchParams.delete('pgbouncer');

  return url.toString();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
