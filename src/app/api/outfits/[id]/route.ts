import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, helpers } from "@/lib/db";
import { z } from "zod";

const outfitSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  clothing_ids: z.array(z.number()).optional(),
});

async function loadCategoriesForItems(
  itemIds: number[]
): Promise<Map<number, { ids: number[]; names: string[] }>> {
  const db = getDb();
  if (itemIds.length === 0) {
    return new Map();
  }

  const placeholders = itemIds.map(() => "?").join(", ");
  const stmt = db.prepare(
    `SELECT cic.clothing_item_id, cc.id as category_id, cc.name as category_name
     FROM clothing_item_categories cic
     JOIN clothing_categories cc ON cic.category_id = cc.id
     WHERE cic.clothing_item_id IN (${placeholders})`
  );
  const rows = await stmt.all(itemIds);
  const map = new Map<number, { ids: number[]; names: string[] }>();

  for (const row of rows as any[]) {
    if (!map.has(row.clothing_item_id)) {
      map.set(row.clothing_item_id, { ids: [], names: [] });
    }
    const entry = map.get(row.clothing_item_id);
    entry?.ids.push(row.category_id);
    entry?.names.push(row.category_name);
  }

  return map;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await getSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(
      "SELECT * FROM outfits WHERE id = ? AND user_id = ?"
    );
    const outfit = await stmt.get([idNum, session.user_id]);

    if (!outfit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const clothingStmt = db.prepare(
      `SELECT ci.*, cc.name as primary_category_name
       FROM clothing_items ci
       JOIN outfit_items oi ON ci.id = oi.clothing_id
       LEFT JOIN clothing_categories cc ON ci.category = cc.id
       WHERE oi.outfit_id = ?`
    );
    const clothingItems = (await clothingStmt.all([idNum])) as any[];
    const categoriesByItem = await loadCategoriesForItems(
      clothingItems.map((item) => item.id)
    );

    (outfit as any).clothing_items = clothingItems.map((item) => {
      const categoryInfo = categoriesByItem.get(item.id);
      const ids = categoryInfo?.ids ?? [];
      const names = categoryInfo?.names ?? [];
      return {
        ...item,
        category_name: item.primary_category_name || null,
        category_ids: ids,
        category_names: names,
      };
    });

    return NextResponse.json({ outfit });
  } catch (error) {
    console.error("Get outfit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await getSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const result = outfitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const db = getDb();
    const updates: string[] = [];
    const values: any[] = [];
    const { clothing_ids } = result.data;

    Object.entries(result.data).forEach(([key, value]) => {
      if (value !== undefined && key !== "clothing_ids") {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length > 0) {
      updates.push(`updated_at = ${helpers.getNowFunction()}`);
      values.push(idNum, session.user_id);

      const outfit = await helpers.updateAndGet(
        db,
        "outfits",
        updates,
        values,
        ["id = ?", "user_id = ?"],
        [idNum, session.user_id]
      );

      if (!outfit) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      if (clothing_ids !== undefined) {
        const deleteStmt = db.prepare(
          "DELETE FROM outfit_items WHERE outfit_id = ?"
        );
        await deleteStmt.run([idNum]);

        if (clothing_ids.length > 0) {
          await db.transaction(async () => {
            const insertStmt = db.prepare(
              "INSERT INTO outfit_items (outfit_id, clothing_id) VALUES (?, ?)"
            );
            for (const clothingId of clothing_ids) {
              await insertStmt.run([idNum, clothingId]);
            }
          });
        }
      }

      return NextResponse.json({ outfit });
    }

    if (clothing_ids !== undefined) {
      const deleteStmt = db.prepare(
        "DELETE FROM outfit_items WHERE outfit_id = ?"
      );
      await deleteStmt.run([idNum]);

      if (clothing_ids.length > 0) {
        await db.transaction(async () => {
          const insertStmt = db.prepare(
            "INSERT INTO outfit_items (outfit_id, clothing_id) VALUES (?, ?)"
          );
          for (const clothingId of clothing_ids) {
            await insertStmt.run([idNum, clothingId]);
          }
        });
      }

      const stmt = db.prepare("SELECT * FROM outfits WHERE id = ?");
      const outfit = await stmt.get([idNum]);
      return NextResponse.json({ outfit });
    }

    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  } catch (error) {
    console.error("Update outfit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await getSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const db = getDb();
    const outfit = await helpers.deleteAndGet(
      db,
      "outfits",
      ["id = ?", "user_id = ?"],
      [idNum, session.user_id]
    );

    if (!outfit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete outfit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
