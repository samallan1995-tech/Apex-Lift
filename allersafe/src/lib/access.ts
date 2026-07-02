import { NextResponse } from 'next/server';
import { hasActiveAccess } from './queries';

/**
 * Returns a 402 response when the account's trial has lapsed and they have no
 * paid plan, otherwise null. Call right after auth in any route that creates,
 * edits, or generates value (menu items, labels, matrix) so a lapsed trial can't
 * keep using the app for free.
 */
export async function blockIfNoAccess(userId: string): Promise<NextResponse | null> {
  if (await hasActiveAccess(userId)) return null;
  return NextResponse.json(
    { error: 'trial_ended', message: 'Your free trial has ended — choose a plan to continue.' },
    { status: 402 }
  );
}
