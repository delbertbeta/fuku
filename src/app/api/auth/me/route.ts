import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json({ user: null });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const db = require("@/lib/db").getDb();
    const user = await db
      .prepare("SELECT id, email FROM users WHERE id = ?")
      .get([session.user_id]);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ user: null });
  }
}
