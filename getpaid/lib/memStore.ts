/**
 * In-memory magic-code store for when Turso is not configured.
 * Shared between /api/auth/send and /api/auth/verify via module singleton.
 */
export const memStore = new Map<string, { code: string; expiresAt: number }>();
