/**
 * STUB — Future AI letter tailoring endpoint.
 *
 * To activate: set ANTHROPIC_API_KEY and replace the stub with a real
 * call to the Claude API. See https://docs.anthropic.com for the SDK.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // TODO: Integrate Claude API here to tailor letter tone/content.
  // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  // const { letterText, instruction } = await req.json();
  // const message = await anthropic.messages.create({ ... });

  return NextResponse.json(
    { error: 'AI tailoring not yet configured. Set ANTHROPIC_API_KEY to enable.' },
    { status: 501 }
  );
}
