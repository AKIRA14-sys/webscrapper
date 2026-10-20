import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({ ok: true, service: "anizen-scraper-api", version: "1.1.0", timestamp: new Date().toISOString() });
}
