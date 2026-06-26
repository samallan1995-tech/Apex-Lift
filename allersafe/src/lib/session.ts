import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionData } from '@/types';

const sessionOptions = {
  cookieName: 'allersafe_session',
  password: process.env.IRON_SESSION_PASSWORD ?? 'change-me-to-at-least-32-characters-long!!',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }
  return session;
}
