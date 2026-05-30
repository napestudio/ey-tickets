import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export function validateSuperadminRequest(
  req: NextRequest
): NextResponse | null {
  const apiKey = process.env.SUPERADMIN_API_KEY;

  if (!apiKey) {
    console.error("[superadmin] SUPERADMIN_API_KEY is not configured");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return NextResponse.json(
      { error: "Missing authorization header" },
      { status: 401 }
    );
  }

  const expected = Buffer.from(apiKey, "utf-8");
  const received = Buffer.from(token, "utf-8");

  const valid =
    expected.length === received.length &&
    timingSafeEqual(expected, received);

  return valid
    ? null
    : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
