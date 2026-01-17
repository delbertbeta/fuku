import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/db';
import { cookies } from 'next/headers';

initializeDatabase();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json({ user: null });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const db = require('@/lib/db').getDb();
    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(session.user_id);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ user: null });
  }
}
