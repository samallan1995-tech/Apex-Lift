import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { getDb, unixNow } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email(),
  source: z.string().max(60).optional(),
  marketingConsent: z.boolean().optional(),
});

export async function POST(req: Request) {
  let email: string, source: string, marketingConsent: boolean;
  try {
    const parsed = schema.parse(await req.json());
    email = parsed.email.toLowerCase();
    source = parsed.source ?? 'free-allergen-matrix';
    marketingConsent = parsed.marketingConsent === true;
  } catch {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  // Store the lead. Non-fatal: if the leads table doesn't exist yet the email
  // below still goes out, so the visitor always gets their template.
  try {
    const db = getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from('allersafe_leads').insert({
      id: crypto.randomUUID(),
      email,
      source,
      marketing_consent: marketingConsent,
      created_at: unixNow(),
    });
  } catch (err) {
    console.error('lead store failed (continuing to send email)', err);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://allersafe.org';
  const from = process.env.RESEND_FROM_EMAIL ?? 'AllerSafe <noreply@allersafe.org>';
  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from,
      to: email,
      subject: 'Your free 14-allergen matrix template',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#16a34a">Your allergen matrix template</h2>
          <p style="color:#374151">Thanks for downloading — here's your printable 14-allergen matrix template. Open it and use your browser's print dialog to print or save as a PDF (landscape A4 works best).</p>
          <p style="margin:24px 0"><a href="${appUrl}/free-allergen-matrix/template" style="background:#0E2A06;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">Open your template</a></p>
          <p style="color:#374151;font-size:14px">When you're ready to stop filling matrices in by hand, AllerSafe builds your matrix, Natasha's Law labels and a QR allergen menu from one ingredient list — free for 14 days, no card required: <a href="${appUrl}">allersafe.org</a></p>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">You received this one-off email because you requested the template at allersafe.org.${marketingConsent ? ' You also opted in to occasional compliance tips — you can unsubscribe from those at any time by replying to this email.' : ' We won’t email you again unless you ask us to.'}</p>
        </div>`,
    });
  } catch (err) {
    console.error('lead email failed', err);
    return NextResponse.json(
      { error: 'Could not send the email. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
