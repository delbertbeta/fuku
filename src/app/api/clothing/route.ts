import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, helpers } from "@/lib/db";
import { uploadImage } from "@/lib/storage";
import { normalizePrice } from "@/lib/utils/normalizePrice";
import sharp from "sharp";

function parseCategoryIds(values: Array<string | number>): number[] {
  const ids = values
    .map((value) => Number.parseInt(String(value), 10))
    .filter((value) => Number.isInteger(value) && value > 0);
  return Array.from(new Set(ids));
}

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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const db = getDb();

    let query = "";
    const params: any[] = [session.user_id];

    if (category) {
      const categoryId = Number.parseInt(category, 10);
      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
      query = `
        SELECT DISTINCT ci.*, cc.name as primary_category_name
        FROM clothing_items ci
        JOIN clothing_item_categories cic ON ci.id = cic.clothing_item_id
        LEFT JOIN clothing_categories cc ON ci.category = cc.id
        WHERE ci.user_id = ? AND cic.category_id = ?
        ORDER BY ci.created_at DESC
      `;
      params.push(categoryId);
    } else {
      query = `
        SELECT ci.*, cc.name as primary_category_name
        FROM clothing_items ci
        LEFT JOIN clothing_categories cc ON ci.category = cc.id
        WHERE ci.user_id = ?
        ORDER BY ci.created_at DESC
      `;
    }

    const stmt = db.prepare(query);
    const items = (await stmt.all(params)) as any[];
    const itemIds = items.map((item) => item.id);
    const categoriesByItem = await loadCategoriesForItems(itemIds);

    const mergedItems = items.map((item) => {
      const categoryInfo = categoriesByItem.get(item.id);
      const ids = categoryInfo?.ids ?? [];
      const names = categoryInfo?.names ?? [];

      if (ids.length === 0 && item.category) {
        ids.push(item.category);
        if (item.primary_category_name) {
          names.push(item.primary_category_name);
        }
      }

      return {
        ...item,
        price: normalizePrice(item.price),
        category_name: item.primary_category_name || null,
        category_ids: ids,
        category_names: names,
      };
    });

    return NextResponse.json({ items: mergedItems });
  } catch (error) {
    console.error("Get clothing error:", error);
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

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const name = formData.get("name") as string;
    const categoryValues = formData.getAll("categories");
    const fallbackCategory = formData.get("category") as string | null;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") as string | null;
    const purchaseDate = formData.get("purchase_date") as string | null;

    const categoryIds =
      categoryValues.length > 0
        ? parseCategoryIds(categoryValues as string[])
        : fallbackCategory
          ? parseCategoryIds([fallbackCategory])
          : [];

    if (!image || !name || categoryIds.length === 0) {
      return NextResponse.json(
        { error: "Image, name, and category are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const placeholders = categoryIds.map(() => "?").join(", ");
    const categoryStmt = db.prepare(
      `SELECT id, name FROM clothing_categories WHERE user_id = ? AND id IN (${placeholders})`
    );
    const categoryRows = (await categoryStmt.all([
      session.user_id,
      ...categoryIds,
    ])) as any[];

    if (categoryRows.length !== categoryIds.length) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const processedBuffer = await sharp(buffer)
      .resize(1920, 1920, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    const filename = image.name;
    const imagePath = await uploadImage(processedBuffer, filename, image.type);
    const primaryCategoryId = categoryIds[0];
    const columns = [
      "user_id",
      "name",
      "category",
      "description",
      "image_path",
      "price",
      "purchase_date",
    ];
    const values = [
      session.user_id,
      name,
      primaryCategoryId,
      description || null,
      imagePath,
      price ? parseFloat(price) : null,
      purchaseDate || null,
    ];

    let item: any;
    const dbType = process.env.DATABASE_TYPE || "sqlite";
    const joinInsertSql =
      dbType === "mariadb"
        ? "INSERT IGNORE INTO clothing_item_categories (clothing_item_id, category_id) VALUES (?, ?)"
        : "INSERT OR IGNORE INTO clothing_item_categories (clothing_item_id, category_id) VALUES (?, ?)";

    await db.transaction(async () => {
      item = await helpers.insertAndGet(db, "clothing_items", columns, values);
      const insertStmt = db.prepare(joinInsertSql);
      for (const categoryId of categoryIds) {
        await insertStmt.run([item.id, categoryId]);
      }
    });

    const categoriesByItem = await loadCategoriesForItems([item.id]);
    const categoryInfo = categoriesByItem.get(item.id);

    return NextResponse.json(
      {
        item: {
          ...item,
          price: normalizePrice(item.price),
          category_name:
            categoryRows.find((row) => row.id === primaryCategoryId)?.name ||
            null,
          category_ids: categoryInfo?.ids ?? categoryIds,
          category_names:
            categoryInfo?.names ?? categoryRows.map((row) => row.name),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create clothing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
