import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, helpers } from "@/lib/db";
import { normalizePrice } from "@/lib/utils/normalizePrice";
import { z } from "zod";

const outfitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await getSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      SELECT o.id, o.name, o.description, o.created_at,
             ci.id as item_id, ci.name as item_name, ci.image_path,
             ci.price, ci.description as item_description,
             cc.name as primary_category_name
      FROM outfits o
      LEFT JOIN outfit_items oi ON o.id = oi.outfit_id
      LEFT JOIN clothing_items ci ON oi.clothing_id = ci.id
      LEFT JOIN clothing_categories cc ON ci.category = cc.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `);
    const rows = await stmt.all([session.user_id]);

    const outfitsMap = new Map<number, any>();

    for (const row of rows as any[]) {
      if (!outfitsMap.has(row.id)) {
        outfitsMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          created_at: row.created_at,
          clothing_items: [],
        });
      }

      if (row.item_id) {
        outfitsMap.get(row.id).clothing_items.push({
          id: row.item_id,
          name: row.item_name,
          image_path: row.image_path,
          price: normalizePrice(row.price),
          description: row.item_description,
          category_name: row.primary_category_name,
        });
      }
    }

    const outfits = Array.from(outfitsMap.values());

    return NextResponse.json({ outfits });
  } catch (error) {
    console.error("Get outfits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await getSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    if (
      !clothing_ids ||
      !Array.isArray(clothing_ids) ||
      clothing_ids.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one clothing item is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const columns = ["user_id", "name", "description"];
    const values = [session.user_id, name, description || null];

    const outfit = (await helpers.insertAndGet(
      db,
      "outfits",
      columns,
      values
    )) as any;

    await db.transaction(async () => {
      const insertItemStmt = db.prepare(
        "INSERT INTO outfit_items (outfit_id, clothing_id) VALUES (?, ?)"
      );
      for (const clothingId of clothing_ids) {
        await insertItemStmt.run([outfit.id, clothingId]);
      }
    });

    return NextResponse.json({ outfit }, { status: 201 });
  } catch (error) {
    console.error("Create outfit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
