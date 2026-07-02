import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getUsersInTrialReminderWindow, getSubscription } from '@/lib/queries';
import { hasPaidAccess } from '@/lib/plans';

export const runtime = 'nodejs';

/**
 * Daily cron (see vercel.json). Emails users whose free trial ends in ~2 days
 * and who haven't subscribed yet. Secured by CRON_SECRET — Vercel automatically
 * sends it as a Bearer token when the env var is set; without it the route 401s,
 * so it stays inert until you configure it.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const users = await getUsersInTrialReminderWindow();
  const from = process.env.RESEND_FROM_EMAIL ?? 'AllerSafe <noreply@allersafe.org>';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://allersafe.org';
  const resend = new Resend(process.env.RESEND_API_KEY);

  let sent = 0;
  for (const u of users) {
    const sub = await getSubscription(u.id);
    if (hasPaidAccess(sub?.status, sub?.stripe_subscription_id)) continue; // already paying
    try {
      await resend.emails.send({
        from,
        to: u.email,
        subject: 'Your AllerSafe free trial ends in 2 days',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#16a34a">Your free trial is nearly up</h2>
            <p style="color:#374151">Your 14-day AllerSafe trial ends in about 2 days. Choose a plan to keep printing labels, sharing your QR menu, and editing your allergen data — your menu is saved and ready.</p>
            <p style="margin:24px 0"><a href="${appUrl}/dashboard/billing" style="background:#0E2A06;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">Choose a plan</a></p>
            <p style="color:#6b7280;font-size:13px">No pressure — you won't be charged unless you pick a plan.</p>
          </div>`,
      });
      sent++;
    } catch (err) {
      console.error('trial reminder failed for', u.email, err);
    }
  }

  return NextResponse.json({ ok: true, candidates: users.length, sent });
}
