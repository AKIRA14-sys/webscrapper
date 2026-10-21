import { NextRequest, NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function checkAccess(request: NextRequest): NextResponse | null {
  const token = process.env.API_ACCESS_TOKEN;
  if (!token) return null;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (supplied !== token) return jsonError("Unauthorized. Provide a valid Bearer token.", 401);
  return null;
}

export function parsePositiveInt(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
