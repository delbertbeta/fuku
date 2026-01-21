import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  date: z.string().min(1),
  outfit_id: z.number().int().positive(),
});

const deleteSchema = z.object({
  date: z.string().min(1),
  outfit_id: z.number().int().positive(),
});

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);

const shanghaiFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatShanghaiDate(date: Date): string {
  const parts = shanghaiFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) {
    throw new Error("Invalid date parts");
  }
  return `${year}-${month}-${day}`;
}

function normalizeShanghaiDate(input: string): string | null {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input)
    ? new Date(`${input}T00:00:00+08:00`)
    : new Date(input);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatShanghaiDate(date);
}

function normalizeEntryDate(dateValue: unknown): string | null {
  if (typeof dateValue === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    const parsed = new Date(dateValue);
    if (!Number.isNaN(parsed.getTime())) {
      return formatShanghaiDate(parsed);
    }
    return null;
  }

  if (dateValue instanceof Date) {
    return formatShanghaiDate(dateValue);
  }

  return null;
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
    const month = searchParams.get("month");
    if (!month || !monthSchema.safeParse(month).success) {
      return NextResponse.json({ error: "Invalid month" }, { status: 400 });
    }

    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr);
    const lastDay = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
    const startDate = `${month}-01`;
    const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;

    const db = getDb();
    const stmt = db.prepare(
      `
        SELECT oc.date, oc.outfit_id, o.name, o.description,
               ci.image_path as item_image
        FROM outfit_calendar oc
        JOIN outfits o ON oc.outfit_id = o.id
        LEFT JOIN outfit_items oi ON o.id = oi.outfit_id
        LEFT JOIN clothing_items ci ON oi.clothing_id = ci.id
        WHERE oc.user_id = ? AND oc.date BETWEEN ? AND ?
        ORDER BY oc.date ASC, o.created_at DESC
      `
    );
    const entries = await stmt.all([session.user_id, startDate, endDate]);
    const entryMap = new Map<string, any>();

    for (const entry of entries as any[]) {
      const dateValue = normalizeEntryDate(entry.date) ?? entry.date;
      const key = `${dateValue}-${entry.outfit_id}`;
      if (!entryMap.has(key)) {
        entryMap.set(key, {
          date: dateValue,
          outfit_id: entry.outfit_id,
          name: entry.name,
          description: entry.description,
          preview_images: [],
        });
      }
      if (entry.item_image) {
        entryMap.get(key).preview_images.push(entry.item_image);
      }
    }

    const normalizedEntries = Array.from(entryMap.values());

    return NextResponse.json({ entries: normalizedEntries });
  } catch (error) {
    console.error("Get calendar entries error:", error);
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
    const result = createSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const normalizedDate = normalizeShanghaiDate(result.data.date);
    if (!normalizedDate) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const db = getDb();
    const outfitStmt = db.prepare(
      "SELECT id FROM outfits WHERE id = ? AND user_id = ?"
    );
    const outfit = await outfitStmt.get([
      result.data.outfit_id,
      session.user_id,
    ]);
    if (!outfit) {
      return NextResponse.json({ error: "Invalid outfit" }, { status: 400 });
    }

    const insertSql =
      process.env.DATABASE_TYPE === "mariadb"
        ? "INSERT IGNORE INTO outfit_calendar (user_id, date, outfit_id) VALUES (?, ?, ?)"
        : "INSERT OR IGNORE INTO outfit_calendar (user_id, date, outfit_id) VALUES (?, ?, ?)";
    const insertStmt = db.prepare(insertSql);
    const insertResult = await insertStmt.run([
      session.user_id,
      normalizedDate,
      result.data.outfit_id,
    ]);

    if (insertResult.changes === 0) {
      return NextResponse.json({ error: "Already exists" }, { status: 409 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Create calendar entry error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const result = deleteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const normalizedDate = normalizeShanghaiDate(result.data.date);
    if (!normalizedDate) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(
      "DELETE FROM outfit_calendar WHERE user_id = ? AND date = ? AND outfit_id = ?"
    );
    const resultDelete = await stmt.run([
      session.user_id,
      normalizedDate,
      result.data.outfit_id,
    ]);

    if (resultDelete.changes === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete calendar entry error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
