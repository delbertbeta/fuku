import { NextResponse } from "next/server";

export async function GET() {
  const allowRegistration = process.env.ALLOW_REGISTRATION !== "false";

  return NextResponse.json({ allowed: allowRegistration });
}
