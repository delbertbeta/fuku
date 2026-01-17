import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/db';
import { z } from 'zod';

initializeDatabase();

const outfitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = getSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const stmt = db.prepare(
      'SELECT * FROM outfits WHERE user_id = ? ORDER BY created_at DESC'
    );
    const outfits = stmt.all(session.user_id);

    for (const outfit of outfits as any[]) {
      const itemStmt = db.prepare(
        'SELECT clothing_id FROM outfit_items WHERE outfit_id = ?'
      );
      const clothingIds = itemStmt.all(outfit.id);
      outfit.clothing_ids = clothingIds.map((i: any) => i.clothing_id);
    }

    return NextResponse.json({ outfits });
  } catch (error) {
    console.error('Get outfits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = getSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = outfitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, clothing_ids } = body;

    if (!clothing_ids || !Array.isArray(clothing_ids) || clothing_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one clothing item is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const insertStmt = db.prepare(
      'INSERT INTO outfits (user_id, name, description) VALUES (?, ?, ?) RETURNING *'
    );
    const outfit = insertStmt.get(session.user_id, name, description || null) as any;

    const insertItemStmt = db.prepare(
      'INSERT INTO outfit_items (outfit_id, clothing_id) VALUES (?, ?)'
    );

    const insertMany = db.transaction((outfitId: number, clothingIds: number[]) => {
      for (const clothingId of clothingIds) {
        insertItemStmt.run(outfitId, clothingId);
      }
    });

    insertMany(outfit.id, clothing_ids);

    return NextResponse.json({ outfit }, { status: 201 });
  } catch (error) {
    console.error('Create outfit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
