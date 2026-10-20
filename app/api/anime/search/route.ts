import { NextRequest, NextResponse } from "next/server";
import { searchAniList } from "@/lib/anilist";
import { SOURCES } from "@/lib/config";
import { checkAccess } from "@/lib/http";
import { scrapePublicPage } from "@/lib/scraper";
export const runtime = "nodejs";
export const maxDuration = 20;
export async function GET(request: NextRequest) {
  const denied = checkAccess(request); if (denied) return denied;
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim();
  const source = params.get("source") || "anilist";
  const limit = Math.min(Math.max(Number(params.get("limit") || 10), 1), 20);
  if (!q) return NextResponse.json({ ok: false, error: "Missing q parameter." }, { status: 400 });
  if (q.length > 100) return NextResponse.json({ ok: false, error: "Search query too long." }, { status: 400 });
  try {
    if (source === "anilist") {
      const results = await searchAniList(q, limit);
      return NextResponse.json({ ok: true, source, query: q, count: results.length, results });
    }
    const selected = source === "all" ? SOURCES.filter((item) => item.id !== "anilist") : SOURCES.filter((item) => item.id === source && item.id !== "anilist");
    if (source !== "all" && !selected.length) return NextResponse.json({ ok: false, error: "Unknown source." }, { status: 400 });
    const settled = await Promise.allSettled(selected.map((item) => scrapePublicPage(item.id, undefined, q)));
    const results = settled.flatMap((r) => r.status === "fulfilled" ? r.value.links.map((link) => ({ source: r.value.source, ...link })) : []);
    const errors = settled.flatMap((r, i) => r.status === "rejected" ? [{ source: selected[i].id, error: r.reason instanceof Error ? r.reason.message : "Source failed" }] : []);
    return NextResponse.json({ ok: true, source, query: q, count: results.length, results: results.slice(0, limit), sourceErrors: errors });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Search failed" }, { status: 502 });
  }
}
