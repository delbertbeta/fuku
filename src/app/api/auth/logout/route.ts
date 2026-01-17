import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';
import { initializeDatabase } from '@/lib/db';
import { cookies } from 'next/headers';

initializeDatabase();

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;

    if (sessionId) {
      deleteSession(sessionId);
    }

    cookieStore.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
