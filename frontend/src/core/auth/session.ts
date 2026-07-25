const SESSION_ID_KEY = 'sessionId';
const TENANT_ID_KEY = 'tenantId';

let inMemoryAccessToken: string | null = null;
let inMemorySessionId: string | null = null;
let inMemoryTenantId: string | null = null;

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

export function setSessionData(sessionId: string, tenantId: string): void {
  inMemorySessionId = sessionId;
  inMemoryTenantId = tenantId || null;

  if (typeof window !== 'undefined') {
    // sessionId is a non-secret UX marker for middleware — not authorization.
    // Authorization relies on HttpOnly refresh cookie + in-memory access token.
    document.cookie = `${SESSION_ID_KEY}=${encodeURIComponent(sessionId)}; path=/; SameSite=Lax; max-age=${30 * 24 * 60 * 60}${cookieSecureFlag()}`;
    if (tenantId) {
      document.cookie = `${TENANT_ID_KEY}=${encodeURIComponent(tenantId)}; path=/; SameSite=Lax; max-age=${30 * 24 * 60 * 60}${cookieSecureFlag()}`;
    }
  }
}

export function getSessionId(): string | null {
  if (inMemorySessionId) return inMemorySessionId;
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_ID_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getTenantId(): string | null {
  if (inMemoryTenantId) return inMemoryTenantId;
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TENANT_ID_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearSession(): void {
  inMemoryAccessToken = null;
  inMemorySessionId = null;
  inMemoryTenantId = null;

  if (typeof window !== 'undefined') {
    document.cookie = `${SESSION_ID_KEY}=; path=/; SameSite=Lax; max-age=0${cookieSecureFlag()}`;
    document.cookie = `${TENANT_ID_KEY}=; path=/; SameSite=Lax; max-age=0${cookieSecureFlag()}`;
  }
}

export function hasSession(): boolean {
  return !!(inMemoryAccessToken || getSessionId());
}
