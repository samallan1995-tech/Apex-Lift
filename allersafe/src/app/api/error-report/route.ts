import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Receives client-side runtime errors (from the global error boundary) and logs
 * them server-side so they show up in Vercel's Runtime Logs alongside server
 * errors — giving one place to watch for problems in production.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    console.error(
      '[client-error]',
      JSON.stringify({
        message: String(body.message ?? '').slice(0, 500),
        digest: body.digest ?? null,
        url: String(body.url ?? '').slice(0, 300),
        stack: String(body.stack ?? '').slice(0, 2000),
        at: new Date().toISOString(),
      })
    );
  } catch {
    // never let error reporting throw
  }
  return NextResponse.json({ ok: true });
}
