import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, initializeSchema } from "@/lib/db";
import { z } from "zod";

initializeSchema();

const categorySchema = z.object({
  name: z.string().min(1).max(50),
});

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = getSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const stmt = db.prepare(
      "SELECT id, name, is_system, created_at, updated_at FROM clothing_categories WHERE user_id = ? ORDER BY is_system DESC, name ASC"
    );
    const categories = stmt.all(session.user_id);

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

    const session = getSession(sessionCookie.value);
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
    const stmt = db.prepare(
      "INSERT INTO clothing_categories (user_id, name, is_system) VALUES (?, ?, 0) RETURNING *"
    );

    let category;
    try {
      category = stmt.get(session.user_id, name);
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
