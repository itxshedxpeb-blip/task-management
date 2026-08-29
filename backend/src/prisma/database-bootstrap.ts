export function getPrismaConnectionUrl(): string {
  const url = (
    process.env.DIRECT_DATABASE_URL ||
    process.env.DATABASE_URL?.replace(/[?&]pgbouncer=true/g, '') ||
    process.env.DATABASE_URL ||
    ''
  );

  // Remove sslmode from connection string to let explicit Pool SSL configuration take precedence
  // This allows the Pool's rejectUnauthorized: false to work correctly with Aiven's self-signed certificates
  if (url) {
    return url.replace(/[?&]sslmode=[^&]+/g, '').replace(/[?&]$/, '');
  }

  return url;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
