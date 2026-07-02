export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  // Never return an empty slug (e.g. an emoji-only venue name) — fall back to a token.
  return base || 'venue';
}

// Unambiguous alphanumeric alphabet (no 0/O/1/I/L) for one-time login codes.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

/**
 * Cryptographically-random 6-character login code (~31^6 ≈ 900M combinations).
 * Uses the Web Crypto API (available in both the Node server runtime and the
 * browser) instead of Math.random, so codes can't be predicted, and the large
 * space makes brute-forcing infeasible even without an attempt-lockout table.
 */
export function generateCode(): string {
  const bytes = new Uint32Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
