import { NextRequest, NextResponse } from "next/server";
import { SOURCES } from "@/lib/config";
import { checkAccess } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const denied = checkAccess(request); if (denied) return denied;
  return NextResponse.json({ ok: true, sources: SOURCES.map((source) => ({ ...source, capabilities: source.id === "anilist" ? ["search", "info", "relations"] : ["public-page-metadata"] })) });
}
