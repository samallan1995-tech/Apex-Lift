import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { createMagicCode } from '@/lib/queries';
import { generateCode } from '@/lib/utils';
import { initSchema } from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    await initSchema();
    const code = generateCode();
    await createMagicCode(email.toLowerCase(), code);

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@allersafe.app';

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
