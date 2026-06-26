import { NextRequest, NextResponse } from 'next/server';
import { createSession, sessionCookieOptions } from '@/lib/session';
import { dbGetMagicCode, dbDeleteMagicCode, isTursoConfigured } from '@/lib/db';
import { memStore } from '@/lib/memStore';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
    }

    const normalEmail = (email as string).toLowerCase();
    let stored: { code: string; expiresAt: number } | null = null;

    if (isTursoConfigured()) {
      stored = await dbGetMagicCode(normalEmail);
    } else {
      stored = memStore.get(normalEmail) ?? null;
    }

    if (!stored) {
      return NextResponse.json({ error: 'No code found. Please request a new one.' }, { status: 400 });
    }

    if (Date.now() > stored.expiresAt) {
      if (isTursoConfigured()) {
        await dbDeleteMagicCode(normalEmail);
      } else {
        memStore.delete(normalEmail);
      }
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 });
    }

    if (stored.code !== String(code).trim()) {
      return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
    }

    // Clean up used code
    if (isTursoConfigured()) {
      await dbDeleteMagicCode(normalEmail);
    } else {
      memStore.delete(normalEmail);
    }

    const token = await createSession(normalEmail);
    const cookieOpts = sessionCookieOptions(token);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieOpts);
    return response;
  } catch (err) {
    console.error('[auth/verify]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
