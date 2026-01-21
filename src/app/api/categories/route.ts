import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, helpers } from "@/lib/db";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1).max(50),
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
    const stmt = db.prepare(
      `SELECT cc.id, cc.name, cc.is_system, cc.created_at, cc.updated_at,
              COUNT(DISTINCT cic.clothing_item_id) as item_count
       FROM clothing_categories cc
       LEFT JOIN clothing_item_categories cic ON cc.id = cic.category_id
       WHERE cc.user_id = ?
       GROUP BY cc.id
       ORDER BY cc.is_system DESC, cc.name ASC`
    );
    const rows = (await stmt.all([session.user_id])) as any[];
    const categories = rows.map((row) => ({
      ...row,
      item_count:
        typeof row.item_count === "bigint"
          ? Number(row.item_count)
          : row.item_count,
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
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
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid category name" },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    const db = getDb();
    const columns = ["user_id", "name", "is_system"];
    const values = [session.user_id, name, 0];

    let category;
    try {
      category = await helpers.insertAndGet(
        db,
        "clothing_categories",
        columns,
        values
      );
    } catch (error) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
