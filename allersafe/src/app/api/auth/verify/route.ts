import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyMagicCode, findOrCreateUser } from '@/lib/queries';
import { getSession } from '@/lib/session';

const schema = z.object({ email: z.string().email(), code: z.string().length(6) });

export async function POST(req: Request) {
  let email: string, code: string;
  try {
    const parsed = schema.parse(await req.json());
    email = parsed.email;
    code = parsed.code;
  } catch {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  try {
    const valid = await verifyMagicCode(email.toLowerCase(), code);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const user = await findOrCreateUser(email.toLowerCase());
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
