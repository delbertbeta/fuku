import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { uploadImage } from "@/lib/storage";
import { initializeDatabase } from "@/lib/db";
import { z } from "zod";
import sharp from "sharp";

initializeDatabase();

const clothingSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  purchase_date: z.string().optional(),
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const db = getDb();
    let query = "SELECT * FROM clothing_items WHERE user_id = ?";
    const params: any[] = [session.user_id];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    query += " ORDER BY created_at DESC";

    const stmt = db.prepare(query);
    const items = stmt.all(...params);

    return NextResponse.json({ items });
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

    const session = getSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") as string | null;
    const purchaseDate = formData.get("purchase_date") as string | null;

    if (!image || !name || !category) {
      return NextResponse.json(
        { error: "Image, name, and category are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    const categoryStmt = db.prepare(
      "SELECT id FROM clothing_categories WHERE user_id = ? AND name = ?"
    );
    const categoryExists = categoryStmt.get(session.user_id, category);
    if (!categoryExists) {
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

    const stmt = db.prepare(
      "INSERT INTO clothing_items (user_id, name, category, description, image_path, price, purchase_date) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *"
    );

    const item = stmt.get(
      session.user_id,
      name,
      category,
      description || null,
      imagePath,
      price ? parseFloat(price) : null,
      purchaseDate || null
    );

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Create clothing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
