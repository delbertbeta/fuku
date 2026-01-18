import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { z } from "zod";

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
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const db = getDb();

    const categoryStmt = db.prepare(
      "SELECT id, is_system FROM clothing_categories WHERE id = ? AND user_id = ?"
    );
    const category = (await categoryStmt.get([
      categoryId,
      session.user_id,
    ])) as any;

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (category.is_system === 1) {
      return NextResponse.json(
        { error: "Cannot delete system categories" },
        { status: 403 }
      );
    }

    const uncategorizedStmt = db.prepare(
      "SELECT id FROM clothing_categories WHERE user_id = ? AND name = 'uncategorized'"
    );
    const uncategorized = (await uncategorizedStmt.get([
      session.user_id,
    ])) as any;

    if (!uncategorized) {
      return NextResponse.json(
        { error: "Uncategorized category not found" },
        { status: 500 }
      );
    }

    const categoryStmt2 = db.prepare(
      "SELECT name FROM clothing_categories WHERE id = ?"
    );
    const categoryInfo = (await categoryStmt2.get([categoryId])) as any;

    const itemCountStmt = db.prepare(
      "SELECT COUNT(*) as count FROM clothing_items WHERE category = ? AND user_id = ?"
    );
    const itemCount = (await itemCountStmt.get([
      categoryInfo?.name,
      session.user_id,
    ])) as any;

    const updateStmt = db.prepare(
      "UPDATE clothing_items SET category = 'uncategorized' WHERE category = (SELECT name FROM clothing_categories WHERE id = ?) AND user_id = ?"
    );
    const updateResult = await updateStmt.run([categoryId, session.user_id]);

    const deleteStmt = db.prepare(
      "DELETE FROM clothing_categories WHERE id = ? AND user_id = ?"
    );
    await deleteStmt.run([categoryId, session.user_id]);

    return NextResponse.json({
      message: "Category deleted successfully",
      affectedItems: updateResult.changes,
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
