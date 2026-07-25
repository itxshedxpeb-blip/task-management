/**
 * @deprecated Prefer `@/core/api` typed helpers for new code.
 * Re-exported for backward compatibility with services expecting axios instances.
 */
export { apiClient as api, apiClient as default } from '@/core/api';
export { api as typedApi } from '@/core/api';
export type { ApiResponse, PaginatedResponse, ApiError } from '@/core/api';
