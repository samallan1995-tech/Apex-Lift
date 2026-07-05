import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { getDb, unixNow } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  let name: string, email: string, message: string;
  try {
    const parsed = schema.parse(await req.json());
    name = parsed.name.trim();
    email = parsed.email.toLowerCase();
    message = (parsed.message ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Please enter your name and a valid email.' }, { status: 400 });
  }

  // Store the enquiry (non-fatal if the leads table doesn't exist yet).
  try {
    const db = getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from('allersafe_leads').insert({
      id: crypto.randomUUID(),
      email,
      source: 'menu-import-enquiry',
      marketing_consent: false,
      message: `${name}: ${message}`.slice(0, 2000),
      created_at: unixNow(),
    });
  } catch (err) {
    console.error('enquiry store failed (continuing to notify)', err);
  }

  const to =
    process.env.LEAD_NOTIFY_EMAIL ??
    process.env.OWNER_NOTIFY_EMAIL ??
    'support@allersafe.org';
  const from = process.env.RESEND_FROM_EMAIL ?? 'AllerSafe <noreply@allersafe.org>';

  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from,
      to,
      replyTo: email,
      subject: `Menu import enquiry — ${name}`,
      html: `<p><strong>${name}</strong> (${email}) asked about the £49 menu import service.</p>
             <p>${message ? message.replace(/</g, '&lt;') : '(no message — reply to arrange details)'}</p>
             <p>Reply directly to this email to reach them.</p>`,
    });
  } catch (err) {
    console.error('enquiry notify failed', err);
    return NextResponse.json({ error: 'Could not send your enquiry. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
