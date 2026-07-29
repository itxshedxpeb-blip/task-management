const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
const SESSION_ID_KEY = isProduction ? '__Secure-sessionId' : 'sessionId';

let inMemoryAccessToken: string | null = null;
let inMemorySessionId: string | null = null;

function cookieSecureFlag(): string {
  if (typeof window === 'undefined') return '';
  return window.location.protocol === 'https:' ? '; Secure' : '';
}

export function setAccessToken(token: string): void {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function clearAccessToken(): void {
  inMemoryAccessToken = null;
}

export function setSessionData(sessionId: string, _tenantId?: string): void {
  inMemorySessionId = sessionId || null;

  if (typeof window !== 'undefined') {
    document.cookie = `${SESSION_ID_KEY}=${encodeURIComponent(sessionId)}; path=/; SameSite=Lax; max-age=${30 * 24 * 60 * 60}${cookieSecureFlag()}`;
  }
}

export function getSessionId(): string | null {
  if (inMemorySessionId) return inMemorySessionId;
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_ID_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearSession(): void {
  inMemoryAccessToken = null;
  inMemorySessionId = null;

  if (typeof window !== 'undefined') {
    document.cookie = `${SESSION_ID_KEY}=; path=/; SameSite=Lax; max-age=0${cookieSecureFlag()}`;
  }
}

export function hasSession(): boolean {
  return !!(inMemoryAccessToken || getSessionId());
}
