import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, helpers } from "@/lib/db";
import { uploadImage } from "@/lib/storage";
import { z } from "zod";
import sharp from "sharp";

const clothingSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.coerce.number().int().positive().optional(),
  categories: z.array(z.number().int().positive()).min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive().nullable().optional(),
  purchase_date: z.string().nullable().optional(),
});

function normalizeCategoryIds(
  categories?: number[],
  category?: number
): number[] {
  if (categories && categories.length > 0) {
    return Array.from(new Set(categories));
  }
  if (category) {
    return [category];
  }
  return [];
}

async function loadCategoriesForItem(
  itemId: number
): Promise<{ ids: number[]; names: string[] }> {
  const db = getDb();
  const stmt = db.prepare(
    `SELECT cc.id as category_id, cc.name as category_name
     FROM clothing_item_categories cic
     JOIN clothing_categories cc ON cic.category_id = cc.id
     WHERE cic.clothing_item_id = ?`
  );
  const rows = await stmt.all([itemId]);
  const ids: number[] = [];
  const names: string[] = [];
  for (const row of rows as any[]) {
    ids.push(row.category_id);
    names.push(row.category_name);
  }
  return { ids, names };
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
      `SELECT ci.*, cc.name as primary_category_name
       FROM clothing_items ci
       LEFT JOIN clothing_categories cc ON ci.category = cc.id
       WHERE ci.id = ? AND ci.user_id = ?`
    );
    const item = (await stmt.get([idNum, session.user_id])) as any;

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const categories = await loadCategoriesForItem(idNum);
    const categoryIds =
      categories.ids.length > 0 ? categories.ids : [item.category];
    const categoryNames =
      categories.names.length > 0
        ? categories.names
        : item.primary_category_name
          ? [item.primary_category_name]
          : [];

    return NextResponse.json({
      item: {
        ...item,
        category_name: item.primary_category_name || null,
        category_ids: categoryIds,
        category_names: categoryNames,
      },
    });
  } catch (error) {
    console.error("Get clothing item error:", error);
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
    const result = clothingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const db = getDb();
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(result.data).forEach(([key, value]) => {
      if (value !== undefined && key !== "categories") {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    const categoryIds = normalizeCategoryIds(
      result.data.categories,
      result.data.category
    );

    if (updates.length === 0 && categoryIds.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    if (categoryIds.length > 0) {
      const placeholders = categoryIds.map(() => "?").join(", ");
      const categoryStmt = db.prepare(
        `SELECT id FROM clothing_categories WHERE user_id = ? AND id IN (${placeholders})`
      );
      const categoryRows = (await categoryStmt.all([
        session.user_id,
        ...categoryIds,
      ])) as any[];

      if (categoryRows.length !== categoryIds.length) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }

    if (updates.length > 0) {
      updates.push(`updated_at = ${helpers.getNowFunction()}`);
      values.push(idNum, session.user_id);
    }

    let item: any;
    await db.transaction(async () => {
      if (updates.length > 0) {
        item = await helpers.updateAndGet(
          db,
          "clothing_items",
          updates,
          values,
          ["id = ?", "user_id = ?"],
          [idNum, session.user_id]
        );
      } else {
        const stmt = db.prepare(
          "SELECT * FROM clothing_items WHERE id = ? AND user_id = ?"
        );
        item = await stmt.get([idNum, session.user_id]);
      }

      if (!item) {
        return;
      }

      if (categoryIds.length > 0) {
        const deleteStmt = db.prepare(
          "DELETE FROM clothing_item_categories WHERE clothing_item_id = ?"
        );
        await deleteStmt.run([idNum]);

        const dbType = process.env.DATABASE_TYPE || "sqlite";
        const insertSql =
          dbType === "mariadb"
            ? "INSERT IGNORE INTO clothing_item_categories (clothing_item_id, category_id) VALUES (?, ?)"
            : "INSERT OR IGNORE INTO clothing_item_categories (clothing_item_id, category_id) VALUES (?, ?)";
        const insertStmt = db.prepare(insertSql);
        for (const categoryId of categoryIds) {
          await insertStmt.run([idNum, categoryId]);
        }

        const primaryCategoryId = categoryIds[0];
        if (item.category !== primaryCategoryId) {
          const updateStmt = db.prepare(
            `UPDATE clothing_items SET category = ?, updated_at = ${helpers.getNowFunction()} WHERE id = ? AND user_id = ?`
          );
          await updateStmt.run([primaryCategoryId, idNum, session.user_id]);
          item.category = primaryCategoryId;
        }
      }
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const categories = await loadCategoriesForItem(idNum);

    return NextResponse.json({
      item: {
        ...item,
        category_ids: categories.ids,
        category_names: categories.names,
      },
    });
  } catch (error) {
    console.error("Update clothing item error:", error);
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
    const item = await helpers.deleteAndGet(
      db,
      "clothing_items",
      ["id = ?", "user_id = ?"],
      [idNum, session.user_id]
    );

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete clothing item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
