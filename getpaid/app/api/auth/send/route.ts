import { NextRequest, NextResponse } from 'next/server';
import { dbSaveMagicCode, isTursoConfigured } from '@/lib/db';
import { memStore } from '@/lib/memStore';

const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const code = generateCode();
    const expiresAt = Date.now() + CODE_EXPIRY_MS;

    if (isTursoConfigured()) {
      await dbSaveMagicCode(email.toLowerCase(), code, expiresAt);
    } else {
      memStore.set(email.toLowerCase(), { code, expiresAt });
    }

    // Send email via Resend if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'noreply@getpaid.app',
        to: email,
        subject: `Your GetPaid sign-in code: ${code}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #0369a1;">GetPaid — Sign-in code</h2>
            <p>Here is your one-time sign-in code:</p>
            <div style="font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #0284c7; padding: 20px 0;">
              ${code}
            </div>
            <p style="color: #6b7280;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      });
    } else {
      // Dev mode: log to console
      console.log(`[GetPaid Auth] Code for ${email}: ${code} (expires ${new Date(expiresAt).toISOString()})`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/send]', err);
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 });
  }
}
