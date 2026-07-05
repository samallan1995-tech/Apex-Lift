import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { createMagicCode, recentCodeCount } from '@/lib/queries';
import { unixNow } from '@/lib/db';
import { generateCode } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({ email: z.string().email(), agreed: z.boolean().optional() });

// At most this many codes per email per window — blunts login-code email bombing.
const MAX_PER_WINDOW = 3;
const WINDOW_SECONDS = 60;

export async function POST(req: Request) {
  let email: string;
  let agreed: boolean;
  try {
    const parsed = schema.parse(await req.json());
    email = parsed.email.toLowerCase();
    agreed = parsed.agreed === true;
  } catch {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  if (!agreed) {
    return NextResponse.json(
      { error: 'Please accept the Terms of Service and Privacy Policy to continue.' },
      { status: 400 }
    );
  }

  try {
    const recent = await recentCodeCount(email, unixNow() - WINDOW_SECONDS);
    if (recent >= MAX_PER_WINDOW) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const code = generateCode();
    await createMagicCode(email, code);

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'AllerSafe <noreply@allersafe.org>';

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Your AllerSafe login code: ${code}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#16a34a;margin-bottom:8px">AllerSafe</h2>
          <p style="font-size:16px;color:#374151">Your one-time login code is:</p>
          <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
            <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#15803d">${code}</span>
          </div>
          <p style="color:#6b7280;font-size:14px">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 });
  }
}
